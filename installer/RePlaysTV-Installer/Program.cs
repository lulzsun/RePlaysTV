using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace RePlaysTV_Installer {

    static class Program {
        public static string playsDirectory = Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays";

        public static Process p;
        public static StreamWriter SW;
        public static ManualResetEvent mre = new ManualResetEvent(false);
        static void Main(string[] args) {
            if (args.Length == 0) {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Form1(playsDirectory));
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
                    Installer.StartExtract(SW, playsDirectory, args[0]); //args[0] - working dir passed from replays client
                    mre.WaitOne();
                }
                else {
                    Console.WriteLine("Missing app-3.0.0");
                    Environment.Exit(-1);
                }
            }
        }

        private static void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine) {
            if (!String.IsNullOrEmpty(outLine.Data)) {
                if (outLine.Data.Contains("All rights reserved.")) {
                    Console.WriteLine("Installer Ready");
                } else if (outLine.Data.Contains("We will now attempt to import: ")) { //part two of installation
                    Installer.StartImport(SW, playsDirectory);
                } else {
                    if (outLine.Data.Contains("npm install") || outLine.Data.Contains("electron-forge package") || outLine.Data.Contains("asar extract")) {
                        Console.WriteLine("This next process will take awhile (with no sign of progress)... Please be patient.");
                    }
                    if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                        Installer.StartModify(SW, playsDirectory);
                    }
                    if (outLine.Data.Contains("npm ERR!")) {
                        Console.WriteLine("An unhandled error has occurred during the install.");
                        Environment.Exit(-1);
                    }
                    if (outLine.Data.Contains("'nodejs-portable.exe' is not recognized")) {
                        Console.WriteLine("'nodejs-portable.exe' is missing from the working directory.");
                        Environment.Exit(-1);
                    }
                    if (outLine.Data.Contains(">exit")) {
                        Console.WriteLine("Installation Complete!");
                        mre.Set();
                    }
                    Console.WriteLine(outLine.Data.ToString());
                }
            }
        }
    }
}
