# RePlaysTV-Installer
The Installer for RePlays

It is only required to run this installer once. RePlaysTV can update without this once it is properly installed.

# Note for Contributors
Close your eyes when looking at the code. This is code unmaintainable, but hey, at least it works?

I had a lot of trouble getting stuff to work properly, so I had to resort to some bad/hacky techniques. I recommend rewriting the installer. 

The biggest problem occurs when running `electron-forge import`. I believe it is due to how the it writes to the console; the installer can't read or write to it correctly when it is active. Streamwriter closes early and the output looks messed up. The hacky workaround is to "blindly" enter the next 4 inputs (every 5 seconds send input). This means if it prompts something weird (there is possiblity) it might not give the right answer/input (pretty much the whole installer has this 'verification' issue. This is horror, someone please find a better way to do this.

It is a fairly "simple" process, the installer just automates the manual install process shown below.

# Manual Install Process
To install RePlaysTV without the installer, Open nodejs-portable.exe and run the following commands in the following order:
1. rd /s /q temp
2. mkdir temp
3. asar extract "{YOUR_PLAYS_LOCAL_DIRECTORY}\app-3.0.0\resources\app.asar" temp
4. cd temp
5. npm init -f
6. npm install
7. electron-forge import
8. Y
9. Y
10. src/main/main.js
11. N
12. cd ..
13. rd /s /q ".\temp\.cache"
14. mkdir ".\temp\resources\auger\replays\"
15. robocopy /E /NP ".\src\" ".\temp\resources\auger\replays\"
	
Next, you must modify two files in the directory temp:
1. .\temp\src\main\UIManager.js
  * Modify line 571 to read: `const showurl = "/replays/index.html";`
  * Comment/remove lines: 608-634, 637-640
2. .\temp\core\AugerWindow.js
  * Modify line 38 to read: `window.loadURL(path.join(__dirname, '/../../resources/auger', augerRouteUrl), urlOptions);`
  * Modify line 53 to read: `nodeIntegration: true,`
		
Finally, go back to nodejs-portable.exe and run the following commands in the following order:
1. cd temp
2. npm run package
3. rmdir /s /q "{YOUR_PLAYS_LOCAL_DIRECTORY}\app-3.0.1\"
4. mkdir "{YOUR_PLAYS_LOCAL_DIRECTORY}\app-3.0.1\"
5. robocopy /E /NP ".\out\Plays-win32-ia32" "YOUR_PLAYS_LOCAL_DIRECTORY}\app-3.0.1\"

You can now open up Plays like you normally do.
