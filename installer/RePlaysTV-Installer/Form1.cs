using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace RePlaysTV_Installer {
    public partial class Form1 : Form {
        public string VERSION;

        public static Process p;
        public static StreamWriter SW;
        public static Form1 form1;
        public Form1(string _VERSION) {
            VERSION = _VERSION;

            InitializeComponent();
            form1 = this;
        }
        private void Form1_Load(object sender, EventArgs e) {
            form1.Text = "RePlaysTV " + VERSION + " Installer";

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
        }
        private async void Button1_Click(object sender, EventArgs e) {
            form1.TopMost = true;
            DialogResult dr1 = MessageBox.Show("This automated process can take up to 10 minutes or more.\n" +
                                                "Please have at least ~1.5GB of disk space available." +
                                                "\nPress Yes to start install.", "RePlaysTV Installer", MessageBoxButtons.YesNoCancel,MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {
                await Installer.DownloadSetup(form1.richTextBox1);
                Installer.ListInstalledAntivirusProducts(form1.richTextBox1);
                Installer.StartExtract(SW);
            }
            form1.TopMost = false;
        }

        private void Button3_Click(object sender, EventArgs e) {
            Clipboard.SetText(form1.richTextBox1.Text);
        }
        private void InstallComplete() {
            form1.TopMost = true;
            MessageBox.Show("Installation Complete!", "RePlaysTV Installer", MessageBoxButtons.OK, MessageBoxIcon.Information);
            form1.TopMost = false;
        }
        private static bool startImport = false;
        private static void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine) {
            if (!String.IsNullOrEmpty(outLine.Data)) {
                if (form1.richTextBox1.InvokeRequired) {
                    form1.richTextBox1.Invoke(new MethodInvoker(delegate {
                        if (outLine.Data.Contains("All rights reserved.")) {
                            form1.richTextBox1.Text = "[" + DateTime.Now.ToString("h:mm:ss tt") + "] Ready";
                        } else if (outLine.Data.Contains("We will now attempt to import: ") && !startImport) { //part two of installation
                            var enterThread = new Thread(
                            new ThreadStart(
                                () => {
                                    Installer.StartImport(SW);
                                    form1.Invoke(new MethodInvoker(delegate {
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                                    }));
                                }
                            ));
                            startImport = true;
                            enterThread.Start();
                        } else {
                            if (outLine.Data.Contains("npm install") || (outLine.Data.Contains("electron-forge package") && !outLine.Data.Contains("\"electron-forge package\"")) || outLine.Data.Contains("asar extract")) {
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                            }
                            if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                                Installer.StartModify(SW, form1.VERSION);
                            }
                            if (outLine.Data.Contains("npm ERR!") || outLine.Data.Contains("unhandled error") || outLine.Data.Contains("Error: ")) {
                                form1.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("An unhandled error has occurred during the install, It is possible that the installation has failed.\nTry restarting your computer and turn off anti-virus before installing.\n\nReport this issue by copying the logs and sending it to a developer.");
                                form1.TopMost = false;
                            }
                            if (outLine.Data.Contains("'nodejs-portable.exe' is not recognized")) {
                                form1.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("'nodejs-portable.exe' is missing from the working directory.\n\nMake sure you properly extracted the installer to a folder.");
                                form1.TopMost = false;
                            }
                            if (outLine.Data.Contains(">exit")) {
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] Installation Complete!");
                                form1.Invoke(new MethodInvoker(delegate { form1.InstallComplete(); }));
                            }
                            form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + outLine.Data.ToString());
                        }
                    }));
                }
            }
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e) {
            p.Kill();
        }

        private void LinkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
            Process.Start("https://github.com/lulzsun/RePlaysTV");
        }
    }
}
