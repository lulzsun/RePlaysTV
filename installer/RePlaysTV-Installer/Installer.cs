using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Management;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RePlaysTV_Installer {
    class Installer {
        public static string rePlaysDirectory = Environment.GetEnvironmentVariable("LocalAppData") + "\\RePlays";
        public static Dictionary<string, Object> installSettings =
        new Dictionary<string, Object> ()
        {
            { "playsSetupUrl", "https://web.archive.org/web/20191212211927if_/https://app-updates.plays.tv/builds/PlaysSetup.exe" },
            { "ltcVersion", "0.54.7" },
            { "cleanInstall", true },
            { "deleteTemp", false },
            { "ignoreChecksum", false },
        };
        public static void ListInstalledAntivirusProducts(RichTextBox richTextBox1 = null) {
            using (var searcher = new ManagementObjectSearcher(@"\\" +
                                                Environment.MachineName +
                                                @"\root\SecurityCenter2",
                                                "SELECT * FROM AntivirusProduct")) {
                var searcherInstance = searcher.Get();
                var msg = "Detected installed antivirus(es), may conflict with the installation: ";
                if(searcherInstance.Count < 1) {
                    foreach (var instance in searcherInstance) {
                        msg = msg + instance["displayName"].ToString() + ", ";
                    }
                }
                else {
                    msg = "No installed antivirus detected.";
                }

                Log(msg, richTextBox1);
            }
        }

        public static void ListFilesInDir(StreamWriter SW, string dir, RichTextBox richTextBox1 = null) {
            Log("Displaying tree view of '" + dir + "' for debugging purposes:", richTextBox1);
            SW.WriteLine("tree \"" + dir + "\" /f");
        }

        public static async Task DownloadSetup(RichTextBox richTextBox1 = null, string workDirectory = null) { //part one of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();

            var correctHash = "3a7cea84d50ad2c31a79e66f5c3f3b8d";

            // Checksum
            if (File.Exists(workDirectory + "\\PlaysSetup.exe")) {
                if ((bool)installSettings["ignoreChecksum"] == false) {
                    bool checksumPass = false;
                    using (var md5 = MD5.Create()) {
                        using (var stream = File.OpenRead(workDirectory + "\\PlaysSetup.exe")) {
                            var hash = md5.ComputeHash(stream);
                            var hashAsString = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

                            if (correctHash == hashAsString) {
                                checksumPass = true;
                                Log("PlaysSetup.exe passed MD5 checksum: " + BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant(), richTextBox1);
                            } else {
                                checksumPass = false;
                                Log("PlaysSetup.exe did not pass MD5 checksum!!!", richTextBox1);
                            }
                        }
                    }
                    if (!checksumPass)
                        File.Delete(workDirectory + "\\PlaysSetup.exe");
                    else return;
                } else return;
            }

            Log("PlaysSetup.exe missing or failed checksum, starting download", richTextBox1);
            using (var client = new WebClient()) {
                client.DownloadProgressChanged += (o, args) => {
                    Log("Downloading PlaysSetup.exe @ web.archive.org: " + args.BytesReceived + " / 145310344 Bytes", richTextBox1);
                };
                client.DownloadFileCompleted += async (o, args) => {
                    Log("Finished downloading PlaysSetup.exe, doing a checksum", richTextBox1);
                    await DownloadSetup(richTextBox1, workDirectory);
                };
                await client.DownloadFileTaskAsync(
                    new Uri((string) installSettings["playsSetupUrl"]),
                    workDirectory + "\\PlaysSetup.exe");
            }
        }

        public static void StartExtract(StreamWriter SW, string workDirectory=null) { //part one of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();
            else SW.WriteLine("cd /d " + workDirectory);

            SW.WriteLine("nodejs-portable.exe");
            if (Directory.Exists(workDirectory + "\\temp") && (bool)installSettings["cleanInstall"] == true) {
                SW.WriteLine("rd /s /q temp");
            }
            SW.WriteLine("mkdir temp");
            SW.WriteLine("7z e PlaysSetup.exe -o.\\PlaysSetup -aos");
            SW.WriteLine("copy /Y .\\PlaysSetup\\Update.exe .\\Update.exe");
            SW.WriteLine("7z x .\\PlaysSetup\\Plays-3.0.0-full.nupkg -o.\\PlaysSetup\\Plays-3.0.0-full -aos");
            SW.WriteLine("asar extract .\\PlaysSetup\\Plays-3.0.0-full\\lib\\net45\\resources\\app.asar temp");
            SW.WriteLine("cd temp");
            SW.WriteLine("npm init -f");
            SW.WriteLine("npm install");
            SW.WriteLine("electron-forge import");
        }
        public static void StartImport(StreamWriter SW) { //part two of installation
            Thread.Sleep(5000);
            SW.WriteLine("y");
            Thread.Sleep(5000);
            SW.WriteLine("y");
            Thread.Sleep(5000);
            SW.WriteLine("src/main/main.js");
            Thread.Sleep(5000);
            SW.WriteLine("n");
            Thread.Sleep(5000);
        }
        public static void StartModify(StreamWriter SW, string VERSION, string workDirectory = null, RichTextBox richTextBox1 = null) { //part three of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();

            SW.WriteLine("cd ..");
            SW.WriteLine("rd /s /q .\\temp\\.cache");
            SW.WriteLine("mkdir .\\temp\\resources\\auger\\replays");
            SW.WriteLine("robocopy /E /NP /MT .\\src .\\temp\\resources\\auger\\replays");

            //--------------------------------------
            //start modifying original plays files
            //--------------------------------------

            //copying replaceables
            SW.WriteLine("robocopy /E /NP /MT .\\src-patch\\src .\\temp\\src");

            //set version
            ModifyFileAtLine("log.info(`Version: " + VERSION + "`);", workDirectory + "\\temp\\src\\main\\main.js", 36, richTextBox1);

            int counter = 1;
            string line;
            StreamReader configFile = new StreamReader(workDirectory + "\\src-patch\\config.txt");
            while ((line = configFile.ReadLine()) != null) {
                if (!line.StartsWith("#") && !String.IsNullOrEmpty(line)) { // if it is not a comment
                    if(line.StartsWith("ModifyFileAtLine") || line.StartsWith("AppendToFileAtLine")) {
                        string command = "ModifyFileAtLine";
                        if (line.StartsWith("AppendToFileAtLine"))
                            command = "AppendToFileAtLine";

                        string fileName = line.Split(new string[] { "\"" }, 3, StringSplitOptions.None)[1];
                        string lineNumber = line.Replace(command + " \"" + fileName + "\" ", ""); lineNumber = lineNumber.Substring(0, lineNumber.IndexOf(' '));
                        string newLine = line.Replace(command + " \"" + fileName + "\" " + lineNumber + " ", "");

                        if(lineNumber.Contains("-") && command == "ModifyFileAtLine") {
                            int start = Int32.Parse(lineNumber.Split('-')[0]);
                            int end = Int32.Parse(lineNumber.Split('-')[1]);

                            for (int i = start; i <= end; i++) {
                                ModifyFileAtLine(newLine, workDirectory + "\\temp" + fileName, i, richTextBox1);
                                counter++;
                            }
                        } else {
                            if(command == "AppendToFileAtLine")
                                AppendToFileAtLine(newLine, workDirectory + "\\temp" + fileName, Int32.Parse(lineNumber), richTextBox1);
                            else
                                ModifyFileAtLine(newLine, workDirectory + "\\temp" + fileName, Int32.Parse(lineNumber), richTextBox1);
                            counter++;
                        }
                    }
                }
            }
            Log("Number of changes: " + counter, richTextBox1);
            configFile.Close();

            StartPackage(SW, VERSION, workDirectory);
        }

        public static void StartPackage(StreamWriter SW, string VERSION, string workDirectory = null) { //part four of installation
            ModifyFileAtLine("<version>" + VERSION + "-full</version>", workDirectory + "\\Plays.nuspec", 5);
            SW.WriteLine("copy /Y nuget.exe temp");
            SW.WriteLine("copy /Y Plays.nuspec temp");
            SW.WriteLine("cd temp");
            SW.WriteLine("npm run package");
            SW.WriteLine("robocopy /E /NP /MT ..\\PlaysSetup\\Plays-3.0.0-full\\lib\\net45\\resources\\ltc .\\out\\Plays-win32-ia32\\resources\\ltc");
            SW.WriteLine("rename .\\out\\Plays-win32-ia32 net45");
            SW.WriteLine("nuget.exe pack");
            StartInstall(SW, VERSION, workDirectory);
        }

        public static void StartInstall(StreamWriter SW, string VERSION, string workDirectory = null) { //part five of installation
            SW.WriteLine("copy /Y Plays." + VERSION + "-full.nupkg ..");
            SW.WriteLine("cd ..");
            SW.WriteLine("del /f RELEASES");
            if (workDirectory == rePlaysDirectory) {
                SW.WriteLine("Update.exe --install=.\\");
            } else {
                SW.WriteLine("echo WARNING: Current work directory is '" + workDirectory + "', proper work directory should be at '" + rePlaysDirectory + "', skipping completion install...");
            }
            if((bool)installSettings["deleteTemp"] == true) {
                SW.WriteLine("rd /s /q temp");
            }
            SW.WriteLine("exit");
        }

        public static void ModifyFileAtLine(string newText, string fileName, int line_to_edit, RichTextBox richTextBox1 = null) {
            string[] arrLine = File.ReadAllLines(fileName);
            arrLine[line_to_edit - 1] = newText;
            File.WriteAllLines(fileName, arrLine);
            Log(fileName + ">>> Writing to line " + line_to_edit + ": " + newText, richTextBox1);
        }

        public static void AppendToFileAtLine(string newText, string fileName, int line_to_edit, RichTextBox richTextBox1 = null) {
            var arrLine = File.ReadAllLines(fileName).ToList();
            arrLine.Insert(line_to_edit + 1, newText);
            File.WriteAllLines(fileName, arrLine);
            Log(fileName + ">>> Writing to line " + line_to_edit + ": " + newText, richTextBox1);
        }

        public static void Log(string msg, RichTextBox richTextBox1 = null) {
            if (richTextBox1 != null) {
                richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + msg);
            } Console.WriteLine(msg);
        }
    }
}
