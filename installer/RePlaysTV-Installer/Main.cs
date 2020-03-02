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
    public partial class Main : Form {
        public string VERSION;

        public static Process p;
        public static StreamWriter SW;
        public static Main mainForm;
        public static Options optionsForm = new Options();
        public Main(string _VERSION) {
            VERSION = _VERSION;

            InitializeComponent();
            mainForm = this;
        }
        private void Main_Load(object sender, EventArgs e) {
            mainForm.Text = "RePlaysTV " + VERSION + " Installer";
            mainForm.WindowState = FormWindowState.Minimized;
            mainForm.Show();
            mainForm.WindowState = FormWindowState.Normal;

            p = new Process();

            p.StartInfo.FileName = "cmd.exe";
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.CreateNoWindow = true;
            p.StartInfo.RedirectStandardInput = true;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.RedirectStandardError = true;
            p.StartInfo.StandardOutputEncoding = Encoding.UTF8;
            p.StartInfo.StandardErrorEncoding = Encoding.UTF8;

            p.OutputDataReceived += new DataReceivedEventHandler(SortOutputHandler);
            p.ErrorDataReceived += new DataReceivedEventHandler(SortOutputHandler);

            p.Start();

            SW = p.StandardInput;
            SW.WriteLine("chcp 65001"); //set encoding

            p.BeginOutputReadLine();
            p.BeginErrorReadLine();
        }

        private async void Button1_Click(object sender, EventArgs e) {
            mainForm.TopMost = true;
            DialogResult dr1 = MessageBox.Show("This automated process can take up to 10 minutes or more.\n" +
                                                "Please have at least ~1.5GB of disk space available." +
                                                "\nPress Yes to start install.", "RePlaysTV Installer", MessageBoxButtons.YesNoCancel,MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {
                await Installer.DownloadSetup(mainForm.richTextBox1);
                Installer.ListInstalledAntivirusProducts(mainForm.richTextBox1);
                Installer.StartExtract(SW);
            }
            mainForm.TopMost = false;
        }

        private void Button2_Click(object sender, EventArgs e) {
            optionsForm.ShowDialog();
        }

        private void Button3_Click(object sender, EventArgs e) {
            Clipboard.SetText(mainForm.richTextBox1.Text);
        }
        private void InstallComplete() {
            mainForm.TopMost = true;
            MessageBox.Show("Installation Complete!", "RePlaysTV Installer", MessageBoxButtons.OK, MessageBoxIcon.Information);
            mainForm.TopMost = false;
        }
        private static bool startImport = false;
        private static void SortOutputHandler(object sendingProcess, DataReceivedEventArgs outLine) {
            if (!String.IsNullOrEmpty(outLine.Data)) {
                if (mainForm.richTextBox1.InvokeRequired) {
                    mainForm.richTextBox1.Invoke(new MethodInvoker(delegate {
                        if (outLine.Data.Contains("All rights reserved.")) {
                            mainForm.richTextBox1.Text = "[" + DateTime.Now.ToString("h:mm:ss tt") + "] Ready";
                        } else if (outLine.Data.Contains("We will now attempt to import: ") && !startImport) { //part two of installation
                            var enterThread = new Thread(
                            new ThreadStart(
                                () => {
                                    Installer.StartImport(SW);
                                    mainForm.Invoke(new MethodInvoker(delegate {
                                        mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        mainForm.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                                    }));
                                }
                            ));
                            startImport = true;
                            enterThread.Start();
                        } else {
                            if (outLine.Data.Contains("npm install") || (outLine.Data.Contains("electron-forge package") && !outLine.Data.Contains("\"electron-forge package\"")) || outLine.Data.Contains("asar extract")) {
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                            }
                            if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                                Installer.StartModify(SW, mainForm.VERSION, null, mainForm.richTextBox1);
                            }
                            if (outLine.Data.Contains("npm ERR!") || outLine.Data.Contains("unhandled error") || outLine.Data.Contains("Error: ")) {
                                mainForm.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("An unhandled error has occurred during the install, It is possible that the installation has failed.\nTry restarting your computer and turn off anti-virus before installing.\n\nReport this issue by copying the logs and sending it to a developer.");
                                mainForm.TopMost = false;
                            }
                            if (outLine.Data.Contains("'nodejs-portable.exe' is not recognized")) {
                                mainForm.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("'nodejs-portable.exe' is missing from the working directory.\n\nMake sure you properly extracted the installer to a folder.");
                                mainForm.TopMost = false;
                            }
                            if (outLine.Data.Contains(">exit")) {
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                mainForm.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] Installation Complete!");
                                mainForm.Invoke(new MethodInvoker(delegate { mainForm.InstallComplete(); }));
                            }
                            mainForm.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + outLine.Data.ToString());
                        }
                    }));
                }
            }
        }

        private void Main_FormClosing(object sender, FormClosingEventArgs e) {
            p.Kill();
        }

        private void LinkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
            Process.Start("https://github.com/lulzsun/RePlaysTV");
        }
    }
}
