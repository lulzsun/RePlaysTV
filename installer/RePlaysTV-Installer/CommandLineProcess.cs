using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using RePlaysTV_Installer.Views;

namespace RePlaysTV_Installer
{
    internal sealed class CommandLineProcess : IDisposable
    {
        private readonly string _workDirectory;
        private bool _startImport;

        public CommandLineProcess(string workDirectory)
        {
            _workDirectory = string.IsNullOrEmpty(workDirectory) ? null : workDirectory;
            Process = new Process
            {
                StartInfo =
                {
                    FileName = "cmd.exe",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    StandardOutputEncoding = Encoding.UTF8,
                    StandardErrorEncoding = Encoding.UTF8
                }
            };

            Process.OutputDataReceived += SortOutputHandler;
            Process.ErrorDataReceived += SortOutputHandler;
        }

        private Process Process { get; }

        private StreamWriter StreamWriter { get; set; }

        public void Dispose()
        {
            Process?.Dispose();
            StreamWriter?.Dispose();
        }

        public async void SetupStreamWriterWithEncoding(string encoding = "chcp 65001")
        {
            if (string.IsNullOrWhiteSpace(encoding)) throw new ArgumentException(nameof(encoding));

            StreamWriter = Process?.StandardInput;

            if (StreamWriter == null)
                throw new InvalidOperationException(
                    "There was a problem with initializing the stream writer for the command line process.");

            await StreamWriter?.WriteLineAsync(encoding);
        }

        public void StartCommandLineProcess()
        {
            // run as console app
            Main.Log("Initializing Updater");

            if (Process == null)
                throw new InvalidOperationException(
                    "The command line for the whole execution was not initialized correct.");

            Process.Start();
            Process.BeginOutputReadLine();
            Process.BeginErrorReadLine();
        }

        private async void SortOutputHandler(object sendingProcess, DataReceivedEventArgs dataReceivedEventArgs)
        {
            if (string.IsNullOrEmpty(dataReceivedEventArgs.Data))
            {
                return;
            }

            if (dataReceivedEventArgs.Data.Contains("All rights reserved."))
            {
                Main.Log("Ready");
            }
            else if (dataReceivedEventArgs.Data.Contains("We will now attempt to import: ") && !_startImport)
            {
                //part two of installation
                _startImport = true;
                await Installer.StartImport(StreamWriter);
                Main.Log("=======================================");
                Main.Log("=======================================");
                Main.Log("=======================================");
                Main.Log("This next Process will take awhile (with no sign of progress)... Please be patient.");
                ;
            }
            else
            {
                if (dataReceivedEventArgs.Data.Contains("npm install") ||
                    dataReceivedEventArgs.Data.Contains("electron-forge package") &&
                    !dataReceivedEventArgs.Data.Contains("\"electron-forge package\"") ||
                    dataReceivedEventArgs.Data.Contains("asar extract"))
                {
                    Main.Log("=======================================");
                    Main.Log("=======================================");
                    Main.Log("=======================================");
                    Main.Log(
                        $"[{DateTime.Now:h:mm:ss tt}] This next Process will take awhile (with no sign of progress)... Please be patient.");
                    ;
                }

                if (dataReceivedEventArgs.Data.Contains("Thanks for using ") && dataReceivedEventArgs.Data.Contains("electron-forge"))
                {
                    await Installer.StartModify(StreamWriter);
                }

                if (dataReceivedEventArgs.Data.Contains("npm ERR!") ||
                    dataReceivedEventArgs.Data.Contains("unhandled error") ||
                    dataReceivedEventArgs.Data.Contains("Error: "))
                {
                    var message =
                        "An unhandled error has occurred during the install, It is possible that the installation has failed.\nTry restarting your computer and turn off anti-virus before installing.\n\nReport this issue by copying the logs and sending it to a developer.";
                    Main.ShowMessageBox(message);
                }

                if (dataReceivedEventArgs.Data.Contains("'nodejs-portable.exe' is not recognized"))
                {
                    var message =
                        "'nodejs-portable.exe' is missing from the working directory.\n\nMake sure you properly extracted the installer to a folder.";
                    Main.ShowMessageBox(message);
                }

                if (dataReceivedEventArgs.Data.Contains(">exit"))
                {
                    Main.Log("=======================================");
                    Main.Log("=======================================");
                    Main.Log("=======================================");
                    Main.Log("Installation Complete!");
                    Main.InstallComplete();
                }

                Main.Log(dataReceivedEventArgs.Data);
            }
        }

        public async Task ExecuteMainTaskAsync()
        {
            if ((StreamWriter == null) | !await Installer.DownloadPlaysSetup(_workDirectory))
            {
                return;
            }

            Installer.ListInstalledAntivirusProducts();
            await Installer.StartExtract(StreamWriter, _workDirectory);
        }
    }
}