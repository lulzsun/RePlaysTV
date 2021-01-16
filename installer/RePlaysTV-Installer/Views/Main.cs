using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Windows.Forms;
using RePlaysTV_Installer.Settings;

namespace RePlaysTV_Installer.Views
{
    public partial class Main : Form
    {
        private static Main _mainForm;
        private static readonly Options OptionsForm = new Options();
        private CommandLineProcess _mainCommandLineProcess;

        public Main()
        {
            InitializeComponent();
            Load += OnLoad;
            FormClosing += OnFormClosing;
            _mainForm = this;
        }

        private void OnLoad(object sender, EventArgs e)
        {
            _mainForm.Text =
                $"RePlaysTV {InstallerSettings.GetInstallerSetting<string>(InstallerSetting.Version)} Installer";
            _mainForm.WindowState = FormWindowState.Minimized;
            _mainForm.Show();
            _mainForm.WindowState = FormWindowState.Normal;

            _mainCommandLineProcess = new CommandLineProcess(null);
            _mainCommandLineProcess.StartCommandLineProcess();
            _mainCommandLineProcess.SetupStreamWriterWithEncoding();
        }

        private async void Button1_Click(object sender, EventArgs e)
        {
            _mainForm.TopMost = true;
            var dr1 = MessageBox.Show("This automated Process can take up to 10 minutes or more.\n" +
                                      "Please have at least ~1.5GB of disk space available." +
                                      "\nPress Yes to start install.", "RePlaysTV Installer",
                MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 != DialogResult.Yes)
            {
                _mainForm.TopMost = false;
                return;
            }

            await Task.Factory.StartNew(_mainCommandLineProcess.ExecuteMainTaskAsync);
        }

        public static void Log(string msg)
        {
            if (string.IsNullOrWhiteSpace(msg))
            {
                return;
            }

            if (_mainForm != null)
            {
                _mainForm.AppendToLogTextBox($"[{DateTime.Now:h: mm:ss tt}]{msg}");
                return;
            }

            Console.WriteLine($"[{DateTime.Now:h: mm:ss tt}]{msg}");
        }

        private void AppendToLogTextBox(string value)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<string>(AppendToLogTextBox), value);
                return;
            }

            richTextBox1.AppendText($"{Environment.NewLine}{value}");
        }

        private void Button2_Click(object sender, EventArgs e)
        {
            OptionsForm.ShowDialog(this);
        }

        private void Button3_Click(object sender, EventArgs e)
        {
            Clipboard.SetText(_mainForm.richTextBox1.Text);
        }

        public static void InstallComplete()
        {
            ShowMessageBox("Installation Complete!", "RePlaysTV Installer");
        }

        public static void ShowMessageBox(
            string message,
            string caption = null,
            MessageBoxButtons messageBoxButtons = MessageBoxButtons.OK,
            MessageBoxIcon messageBoxIcon = MessageBoxIcon.Information)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            if (_mainForm != null)
            {
                _mainForm.ShowMessageBox(message, messageBoxButtons, messageBoxIcon, caption);
                return;
            }

            Console.WriteLine(message);
        }

        private void ShowMessageBox(
            string message,
            MessageBoxButtons messageBoxButtons,
            MessageBoxIcon messageBoxIcon,
            string caption)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<string, MessageBoxButtons, MessageBoxIcon, string>(ShowMessageBox), message,
                    messageBoxButtons, messageBoxIcon, caption);
                return;
            }

            _mainForm.TopMost = true;
            MessageBox.Show(message, caption, messageBoxButtons, messageBoxIcon);
            _mainForm.TopMost = false;
        }

        private void OnFormClosing(object sender, FormClosingEventArgs e)
        {
            _mainCommandLineProcess.Dispose();
            Application.Exit();
        }

        private void LinkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            Process.Start("https://github.com/lulzsun/RePlaysTV");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                if (components != null)
                {
                    components?.Dispose();
                    _mainCommandLineProcess?.Dispose();
                }

            // Dispose stuff here

            base.Dispose(disposing);
        }
    }
}