# RePlaysTV-Installer
The Installer for RePlays

If you are reading this, this is not the proper installer for end-users. This is meant for developers. Please look at the releases page for proper downloads.

# Note for Contributors
The installer is a portable developer environment that runs commands to extract 'app-3.0.0' (Original Plays 3.0.0). This 'app-3.0.0' is required to be avaliable at all times during any install/update of RePlays otherwise the install would fail. 

The installer can be run as an console app or a windows form app. The console app is meant for the background updater. The console app takes one argument which is the working directory of the installer.

There is an (minor) issue that occurs when running `electron-forge import`. I believe it is due to how the it writes to the console; the installer can't read or write to it correctly when it is active. Streamwriter closes early and the output looks messed up. The hacky workaround is to "blindly" enter the next 4 inputs (every 5 seconds send input). This means if it prompts something weird (there is possiblity) it might not give the right answer/input (pretty much the whole installer has this 'verification' issue. Someone please find a better way to do this.