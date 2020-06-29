using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using RePlaysTV_Installer.Settings;

namespace RePlaysTV_Installer.Views
{
    public partial class Options : Form
    {
        public Options()
        {
            InitializeComponent();
        }

        private void Options_FormClosing(object sender, FormClosingEventArgs e)
        {
            Hide();
            e.Cancel = true;
        }

        private void LoadOptions(object sender, EventArgs e)
        {
            playsSetupUrl.Text = InstallerSettings.GetInstallerSetting<string>(InstallerSetting.PlaysSetupUrl);
            ltcVersion.Text = InstallerSettings.GetInstallerSetting<string>(InstallerSetting.LtcVersion);
            cleanInstall.Checked = InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.CleanInstall);
            deleteTemp.Checked = InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.DeleteTemp);
            ignoreChecksum.Checked = InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.IgnoreChecksum);
        }

        private void Button5_Click(object sender, EventArgs e)
        {
            InstallerSettings.SetInstallerSetting(InstallerSetting.PlaysSetupUrl, playsSetupUrl.Text);
            InstallerSettings.SetInstallerSetting(InstallerSetting.LtcVersion, ltcVersion.Text);
            InstallerSettings.SetInstallerSetting(InstallerSetting.CleanInstall, cleanInstall.Checked);
            InstallerSettings.SetInstallerSetting(InstallerSetting.DeleteTemp, deleteTemp.Checked);
            InstallerSettings.SetInstallerSetting(InstallerSetting.IgnoreChecksum, ignoreChecksum.Checked);
        }

        private void Button1_Click(object sender, EventArgs e)
        {
            Process.Start(Directory.GetCurrentDirectory());
        }

        private void Button2_Click(object sender, EventArgs e)
        {
            Process.Start(Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays");
        }

        private void Button3_Click(object sender, EventArgs e)
        {
            Process.Start(Environment.GetEnvironmentVariable("LocalAppData") + "\\Plays-ltc");
        }

        private void Button4_Click(object sender, EventArgs e)
        {
            Process.Start(Environment.GetEnvironmentVariable("AppData") + "\\Plays");
        }

        private void Button6_Click(object sender, EventArgs e)
        {
            var dr1 = MessageBox.Show("Are you sure you want to uninstall Plays?",
                "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes)
                Process.Start("cmd.exe", "/C \"" + Environment.GetEnvironmentVariable("LocalAppData") +
                                         "\\Plays\\Update.exe\" --uninstall &&" +
                                         "rd /s /q \"" + Environment.GetEnvironmentVariable("LocalAppData") +
                                         "\\Plays\" &&" +
                                         "rd /s /q \"" + Environment.GetEnvironmentVariable("LocalAppData") +
                                         "\\Plays-ltc\"");
        }

        private void Button8_Click(object sender, EventArgs e)
        {
            var dr1 = MessageBox.Show("Are you sure you want to uninstall the RePlays Installer?\n" +
                                      "This will not uninstall Plays or RePlays patched Plays.",
                "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes)
            {
            }
        }

        private void Button7_Click(object sender, EventArgs e)
        {
            var dr1 = MessageBox.Show("Are you sure you want to uninstall Yarn?\n" +
                                      "This will uninstall Yarn from your local version of npm if it is installed globally.",
                "RePlaysTV Installer", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Information);
            if (dr1 == DialogResult.Yes)
            {
            }
        }

        /// <summary>
        ///     Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && components != null) components.Dispose();
            base.Dispose(disposing);
        }
    }
}