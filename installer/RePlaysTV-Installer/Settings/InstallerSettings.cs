using System;
using System.Collections.Generic;

namespace RePlaysTV_Installer.Settings
{
    internal static class InstallerSettings
    {
        private static readonly Dictionary<InstallerSetting, object> InstallSettings =
            new Dictionary<InstallerSetting, object>
            {
                {
                    InstallerSetting.PlaysSetupUrl,
                    "https://web.archive.org/web/20191212211927if_/https://app-updates.plays.tv/builds/PlaysSetup.exe"
                },
                {InstallerSetting.LtcVersion, "0.54.7"},
                {InstallerSetting.CleanInstall, true},
                {InstallerSetting.DeleteTemp, false},
                {InstallerSetting.IgnoreChecksum, false},
                {InstallerSetting.Version, ""},
                {InstallerSetting.RePlaysDirectory, $"{Environment.GetEnvironmentVariable("LocalAppData")}\\RePlays"},
                {InstallerSetting.CorrectPlaysSetupHash, "3a7cea84d50ad2c31a79e66f5c3f3b8d"},
                {InstallerSetting.PlaySetupExecutableSizeInBytes, 145310344M}
            };

        public static T GetInstallerSetting<T>(string settingIdentifier)
        {
            if (string.IsNullOrWhiteSpace(settingIdentifier) ||
                !Enum.TryParse<InstallerSetting>(settingIdentifier, out var installerSetting))
                throw new ArgumentNullException(nameof(settingIdentifier));

            return GetInstallerSetting<T>(installerSetting);
        }

        public static T GetInstallerSetting<T>(InstallerSetting installerSetting)
        {
            return (T) (InstallSettings.TryGetValue(installerSetting, out var result) ? result : null);
        }

        public static bool RemoveInstallerSetting(string settingIdentifier)
        {
            if (string.IsNullOrWhiteSpace(settingIdentifier) ||
                !Enum.TryParse<InstallerSetting>(settingIdentifier, out var installerSetting))
                throw new ArgumentNullException(nameof(settingIdentifier));

            return RemoveInstallerSetting(installerSetting);
        }

        public static bool RemoveInstallerSetting(InstallerSetting installerSetting)
        {
            return InstallSettings.Remove(installerSetting);
        }

        public static void SetInstallerSetting(string settingIdentifier, object value)
        {
            if (string.IsNullOrWhiteSpace(settingIdentifier)
                || value == null
                || !Enum.TryParse<InstallerSetting>(settingIdentifier, out var installerSetting))
                throw new ArgumentNullException(nameof(settingIdentifier));

            SetInstallerSetting(installerSetting, value);
        }

        public static void SetInstallerSetting(InstallerSetting installerSetting, object value)
        {
            if (value == null || InstallSettings == null ||
                GetInstallerSetting<object>(installerSetting).Equals(value))
            {
                return;
            }

            InstallSettings[installerSetting] = value;
        }
    }
}