using System;
using System.Collections.Generic;
using System.IO;
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
                    new Uri("https://web.archive.org/web/20191212211927if_/https://app-updates.plays.tv/builds/PlaysSetup.exe"),
                    workDirectory + "\\PlaysSetup.exe");
            }
        }

        public static void StartExtract(StreamWriter SW, string workDirectory=null) { //part one of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();
            else SW.WriteLine("cd /d " + workDirectory);

            SW.WriteLine("nodejs-portable.exe");
            if (Directory.Exists(workDirectory + "\\temp"))
                SW.WriteLine("rd /s /q temp");
            SW.WriteLine("mkdir temp");
            SW.WriteLine("7z e PlaysSetup.exe -o.\\PlaysSetup -aos");
            SW.WriteLine("copy /Y .\\PlaysSetup\\Update.exe .\\Install.exe");
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
        public static void StartModify(StreamWriter SW, string VERSION, string workDirectory = null) { //part three of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();

            SW.WriteLine("cd ..");
            SW.WriteLine("rd /s /q .\\temp\\.cache");
            SW.WriteLine("mkdir .\\temp\\resources\\auger\\replays");
            SW.WriteLine("robocopy /E /NP /MT .\\src .\\temp\\resources\\auger\\replays");

            //--------------------------------------
            //start modifying original plays files
            //--------------------------------------
            //dev tools
            ModifyFileAtLine("if (true) {", workDirectory + "\\temp\\src\\main\\main.js", 682);
            ModifyFileAtLine("preload: AugerWindow.getPreload('preload.js'), devTools: true,", workDirectory + "\\temp\\src\\main\\UIManager.js", 419);
            ModifyFileAtLine("devTools: true,", workDirectory + "\\temp\\src\\main\\UIManager.js", 548);
            //replays modifications
            ModifyFileAtLine("const showurl = '/replays/index.html';", workDirectory + "\\temp\\src\\main\\UIManager.js", 571);
            for (int i = 608; i <= 634; i++) {
                ModifyFileAtLine("// removed", workDirectory + "\\temp\\src\\main\\UIManager.js", i);
            }
            for (int i = 637; i <= 640; i++) {
                ModifyFileAtLine("// removed", workDirectory + "\\temp\\src\\main\\UIManager.js", i);
            }
            ModifyFileAtLine("window.loadURL(path.join(__dirname, '/../../resources/auger', augerRouteUrl), urlOptions);", workDirectory + "\\temp\\src\\core\\AugerWindow.js", 38);
            ModifyFileAtLine("nodeIntegration: true,", workDirectory + "\\temp\\src\\core\\AugerWindow.js", 53);
            //disables original plays updater
            ModifyFileAtLine("if (false) {", workDirectory + "\\temp\\src\\core\\Updater.js", 62);
            //ingame hud replacement
            ModifyFileAtLine("const AUGER_URL_IG_WIDGETS = '/replays/IngameOverlay.html';", workDirectory + "\\temp\\src\\service\\IngameOverlay\\IngameHUDService.js", 15);
            //disables online plays user checks
            ModifyFileAtLine("return true;", workDirectory + "\\temp\\src\\service\\RunningGamesService.js", 105);    //disables check for login required to recording
            //ModifyFileAtLine("return null;", workDirectory + "\\temp\\src\\service\\BaseService.js", 48); 
            ModifyFileAtLine("return {userId: \"REPLAYSTV\"};", workDirectory + "\\temp\\src\\core\\Settings.js", 239);
            for (int i = 159; i <= 166; i++) {
                ModifyFileAtLine("// removed", workDirectory + "\\temp\\src\\service\\Notifications\\FlowListener.js", i);
            }
            ModifyFileAtLine("// removed", workDirectory + "\\temp\\src\\service\\PresenceService.js", 79);
            ModifyFileAtLine("// removed", workDirectory + "\\temp\\src\\service\\PresenceService.js", 94);
            // changes gamecatalog url
            ModifyFileAtLine("const GAMECATALOGS_URL = 'https://raw.githubusercontent.com/lulzsun/RePlaysTV/master/detections/';", workDirectory + "\\temp\\src\\core\\Utils.js", 39);
            ModifyFileAtLine("const CATALOG_GAME_DETECTION = 'game_detections';", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 6);
            ModifyFileAtLine("const CATALOG_NONGAME_DETECTION = 'nongame_detections';", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 7);
            ModifyFileAtLine("static getLatestVersionFileUrl() {", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 13);
            ModifyFileAtLine("return `/version.json`;", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 14);
            ModifyFileAtLine("const url = GameCatalogRequest.getLatestVersionFileUrl();", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 27);
            ModifyFileAtLine("return {version: response[`${catalog}_version`].version, key: `${catalog}.json`};", workDirectory + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 34);
            // repurposed presence logger for update logs
            ModifyFileAtLine("const UPDATERLOGPATH = path.join(USERDATAPATH, 'updater.log');", workDirectory + "\\temp\\src\\core\\Logger.js", 18);
            ModifyFileAtLine("touch.sync(UPDATERLOGPATH);", workDirectory + "\\temp\\src\\core\\Logger.js", 28);
            ModifyFileAtLine("const updaterLogger = winston.createLogger({", workDirectory + "\\temp\\src\\core\\Logger.js", 256);
            ModifyFileAtLine("filename: UPDATERLOGPATH,", workDirectory + "\\temp\\src\\core\\Logger.js", 265);
            ModifyFileAtLine("export const updaterLog = Loggify(updaterLogger);", workDirectory + "\\temp\\src\\core\\Logger.js", 278);
            // autoLaunch correction
            ModifyFileAtLine("const autoLaunch = new AutoLaunch({ name: \"Plays\", path: require(\"electron\").remote.app.getPath('exe') });", workDirectory + "\\temp\\src\\service\\SettingsService.js", 457);
            //--------------------------------------
            //end modifying original plays files
            //--------------------------------------

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
                SW.WriteLine("Install.exe --install=.\\");
            } else {
                SW.WriteLine("echo WARNING: Current work directory is '" + workDirectory + "', proper work directory should be at '" + rePlaysDirectory + "', skipping completion install...");
            }
            SW.WriteLine("exit");
        }

        public static void ModifyFileAtLine(string newText, string fileName, int line_to_edit, RichTextBox richTextBox1 = null) {
            string[] arrLine = File.ReadAllLines(fileName);
            arrLine[line_to_edit - 1] = newText;
            File.WriteAllLines(fileName, arrLine);
            Log(fileName + ">>> Writing to line " + line_to_edit + ": " + newText, richTextBox1);
        }

        public static void Log(string msg, RichTextBox richTextBox1 = null) {
            if (richTextBox1 != null) {
                richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + msg);
            } else Console.WriteLine(msg);
        }
    }
}
