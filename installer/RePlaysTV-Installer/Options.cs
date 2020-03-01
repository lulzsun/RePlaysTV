using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RePlaysTV_Installer {
    public partial class Options : Form {
        public Options() {
            InitializeComponent();
        }

        private void Options_FormClosing(object sender, FormClosingEventArgs e) {
            this.Hide();
            e.Cancel = true;
        }

        private void Options_Load(object sender, EventArgs e) {
            playsSetupUrl.Text = (string)Installer.installSettings["playsSetupUrl"];
            ltcVersion.Text = (string)Installer.installSettings["ltcVersion"];
            cleanInstall.Checked = (bool)Installer.installSettings["cleanInstall"];
            deleteTemp.Checked = (bool)Installer.installSettings["deleteTemp"];
            ignoreChecksum.Checked = (bool)Installer.installSettings["ignoreChecksum"];
        }

        private void Button5_Click(object sender, EventArgs e) {
            Installer.installSettings = new Dictionary<string, Object>()
            {
                { "playsSetupUrl", playsSetupUrl.Text },
                { "ltcVersion", ltcVersion.Text },
                { "cleanInstall", cleanInstall.Checked },
                { "deleteTemp", deleteTemp.Checked },
                { "ignoreChecksum", ignoreChecksum.Checked },
            };
        }

        private void Button1_Click(object sender, EventArgs e) {
            Process.Start(Directory.GetCurrentDirectory());
        }

        private void Button2_Click(object sender, EventArgs e) {
            Process.Start(Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays");
        }

        private void Button3_Click(object sender, EventArgs e) {
            Process.Start(Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays-ltc");
        }

        private void Button4_Click(object sender, EventArgs e) {
            Process.Start(Environment.GetEnvironmentVariable("AppData") + "\\Plays");
        }

        private void Button6_Click(object sender, EventArgs e) {
            DialogResult dr1 = MessageBox.Show("Are you sure you want to uninstall Plays?",
                                               "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {
                Process.Start("cmd.exe", "/C \"" + Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays\\Update.exe\" --uninstall &&" +
                                         "rd /s /q \"" + Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays\" &&" +
                                         "rd /s /q \"" + Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays-ltc\"");
            }
        }

        private void Button8_Click(object sender, EventArgs e) {
            DialogResult dr1 = MessageBox.Show("Are you sure you want to uninstall the RePlays Installer?\n" +
                                               "This will not uninstall Plays or RePlays patched Plays.",
                                               "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {

            }
        }

        private void Button7_Click(object sender, EventArgs e) {
            DialogResult dr1 = MessageBox.Show("Are you sure you want to uninstall Yarn?\n" +
                                               "This will uninstall Yarn from your local version of npm if it is installed globally.",
                                               "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes) {

            }
        }
    }
}
