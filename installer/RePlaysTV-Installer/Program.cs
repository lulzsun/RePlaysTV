using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace RePlaysTV_Installer {

    static class Program {
        public const string VERSION = "3.0.3";
        //public static string playsDirectory = Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays";
        public static string workDirectory = null;

        public static Process p;
        public static StreamWriter SW;
        public static ManualResetEvent mre = new ManualResetEvent(false);

        [STAThread]
        static void Main(string[] args) {
            if (args.Length == 0) {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Main(VERSION));
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
 
                workDirectory = args[0];  //args[0] - working dir passed from replays client
                //await Installer.DownloadSetup();
                Installer.ListInstalledAntivirusProducts();
                Installer.StartExtract(SW, workDirectory);
                mre.WaitOne();
            }
        }

        private static bool startImport = false;
        private static void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine) {
            if (!String.IsNullOrEmpty(outLine.Data)) {
                if (outLine.Data.Contains("All rights reserved.")) {
                    Console.WriteLine("Installer Ready");
                } else if (outLine.Data.Contains("We will now attempt to import: ") && !startImport) { //part two of installation
                    var enterThread = new Thread(
                    new ThreadStart(
                        () => {
                            Installer.StartImport(SW);
                        }
                    ));
                    startImport = true;
                    enterThread.Start();
                } else {
                    if (outLine.Data.Contains("npm install") || (outLine.Data.Contains("electron-forge package") && !outLine.Data.Contains("\"electron-forge package\"")) || outLine.Data.Contains("asar extract")) {
                        //Console.WriteLine("This next process will take awhile (with no sign of progress)... Please be patient.");
                    }
                    if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                        Installer.StartModify(SW, VERSION, workDirectory);
                    }
                    if (outLine.Data.Contains("npm ERR!") || outLine.Data.Contains("unhandled error") || outLine.Data.Contains("Error: ")) {
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
