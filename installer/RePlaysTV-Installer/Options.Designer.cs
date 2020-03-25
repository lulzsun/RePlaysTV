namespace RePlaysTV_Installer {
    partial class Options {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.button4 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.button8 = new System.Windows.Forms.Button();
            this.button7 = new System.Windows.Forms.Button();
            this.button6 = new System.Windows.Forms.Button();
            this.groupBox3 = new System.Windows.Forms.GroupBox();
            this.deleteTemp = new System.Windows.Forms.CheckBox();
            this.ignoreChecksum = new System.Windows.Forms.CheckBox();
            this.label2 = new System.Windows.Forms.Label();
            this.ltcVersion = new System.Windows.Forms.ComboBox();
            this.cleanInstall = new System.Windows.Forms.CheckBox();
            this.button5 = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.playsSetupUrl = new System.Windows.Forms.TextBox();
            this.installLTC = new System.Windows.Forms.CheckBox();
            this.installFFMPEG = new System.Windows.Forms.CheckBox();
            this.label3 = new System.Windows.Forms.Label();
            this.ffmpegSetupUrl = new System.Windows.Forms.TextBox();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.groupBox3.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.button4);
            this.groupBox1.Controls.Add(this.button3);
            this.groupBox1.Controls.Add(this.button2);
            this.groupBox1.Controls.Add(this.button1);
            this.groupBox1.Location = new System.Drawing.Point(12, 197);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(190, 137);
            this.groupBox1.TabIndex = 0;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Show Directories";
            // 
            // button4
            // 
            this.button4.Location = new System.Drawing.Point(6, 106);
            this.button4.Name = "button4";
            this.button4.Size = new System.Drawing.Size(178, 23);
            this.button4.TabIndex = 4;
            this.button4.Text = "Open Roaming\\Plays Directory";
            this.button4.UseVisualStyleBackColor = true;
            this.button4.Click += new System.EventHandler(this.Button4_Click);
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(6, 77);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(178, 23);
            this.button3.TabIndex = 3;
            this.button3.Text = "Open Plays-ltc Directory";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Click += new System.EventHandler(this.Button3_Click);
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(6, 48);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(178, 23);
            this.button2.TabIndex = 2;
            this.button2.Text = "Open Plays Directory";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.Button2_Click);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(6, 19);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(178, 23);
            this.button1.TabIndex = 1;
            this.button1.Text = "Open Installer Directory";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.Button1_Click);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.button8);
            this.groupBox2.Controls.Add(this.button7);
            this.groupBox2.Controls.Add(this.button6);
            this.groupBox2.Location = new System.Drawing.Point(224, 197);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(190, 137);
            this.groupBox2.TabIndex = 5;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Misc.";
            // 
            // button8
            // 
            this.button8.Location = new System.Drawing.Point(6, 48);
            this.button8.Name = "button8";
            this.button8.Size = new System.Drawing.Size(178, 23);
            this.button8.TabIndex = 9;
            this.button8.Text = "Uninstall RePlays Installer";
            this.button8.UseVisualStyleBackColor = true;
            this.button8.Click += new System.EventHandler(this.Button8_Click);
            // 
            // button7
            // 
            this.button7.Location = new System.Drawing.Point(6, 77);
            this.button7.Name = "button7";
            this.button7.Size = new System.Drawing.Size(178, 23);
            this.button7.TabIndex = 8;
            this.button7.Text = "Uninstall Yarn";
            this.button7.UseVisualStyleBackColor = true;
            this.button7.Click += new System.EventHandler(this.Button7_Click);
            // 
            // button6
            // 
            this.button6.Location = new System.Drawing.Point(6, 19);
            this.button6.Name = "button6";
            this.button6.Size = new System.Drawing.Size(178, 23);
            this.button6.TabIndex = 7;
            this.button6.Text = "Uninstall Plays";
            this.button6.UseVisualStyleBackColor = true;
            this.button6.Click += new System.EventHandler(this.Button6_Click);
            // 
            // groupBox3
            // 
            this.groupBox3.Controls.Add(this.label3);
            this.groupBox3.Controls.Add(this.ffmpegSetupUrl);
            this.groupBox3.Controls.Add(this.installFFMPEG);
            this.groupBox3.Controls.Add(this.installLTC);
            this.groupBox3.Controls.Add(this.deleteTemp);
            this.groupBox3.Controls.Add(this.ignoreChecksum);
            this.groupBox3.Controls.Add(this.label2);
            this.groupBox3.Controls.Add(this.ltcVersion);
            this.groupBox3.Controls.Add(this.cleanInstall);
            this.groupBox3.Controls.Add(this.button5);
            this.groupBox3.Controls.Add(this.label1);
            this.groupBox3.Controls.Add(this.playsSetupUrl);
            this.groupBox3.Location = new System.Drawing.Point(12, 12);
            this.groupBox3.Name = "groupBox3";
            this.groupBox3.Size = new System.Drawing.Size(402, 179);
            this.groupBox3.TabIndex = 6;
            this.groupBox3.TabStop = false;
            this.groupBox3.Text = "Install Settings";
            // 
            // deleteTemp
            // 
            this.deleteTemp.AutoSize = true;
            this.deleteTemp.Location = new System.Drawing.Point(98, 126);
            this.deleteTemp.Name = "deleteTemp";
            this.deleteTemp.Size = new System.Drawing.Size(165, 17);
            this.deleteTemp.TabIndex = 10;
            this.deleteTemp.Text = "Delete temp folder after install";
            this.deleteTemp.UseVisualStyleBackColor = true;
            // 
            // ignoreChecksum
            // 
            this.ignoreChecksum.AutoSize = true;
            this.ignoreChecksum.Location = new System.Drawing.Point(9, 149);
            this.ignoreChecksum.Name = "ignoreChecksum";
            this.ignoreChecksum.Size = new System.Drawing.Size(165, 17);
            this.ignoreChecksum.TabIndex = 9;
            this.ignoreChecksum.Text = "Ignore PlaysSetup Checksum";
            this.ignoreChecksum.UseVisualStyleBackColor = true;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 104);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(64, 13);
            this.label2.TabIndex = 8;
            this.label2.Text = "LTC version";
            // 
            // ltcVersion
            // 
            this.ltcVersion.FormattingEnabled = true;
            this.ltcVersion.Location = new System.Drawing.Point(76, 101);
            this.ltcVersion.Name = "ltcVersion";
            this.ltcVersion.Size = new System.Drawing.Size(58, 21);
            this.ltcVersion.TabIndex = 7;
            this.ltcVersion.Text = "0.54.7";
            // 
            // cleanInstall
            // 
            this.cleanInstall.AutoSize = true;
            this.cleanInstall.Checked = true;
            this.cleanInstall.CheckState = System.Windows.Forms.CheckState.Checked;
            this.cleanInstall.Location = new System.Drawing.Point(9, 126);
            this.cleanInstall.Name = "cleanInstall";
            this.cleanInstall.Size = new System.Drawing.Size(83, 17);
            this.cleanInstall.TabIndex = 7;
            this.cleanInstall.Text = "Clean Install";
            this.cleanInstall.UseVisualStyleBackColor = true;
            // 
            // button5
            // 
            this.button5.Location = new System.Drawing.Point(301, 149);
            this.button5.Name = "button5";
            this.button5.Size = new System.Drawing.Size(95, 23);
            this.button5.TabIndex = 7;
            this.button5.Text = "Apply Changes";
            this.button5.UseVisualStyleBackColor = true;
            this.button5.Click += new System.EventHandler(this.Button5_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 16);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(156, 13);
            this.label1.TabIndex = 7;
            this.label1.Text = "PlaysSetup.exe Download URL";
            // 
            // playsSetupUrl
            // 
            this.playsSetupUrl.Location = new System.Drawing.Point(6, 32);
            this.playsSetupUrl.Name = "playsSetupUrl";
            this.playsSetupUrl.Size = new System.Drawing.Size(390, 20);
            this.playsSetupUrl.TabIndex = 0;
            // 
            // installLTC
            // 
            this.installLTC.AutoSize = true;
            this.installLTC.Checked = true;
            this.installLTC.CheckState = System.Windows.Forms.CheckState.Checked;
            this.installLTC.Location = new System.Drawing.Point(218, 103);
            this.installLTC.Name = "installLTC";
            this.installLTC.Size = new System.Drawing.Size(76, 17);
            this.installLTC.TabIndex = 11;
            this.installLTC.Text = "Install LTC";
            this.installLTC.UseVisualStyleBackColor = true;
            // 
            // installFFMPEG
            // 
            this.installFFMPEG.AutoSize = true;
            this.installFFMPEG.Checked = true;
            this.installFFMPEG.CheckState = System.Windows.Forms.CheckState.Checked;
            this.installFFMPEG.Location = new System.Drawing.Point(300, 103);
            this.installFFMPEG.Name = "installFFMPEG";
            this.installFFMPEG.Size = new System.Drawing.Size(94, 17);
            this.installFFMPEG.TabIndex = 12;
            this.installFFMPEG.Text = "Install FFmpeg";
            this.installFFMPEG.UseVisualStyleBackColor = true;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(6, 55);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(121, 13);
            this.label3.TabIndex = 14;
            this.label3.Text = "FFmpeg Download URL";
            // 
            // ffmpegSetupUrl
            // 
            this.ffmpegSetupUrl.Location = new System.Drawing.Point(6, 71);
            this.ffmpegSetupUrl.Name = "ffmpegSetupUrl";
            this.ffmpegSetupUrl.Size = new System.Drawing.Size(390, 20);
            this.ffmpegSetupUrl.TabIndex = 13;
            // 
            // Options
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(426, 346);
            this.Controls.Add(this.groupBox3);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.groupBox1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "Options";
            this.SizeGripStyle = System.Windows.Forms.SizeGripStyle.Hide;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Options";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Options_FormClosing);
            this.Load += new System.EventHandler(this.Options_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox2.ResumeLayout(false);
            this.groupBox3.ResumeLayout(false);
            this.groupBox3.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Button button4;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.GroupBox groupBox3;
        private System.Windows.Forms.CheckBox cleanInstall;
        private System.Windows.Forms.Button button5;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox playsSetupUrl;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ComboBox ltcVersion;
        private System.Windows.Forms.Button button7;
        private System.Windows.Forms.Button button6;
        private System.Windows.Forms.CheckBox ignoreChecksum;
        private System.Windows.Forms.CheckBox deleteTemp;
        private System.Windows.Forms.Button button8;
        private System.Windows.Forms.CheckBox installFFMPEG;
        private System.Windows.Forms.CheckBox installLTC;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox ffmpegSetupUrl;
    }
}