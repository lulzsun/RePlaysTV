copy /b 7zSD.sfx + config.txt + Release.7z ReplaysSetup.exe
(
echo:VS_VERSION_INFO VERSIONINFO
echo:    FILEVERSION    1,0,0,0
echo:    PRODUCTVERSION 1,0,0,0
echo:{
echo:    BLOCK "StringFileInfo"
echo:    {
echo:        BLOCK "040904b0"
echo:        {
echo:            VALUE "CompanyName",        "lulzsun @ GitHub\0"
echo:            VALUE "FileDescription",    "RePlays Installer for Plays.tv Desktop App\0"
echo:            VALUE "FileVersion",        "1.0.0.0\0"
echo:            VALUE "LegalCopyright",     "\0"
echo:            VALUE "OriginalFilename",   "%RePlaysSetup.exe\0"
echo:            VALUE "ProductName",        "RePlays Setup\0"
echo:            VALUE "ProductVersion",     "1.0.0.0\0"
echo:        }
echo:    }
echo:    BLOCK "VarFileInfo"
echo:    {
echo:        VALUE "Translation", 0x409, 1200
echo:    }
echo:}
) >Resources.rc     &&      echo setting Resources.rc
rh.exe -open resources.rc -save resources.res -action compile -log CONSOLE
rh.exe -open "ReplaysSetup.exe" -save "ReplaysSetup.exe" -action addoverwrite -resource "resources.res"  -log CONSOLE
rh.exe -open "ReplaysSetup.exe" -save "ReplaysSetup.exe" -action addskip -res "plays.ico" -mask ICONGROUP,MAINICON, -log CONSOLE
ie4uinit.exe -ClearIconCache
pause