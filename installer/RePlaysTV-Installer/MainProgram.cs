using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using RePlaysTV_Installer.Settings;
using RePlaysTV_Installer.Views;

namespace RePlaysTV_Installer
{
    internal static class MainProgram
    {
        [STAThread]
        private static async Task Main(string[] args)
        {
            ActivateGlobalExceptionHandling();
            InstallerSettings.SetInstallerSetting(InstallerSetting.Version, Application.ProductVersion);

            if (args.Length == 0)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Main());
                return;
            }

            var workDirectory = args[0]; //args[0] - working dir passed from replays client
            using (var commandLineProcess = new CommandLineProcess(workDirectory))
            {
                commandLineProcess.StartCommandLineProcess();
                commandLineProcess.SetupStreamWriterWithEncoding();

                await Task.Factory.StartNew(commandLineProcess.ExecuteMainTaskAsync);
            }
        }

        private static void ActivateGlobalExceptionHandling()
        {
            // Add the event handler for handling UI thread exceptions to the event.
            Application.ThreadException += UIThreadException;

            // Set the unhandled exception mode to force all Windows Forms errors to go through
            // our handler.
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);

            // Add the event handler for handling non-UI thread exceptions to the event.
            AppDomain.CurrentDomain.UnhandledException += UnhandledException;
        }


        // Handle the UI exceptions by showing a dialog box, and asking the user whether
        // or not they wish to abort execution.
        private static void UIThreadException(object sender, ThreadExceptionEventArgs t)
        {
            var result = DialogResult.Cancel;
            try
            {
                result = ShowThreadExceptionDialog("Windows Forms Error", t.Exception);
            }
            catch
            {
                try
                {
                    MessageBox.Show("Fatal Windows Forms Error", "Fatal Windows Forms Error", MessageBoxButtons.AbortRetryIgnore, MessageBoxIcon.Stop);
                }
                finally
                {
                    Application.Exit();
                }
            }

            // Exits the program when the user clicks Abort.
            if (result == DialogResult.Abort)
            {
                Application.Exit();
            }
        }

        // Handle the UI exceptions by showing a dialog box, and asking the user whether
        // or not they wish to abort execution.
        // NOTE: This exception cannot be kept from terminating the application - it can only
        // log the event, and inform the user about it.
        private static void UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            try
            {
                var ex = (Exception)e.ExceptionObject;
                var errorMessage = $"An application error occurred. Please contact the adminstrator with the following information:{Environment.NewLine}{Environment.NewLine}";

                // Since we can't prevent the app from terminating, log this to the event log.
                if (!EventLog.SourceExists("ThreadException"))
                {
                    EventLog.CreateEventSource("ThreadException", "Application");
                }

                // Create an EventLog instance and assign its source.
                var myLog = new EventLog { Source = "ThreadException" };
                myLog.WriteEntry($"{errorMessage}{ex.Message}{Environment.NewLine}{Environment.NewLine}Stack Trace:{Environment.NewLine}{ex.StackTrace}");
            }
            catch (Exception)
            {
                try
                {
                    MessageBox.Show("Fatal Non-UI Error. Could not write the error to the event log. Reason: {exc.Message}", "Fatal Non-UI Error", MessageBoxButtons.OK, MessageBoxIcon.Stop);
                }
                finally
                {
                    Application.Exit();
                }
            }
        }

        // Creates the error message and displays it.
        private static DialogResult ShowThreadExceptionDialog(string title, Exception e)
        {
            var errorMsg = $"An application error occurred. Please contact the adminstrator with the following information:{Environment.NewLine}{Environment.NewLine}";
            errorMsg = $"{errorMsg}{e.Message}{Environment.NewLine}{Environment.NewLine}Stack Trace:{Environment.NewLine}{e.StackTrace}";
            return MessageBox.Show(errorMsg, title, MessageBoxButtons.AbortRetryIgnore, MessageBoxIcon.Stop);
        }
    }
}