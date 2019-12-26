using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace RePlaysTV_Installer {

    static class Program {
        public static string VERSION = "3.0.1";
        public static string playsDirectory = Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays";

        public static Process p;
        public static StreamWriter SW;
        public static bool startImport = false;
        static void Main(string[] args) {
            if (args.Length == 0) {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Form1(VERSION, playsDirectory));
            } 
            else {
                // run as console app
                Console.WriteLine("Initializing Updater");

                p = new Process();

                p.StartInfo.FileName = "cmd.exe";
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.CreateNoWindow = true;
                p.StartInfo.RedirectStandardInput = true;
                p.StartInfo.RedirectStandardOutput = true;
                p.StartInfo.RedirectStandardError = true;

                p.OutputDataReceived += new DataReceivedEventHandler(SortOutputHandler);
                p.ErrorDataReceived += new DataReceivedEventHandler(SortOutputHandler);

                p.Start();

                SW = p.StandardInput;

                p.BeginOutputReadLine();
                p.BeginErrorReadLine();

                if (Directory.Exists(playsDirectory + "\\app-3.0.0")) {
                    Installer.StartExtract(SW, playsDirectory);
                    new ManualResetEvent(false).WaitOne();
                }
                else {
                    Console.WriteLine("Missing app-3.0.0");
                }
            }
        }

        private static void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine) {
            if (!String.IsNullOrEmpty(outLine.Data)) {
                if (outLine.Data.Contains("All rights reserved.")) {
                    Console.WriteLine("[" + DateTime.Now.ToString("h:mm:ss tt") + "] Ready");
                } else if (outLine.Data.Contains("We will now attempt to import: ") && !startImport) { //part two of installation
                    var enterThread = new Thread(
                    new ThreadStart(
                        () => {
                            Installer.StartImport(SW, playsDirectory, VERSION);
                            Console.WriteLine(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                        }
                    ));
                    startImport = true;
                    enterThread.Start();
                } else {
                    if (outLine.Data.Contains("npm install") || outLine.Data.Contains("electron-forge package") || outLine.Data.Contains("asar extract")) {
                        Console.WriteLine(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                    }
                    if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                        Installer.StartModify(SW, playsDirectory, VERSION);
                    }
                    if (outLine.Data.Contains("npm ERR!")) {
                        System.Windows.Forms.MessageBox.Show("An unhandled error has occurred during the install, It is possible that the installation has corrupted.\nTry restarting your computer and turn off anti-virus before installing.\n\nReport this issue by copying the logs and sending it to a developer.");
                    }
                    if (outLine.Data.Contains(">exit")) {
                        Console.WriteLine(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] Installation Complete!");
                    }
                    Console.WriteLine(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + outLine.Data.ToString());
                }
            }
        }
    }
}
