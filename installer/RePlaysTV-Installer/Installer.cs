using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace RePlaysTV_Installer {
    class Installer {
        public static void StartExtract(StreamWriter SW, string playsDirectory) { //part one of installation
            SW.WriteLine("nodejs-portable.exe");
            if (Directory.Exists(Directory.GetCurrentDirectory() + "\\temp"))
                SW.WriteLine("rd /s /q temp");
            SW.WriteLine("mkdir temp");
            SW.WriteLine("asar extract \"" + playsDirectory + "\\app-3.0.0\\resources\\app.asar\" temp");
            SW.WriteLine("cd temp");
            SW.WriteLine("npm init -f");
            SW.WriteLine("npm install");
            SW.WriteLine("electron-forge import");
        }
        public static void StartImport(StreamWriter SW, string playsDirectory, string VERSION) {
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
        public static void StartModify(StreamWriter SW, string playsDirectory, string VERSION) { //part three of installation
            SW.WriteLine("cd ..");
            SW.WriteLine("rd /s /q \".\\temp\\.cache\"");
            SW.WriteLine("mkdir \".\\temp\\resources\\auger\\replays\"");
            SW.WriteLine("robocopy /E /NP /MT \".\\src\" \".\\temp\\resources\\auger\\replays\"");

            //start modifying original plays files
            ModifyFileAtLine("if (true) {", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\main.js", 682); //dev tools
            ModifyFileAtLine("preload: AugerWindow.getPreload('preload.js'), devTools: true,", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\UIManager.js", 419); //dev tools
            ModifyFileAtLine("devTools: true,", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\UIManager.js", 548); //dev tools
            ModifyFileAtLine("const showurl = '/replays/index.html';", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\UIManager.js", 571);
            for (int i = 608; i <= 634; i++) {
                ModifyFileAtLine("// removed", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\UIManager.js", i);
            }
            for (int i = 637; i <= 640; i++) {
                ModifyFileAtLine("// removed", Directory.GetCurrentDirectory() + "\\temp\\src\\main\\UIManager.js", i);
            }
            ModifyFileAtLine("window.loadURL(path.join(__dirname, '/../../resources/auger', augerRouteUrl), urlOptions);", Directory.GetCurrentDirectory() + "\\temp\\src\\core\\AugerWindow.js", 38);
            ModifyFileAtLine("nodeIntegration: true,", Directory.GetCurrentDirectory() + "\\temp\\src\\core\\AugerWindow.js", 53);
            ModifyFileAtLine("if (false) {", Directory.GetCurrentDirectory() + "\\temp\\src\\core\\Updater.js", 62);    //disables updater by code
            ModifyFileAtLine("const AUGER_URL_IG_WIDGETS = '/replays/IngameOverlay.html';", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\IngameOverlay\\IngameHUDService.js", 15);  //custom hud
            ModifyFileAtLine("return true;", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\RunningGamesService.js", 105);    //disables check for login required to recording
            ModifyFileAtLine("return null;", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\BaseService.js", 48);     //disables online user check
            ModifyFileAtLine("return {};", Directory.GetCurrentDirectory() + "\\temp\\src\\core\\Settings.js", 239);     //disables online user check
            for (int i = 159; i <= 166; i++) {
                ModifyFileAtLine("// removed", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\Notifications\\FlowListener.js", i);     //disables online user check
            }
            ModifyFileAtLine("// removed", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\PresenceService.js", 79);     //disables online user check
            ModifyFileAtLine("// removed", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\PresenceService.js", 94);     //disables online user check

            ModifyFileAtLine("const GAMECATALOGS_URL = 'https://raw.githubusercontent.com/lulzsun/RePlaysTV/master/detections/';", Directory.GetCurrentDirectory() + "\\temp\\src\\core\\Utils.js", 39); //changes gamecatalog url
            ModifyFileAtLine("const CATALOG_GAME_DETECTION = 'game_detections';", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 6);
            ModifyFileAtLine("const CATALOG_NONGAME_DETECTION = 'nongame_detections';", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 7);
            ModifyFileAtLine("static getLatestVersionFileUrl() {", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 13);
            ModifyFileAtLine("return `/version.json`;", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 14);
            ModifyFileAtLine("const url = GameCatalogRequest.getLatestVersionFileUrl();", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 27);
            ModifyFileAtLine("return {version: response[`${catalog}_version`].version, key: `${catalog}.json`};", Directory.GetCurrentDirectory() + "\\temp\\src\\service\\DetectionRequests\\GameCatalogRequest.js", 34);
            //end modifying

            StartPackage(SW, playsDirectory, VERSION);
        }

        public static void StartPackage(StreamWriter SW, string playsDirectory, string VERSION) { //part four of installation
            SW.WriteLine("cd temp");
            SW.WriteLine("npm run package");
            SW.WriteLine("rename " + playsDirectory + "\\Update.exe noUpdate.exe");
            SW.WriteLine("rmdir /s /q \"" + playsDirectory + "\\app-" + VERSION + "\"");
            SW.WriteLine("mkdir \"" + playsDirectory + "\\app-" + VERSION + "\"");
            SW.WriteLine("asar pack \".\\out\\Plays-win32-ia32\\resources\\app\" \".\\out\\Plays-win32-ia32\\resources\\app.asar\"");
            SW.WriteLine("rd /s /q \".\\out\\Plays-win32-ia32\\resources\\app\"");
            SW.WriteLine("robocopy /E /NP /MT \".\\out\\Plays-win32-ia32\" \"" + playsDirectory + "\\app-" + VERSION + "\"");
            SW.WriteLine("cd ..");
            SW.WriteLine("rd /s /q temp");
            SW.WriteLine("exit");
        }
        public static void ModifyFileAtLine(string newText, string fileName, int line_to_edit, RichTextBox richTextBox1 = null) {
            string[] arrLine = File.ReadAllLines(fileName);
            arrLine[line_to_edit - 1] = newText;
            File.WriteAllLines(fileName, arrLine);
            if (richTextBox1 != null) {
                richTextBox1.AppendText(Environment.NewLine + "[" + DateTime.Now.ToString("h:mm:ss tt") + "] " + fileName + ">>> Writing to line " + line_to_edit + ": " + newText);
                richTextBox1.ScrollToCaret();
            }
        }
    }
}
