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
        public string playsDirectory;

        public static Process p;
        public static StreamWriter SW;
        public static Form1 form1;
        public Form1(string _playsDirectory, string _VERSION) {
            playsDirectory = _playsDirectory;
            VERSION = _VERSION;

            InitializeComponent();
            form1 = this;
        }
        private void Form1_Load(object sender, EventArgs e) {
            if (Directory.Exists(playsDirectory)) {
                textBox1.Text = playsDirectory;
            }
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
        private void Button1_Click(object sender, EventArgs e) {
            form1.TopMost = true;
            DialogResult dr1 = MessageBox.Show("This automated process can take up to 10 minutes or more.\n" +
                                                "Make sure the last latest version of Plays is installed and not currently open." +
                                                "\nPress Yes to start install.", "RePlaysTV Installer", MessageBoxButtons.YesNoCancel,MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {
                if (Directory.Exists(playsDirectory + "\\app-3.0.0")) {
                    Installer.ListInstalledAntivirusProducts(form1.richTextBox1);
                    Installer.StartExtract(SW, playsDirectory);
                    button1.Enabled = false;
                    button2.Enabled = false;
                }
                else {
                    DialogResult dr2 = MessageBox.Show("You are missing the original Plays client files.\n" +
                                    "In order for Replays to install, it requires you to have Plays 3.0.0 installed." +
                                    "\nWould you like to be taken to the download page?", "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
                    if (dr2 == DialogResult.Yes) {
                        Process.Start("https://drive.google.com/file/d/1YlQ-EU6wW8XvGUznIBrSqTvlzBv-6tkQ/view");
                    }
                }
            }
            form1.TopMost = false;
        }
        private void Button2_Click(object sender, EventArgs e) {
            var fbd = new FolderBrowserDialog {
                RootFolder = Environment.SpecialFolder.Desktop,
                SelectedPath = Environment.GetEnvironmentVariable("LocalAppData")
            };
            using (fbd) {
                DialogResult result = fbd.ShowDialog();

                if (result == DialogResult.OK) {
                    textBox1.Text = fbd.SelectedPath;
                    playsDirectory = fbd.SelectedPath;
                }
            }
        }

        private void Button3_Click(object sender, EventArgs e) {
            Clipboard.SetText(form1.richTextBox1.Text);
        }
        private void InstallComplete() {
            form1.TopMost = true;
            DialogResult dr = MessageBox.Show("Installation Complete!\n\nOpen Replays?", "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr == DialogResult.Yes) {
                Process.Start(playsDirectory + "\\app-3.0.1\\Plays.exe");
            }
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
                                    Installer.StartImport(SW, form1.playsDirectory);
                                    form1.Invoke(new MethodInvoker(delegate {
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                        form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                                        form1.richTextBox1.ScrollToCaret();
                                    }));
                                }
                            ));
                            form1.richTextBox1.ScrollToCaret();
                            startImport = true;
                            enterThread.Start();
                        } else {
                            if (outLine.Data.Contains("npm install") || outLine.Data.Contains("electron-forge package") || outLine.Data.Contains("asar extract")) {
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "=======================================");
                                form1.richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] This next process will take awhile (with no sign of progress)... Please be patient.");
                            }
                            if (outLine.Data.Contains("Thanks for using ") && outLine.Data.Contains("electron-forge")) {
                                Installer.StartModify(SW, form1.playsDirectory, form1.VERSION);
                            }
                            if (outLine.Data.Contains("npm ERR!")) {
                                form1.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("An unhandled error has occurred during the install, It is possible that the installation has corrupted.\nTry restarting your computer and turn off anti-virus before installing.\n\nReport this issue by copying the logs and sending it to a developer.");
                                form1.TopMost = false;
                            }
                            if (outLine.Data.Contains("'nodejs-portable.exe' is not recognized")) {
                                form1.TopMost = true;
                                System.Windows.Forms.MessageBox.Show("'nodejs-portable.exe' is missing from the working directory.");
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
                            form1.richTextBox1.ScrollToCaret();
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
