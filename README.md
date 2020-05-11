# RePlaysTV [![Downloads][download-badge]][download-link] [![Discord][discord-badge]][discord-link] [![Paypal][paypal-badge]][paypal-link] [![Venmo][venmo-badge]][venmo-link] 

[download-badge]: https://img.shields.io/github/downloads/lulzsun/RePlaysTV/total
[download-link]: https://github.com/lulzsun/RePlaysTV/releases/

[discord-badge]: https://img.shields.io/discord/654698116917886986?label=Discord&logo=discord
[discord-link]: https://discordapp.com/invite/Qj2BmZX

[paypal-badge]: https://img.shields.io/badge/Paypal-Donate!-%2300457C.svg?logo=paypal&style=flat
[paypal-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=AC6XUC2KNBLNN&item_name=Support+ReplaysTV+Development&currency_code=USD&source=url

[venmo-badge]: https://img.shields.io/badge/Venmo-Donate!-informational
[venmo-link]: https://venmo.com/jminquach

A community project patch for the discontinued Plays.tv client

On 12/15/19, Plays.tv discontinued support to their website and desktop application.

This is a non-profit, community-based project that patches over the existing Plays.tv software to give it a custom user interface with plenty of upload platforms and additional features.

You can also join the [Discord community](https://discordapp.com/invite/Qj2BmZX) to discuss about development, report bugs, etc.

Installation instructions below.

![Preview](/resources/preview.png)

# Installation
You must have the last Plays client installed (3.0.0). You can still download the original Plays setup from [here](https://www.dropbox.com/s/11b5fptw2qsjmn5/PlaysSetup.exe).

Instructions:
  1. Download and extract the [latest release](https://github.com/lulzsun/RePlaysTV/releases)
  2. Close out of Plays if it is currently running
  3. Open the installer executable 
     * Note (Bug): The installer directory should not contain a space (e.g C:\Downloads\Random Folder\Installer\ vs C:\Downloads\Random_Folder\Installer\)
  4. Locate/confirm the location of Plays
     * Should be located at `~/AppData/Local/Plays`
  5. Hit install and wait for the completion message popup
  
A user-made video is also [here](https://www.youtube.com/watch?v=GyWTfz2uYTM) to guide you through the installation process.

# Feature List
  * [x] Installer Executable
  * [x] Offline functionality
  * [x] Custom UI
    * [x] Themes
	* [x] Sessions Tab
	  * [x] Clip editor
	* [x] Clips Tab
	  * [x] Upload function
	* [x] Uploads Tab
	* [ ] Snapshots Tab
	* [x] Settings Tab
  * [x] Recording functionality
  * [x] Upload functionality
    * [x] Streamable
	* [ ] Gfycat
    * [ ] Youtube
	* [x] Shared folders
  * [ ] Ingame HUD functionality
    * [ ] Instant Replay 
  * [x] Deep Integration
    * [ ] League of Legends
    * [x] Counter-Strike Global Offensive
    * [ ] Dota 2
  * [x] Auto Update functionality

# TO-DO
  * Missing Features
	* Webcam settings
	* Ingame HUD
	  * This means instant replay shouldn't work, and any other related HUD functions
	* Uploads Tab Sorting
	* Snapshots Tab/Viewer
  * Disable/remove unnecessary background services
    * Minor issue, but it would be best for memory usage to get rid of them
  * Make code more maintainable

# Disclaimer
Please be aware that using this client modification is a violation of Plays.tv's Terms of Service. 

None of the authors, contributors, or anyone else connected with RePlaysTV, in any way whatsoever, can be responsible or liable for your use of the content contained in or linked from this Github repository.

# Fair Use Statement
This Github repository may contain bits of copyrighted material, the use of which may not have been specifically authorized by the copyright owner. This material is available in an effort to provide user modifications and bug fixes to improve the quality of life of the Plays.tv client, while teaching the workings behind the Plays.tv client. The material contained in this repository is distributed without profit for personal and educational purposes. Only very small portions of the original work are being referenced and those could not be used easily to duplicate the original work.

This should constitute a ‘fair use’ of any such copyrighted material (referenced and provided for in section 107 of the US Copyright Law).

If you wish to use any copyrighted material from this repository for purposes of your own that go beyond ‘fair use’, you must obtain expressed permission from the copyright owner.
