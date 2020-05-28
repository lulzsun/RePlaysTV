# Building Release Instructions

1. Delete `Release/cache`, `Release/PlaysSetup`, and `Release/temp` folders
2. Delete `Release/nodejs-portable.log`, `Release/PlaysSetup.exe`, `Release/Plays.x.x.x-full.nupkg`, `Release/Update.exe`
3. Edit `Release/Plays.nuspec`'s version
4. Zip up all contents of `Release` to `Release.7z` and place it in root directory
5. Run `BuildSetup.bat`
6. `RePlaysSetup.exe` should now be built