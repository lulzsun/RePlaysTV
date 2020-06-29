using System;
using System.IO;
using System.Linq;
using System.Management;
using System.Net;
using System.Security.Cryptography;
using System.Threading.Tasks;
using RePlaysTV_Installer.Helper;
using RePlaysTV_Installer.Settings;
using RePlaysTV_Installer.Views;

namespace RePlaysTV_Installer
{
    internal sealed class Installer
    {
        public static void ListInstalledAntivirusProducts()
        {
            using (var searcher = new ManagementObjectSearcher(@"\\" +
                                                               Environment.MachineName +
                                                               @"\root\SecurityCenter2",
                "SELECT * FROM AntivirusProduct"))
            {
                var searcherInstance = searcher.Get();
                Main.Log("Detected installed antivirus(es), may conflict with the installation: ");

                if (searcherInstance.Count < 1)
                {
                    foreach (var instance in searcherInstance)
                    {
                        Main.Log($"{instance["displayName"]},");
                    }

                    return;
                }

                Main.Log("No installed antivirus detected.");
            }
        }

        public async Task ListFilesInDir(StreamWriter SW, string dir)
        {
            Main.Log("Displaying tree view of '" + dir + "' for debugging purposes:");
            await SW.WriteLineAsync("tree \"" + dir + "\" /f");
        }

        public static async Task<bool> DownloadPlaysSetup(string workDirectory = null)
        {
            //part one of installation
            workDirectory = workDirectory ?? Directory.GetCurrentDirectory();
            var correctHash = InstallerSettings.GetInstallerSetting<string>(InstallerSetting.CorrectPlaysSetupHash);

            // Checksum
            if (File.Exists(workDirectory + "\\PlaysSetup.exe") &&
                !InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.IgnoreChecksum))
            {
                using (var md5 = MD5.Create())
                {
                    Main.Log("Check if executable has correct hash.");
                    using (var stream = File.OpenRead(workDirectory + "\\PlaysSetup.exe"))
                    {
                        var hashAsString = BitConverter.ToString(md5.ComputeHash(stream)).Replace("-", "")
                            .ToLowerInvariant();
                        if (correctHash == hashAsString)
                        {
                            Main.Log($"PlaysSetup.exe  has the correct MD5: {hashAsString}");
                            return true;
                        }
                    }
                }

                // PlaysSetup.exe did not pass MD5 checksum!!!
                Main.Log(
                    $"The checksum found on PlaysSetup was not the one needed.{Environment.NewLine}The file will be deleted.{Environment.NewLine}Please restart installation.");
                File.Delete(workDirectory + "\\PlaysSetup.exe");
                return false;
            }

            Main.Log("PlaysSetup.exe missing or failed checksum, starting download");
            using (var client = new WebClient())
            {
                var playSetupExecutableSizeInBytes =
                    InstallerSettings.GetInstallerSetting<decimal>(InstallerSetting.PlaySetupExecutableSizeInBytes);
                var playsSetupExecutableSizeInMb = Math.Round(playSetupExecutableSizeInBytes / 1000000, 2);
                client.DownloadProgressChanged += (o, args) =>
                {
                    var bytesReceivedInMegabyte = args.BytesReceived / 1000000;
                    var progressInPercent =
                        decimal.Round(decimal.Divide(bytesReceivedInMegabyte, playsSetupExecutableSizeInMb) * 100, 2);
                    Main.Log(
                        $"Downloading PlaysSetup.exe @ web.archive.org: {bytesReceivedInMegabyte}/{playsSetupExecutableSizeInMb} MB {progressInPercent}%");
                };

                client.DownloadFileCompleted += async (o, args) =>
                {
                    Main.Log("Finished downloading PlaysSetup.exe, doing a checksum");
                    await DownloadPlaysSetup(workDirectory);
                };

                await client.DownloadFileTaskAsync(
                    new Uri(InstallerSettings.GetInstallerSetting<string>(InstallerSetting.PlaysSetupUrl)),
                    workDirectory + "\\PlaysSetup.exe");
            }

            return false;
        }

        public static async Task StartExtract(StreamWriter sw, string workDirectory = null)
        {
            //part one of installation
            if (workDirectory != null)
            {
                await sw.WriteLineAsync("cd /d \"" + workDirectory + "\"");
            }

            workDirectory = workDirectory ?? Directory.GetCurrentDirectory();
            Main.Log($"Starting to work on the folder {workDirectory}");

            await sw.WriteLineAsync("nodejs-portable.exe");
            if (Directory.Exists(workDirectory + "\\temp") &&
                InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.CleanInstall))
            {
                await sw.WriteLineAsync("rd /s /q temp");
            }

            await sw.WriteLineAsync("mkdir temp");
            await sw.WriteLineAsync("7z e PlaysSetup.exe -o.\\PlaysSetup -aos");
            await sw.WriteLineAsync("copy /Y .\\PlaysSetup\\Update.exe .\\Update.exe");
            await sw.WriteLineAsync(
                "7z x .\\PlaysSetup\\Plays-3.0.0-full.nupkg -o.\\PlaysSetup\\Plays-3.0.0-full -aos");
            await sw.WriteLineAsync(
                "asar extract .\\PlaysSetup\\Plays-3.0.0-full\\lib\\net45\\resources\\app.asar temp");
            await sw.WriteLineAsync("cd temp");
            await sw.WriteLineAsync("npm init -f");
            await sw.WriteLineAsync("npm install");
            await sw.WriteLineAsync("electron-forge import");
        }

        public static async Task StartImport(StreamWriter sw)
        {
            //part two of installation
            await Task.Delay(5000);
            await sw.WriteLineAsync("y");
            await Task.Delay(5000);
            await sw.WriteLineAsync("y");
            await Task.Delay(5000);
            await sw.WriteLineAsync("src/main/main.js");
            await Task.Delay(5000);
            await sw.WriteLineAsync("n");
            await Task.Delay(5000);
        }

        public static async Task StartModify(StreamWriter sw, string workDirectory = null)
        {
            //part three of installation
            if (workDirectory == null) workDirectory = Directory.GetCurrentDirectory();

            await sw.WriteLineAsync("npm install electron-prebuilt-compile@4.0.0 --save-dev --save-exact");
            await sw.WriteLineAsync("cd ..");
            await sw.WriteLineAsync("rd /s /q .\\temp\\.cache");
            await sw.WriteLineAsync("mkdir .\\temp\\resources\\auger\\replays");
            await sw.WriteLineAsync("robocopy /E /NP /MT .\\src .\\temp\\resources\\auger\\replays");

            //--------------------------------------
            //start modifying original plays files
            //--------------------------------------

            //copying replaceables
            await sw.WriteLineAsync("robocopy /E /NP /MT .\\src-patch\\src .\\temp\\src");

            //set version
            await ModifyFileAtLineAsync(
                "log.info(`Version: " + InstallerSettings.GetInstallerSetting<string>(InstallerSetting.Version) + "`);",
                workDirectory + "\\temp\\src\\main\\main.js", 36);

            var counter = 1;
            using (var configFileReader = new StreamReader(workDirectory + "\\src-patch\\config.txt"))
            {
                while (!configFileReader.EndOfStream)
                {
                    var readLine = await configFileReader.ReadLineAsync();
                    if (readLine.StartsWith("#") || string.IsNullOrWhiteSpace(readLine))
                    {
                        continue; // if it is not a comment
                    }

                    if (!readLine.StartsWith("ModifyFileAtLine") && !readLine.StartsWith("AppendToFileAtLine"))
                    {
                        continue;
                    }

                    var command = "ModifyFileAtLine";
                    if (readLine.StartsWith("AppendToFileAtLine"))
                    {
                        command = "AppendToFileAtLine";
                    }

                    var fileName = readLine.Split(new[] {"\""}, 3, StringSplitOptions.None)[1];
                    var lineNumber = readLine.Replace(command + " \"" + fileName + "\" ", "");
                    lineNumber = lineNumber.Substring(0, lineNumber.IndexOf(' '));
                    var newLine = readLine.Replace(command + " \"" + fileName + "\" " + lineNumber + " ", "");

                    if (lineNumber.Contains("-") && command == "ModifyFileAtLine")
                    {
                        var start = int.Parse(lineNumber.Split('-')[0]);
                        var end = int.Parse(lineNumber.Split('-')[1]);

                        for (var i = start; i <= end; i++)
                        {
                            await ModifyFileAtLineAsync(newLine, workDirectory + "\\temp" + fileName, i);
                            counter++;
                        }
                    }
                    else
                    {
                        if (command == "AppendToFileAtLine")
                            await AppendToFileAtLine(newLine, workDirectory + "\\temp" + fileName,
                                int.Parse(lineNumber));
                        else
                            await ModifyFileAtLineAsync(newLine, workDirectory + "\\temp" + fileName,
                                int.Parse(lineNumber));
                        counter++;
                    }
                }

                Main.Log("Number of changes: " + counter);
            }

            await StartPackage(sw, workDirectory);
        }

        private static async Task StartPackage(TextWriter textWriter, string workDirectory = null)
        {
            //part four of installation
            await ModifyFileAtLineAsync(
                $"<version>{InstallerSettings.GetInstallerSetting<string>(InstallerSetting.Version)}-full</version>",
                workDirectory + "\\Plays.nuspec", 5);
            await textWriter.WriteLineAsync("copy /Y nuget.exe temp");
            await textWriter.WriteLineAsync("copy /Y Plays.nuspec temp");
            await textWriter.WriteLineAsync("cd temp");
            await textWriter.WriteLineAsync("npm run package");
            await textWriter.WriteLineAsync(
                "robocopy /E /NP /MT ..\\PlaysSetup\\Plays-3.0.0-full\\lib\\net45\\resources\\ltc .\\out\\Plays-win32-ia32\\resources\\ltc");
            await textWriter.WriteLineAsync("rename .\\out\\Plays-win32-ia32 net45");
            await textWriter.WriteLineAsync("nuget.exe pack");
            await StartInstallAsync(textWriter, workDirectory);
        }

        private static async Task StartInstallAsync(TextWriter textWriter, string workDirectory = null)
        {
            //part five of installation
            await textWriter.WriteLineAsync("copy /Y Plays." +
                                            InstallerSettings.GetInstallerSetting<string>(InstallerSetting.Version) +
                                            "-full.nupkg ..");
            await textWriter.WriteLineAsync("cd ..");
            await textWriter.WriteLineAsync("del /f RELEASES");

            if (workDirectory == InstallerSettings.GetInstallerSetting<string>(InstallerSetting.RePlaysDirectory))
            {
                await textWriter.WriteLineAsync("Update.exe --install=.\\");
            }
            else
            {
                await textWriter.WriteLineAsync(
                    $"echo WARNING: Current work directory is '{workDirectory}', proper work directory should be at '{InstallerSettings.GetInstallerSetting<string>(InstallerSetting.RePlaysDirectory)}', skipping completion install...");
            }

            if (InstallerSettings.GetInstallerSetting<bool>(InstallerSetting.DeleteTemp))
            {
                await textWriter.WriteLineAsync("rd /s /q temp");
            }

            await textWriter.WriteLineAsync("exit");
        }

        private static async Task ModifyFileAtLineAsync(string newText, string fileName, int lineToEdit)
        {
            var allTextFromFile = await AsynchronousFileHelper.ReadAllLinesAsync(fileName);
            allTextFromFile[lineToEdit - 1] = newText;
            await AsynchronousFileHelper.WriteAllLinesAsync(fileName, allTextFromFile);
            Main.Log($"{fileName}>>> Writing to line {lineToEdit}: {newText}");
        }

        private static async Task AppendToFileAtLine(string newText, string fileName, int lineToEdit)
        {
            var allTextFromFile = (await AsynchronousFileHelper.ReadAllLinesAsync(fileName)).ToList();
            var arrLine = File.ReadAllLines(fileName).ToList();
            arrLine.Insert(lineToEdit + 1, newText);
            await AsynchronousFileHelper.WriteAllLinesAsync(fileName, allTextFromFile);
            Main.Log($"{fileName}>>> Writing to line {lineToEdit}: {newText}");
        }
    }
}