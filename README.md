# RePlaysTV
A client modification for Plays.tv

On 12/15/19, Plays.tv discontinued support to their website and desktop application.

This is a non-profit, community-based project that patches over the existing Plays.tv software to give it a custom user interface with plenty of upload platforms and additional features.

You can also join the [Discord community](https://discordapp.com/invite/Qj2BmZX) to discuss about development, report bugs, etc.

Installation instructions below.

![Preview](/resources/preview.png)

# Installation
You must have the last Plays client installed (3.0.0).

You can find a mirror download of the Plays setup [here.](https://drive.google.com/open?id=1YlQ-EU6wW8XvGUznIBrSqTvlzBv-6tkQ)

Instructions:
  1. Download and extract the [latest release](https://github.com/lulzsun/RePlaysTV/releases).
  2. Close out of Plays if it is currently running
  3. Open the installer executable 
  4. Locate/confirm the location of Plays
     * Should be located at `~/AppData/Local/Plays`
  5. Hit install and wait for the completion message popup

# Feature List
  * [x] Installer Executable
  * [x] Offline functionality
  * [x] Custom UI
	* [x] Sessions Tab
	  * [x] Playback function
	  * [x] Clip editor
	  * [ ] Deep Integration
	  * [ ] Bookmarks
	* [x] Clips Tab
	  * [x] Upload function
	* [x] Uploads Tab
	* [ ] Snapshots Tab
	* [x] Settings Tab
	  * [x] Themes
  * [x] Recording functionality
  * [x] Upload functionality
    * [x] Streamable
	* [ ] Gfycat
    * [ ] Youtube
	* [x] Shared folders
  * [ ] Ingame HUD functionality
  * [ ] Deep Integration
    * [ ] League of Legends
    * [ ] Counter-Strike Global Offensive
    * [ ] Dota 2
  * [x] Auto Update functionality

# Notable Issues / TO-DO
  * Missing Features
	* 'Custom Recorded Games' setting
	* 'Never Record Games' setting
	* Webcam settings
	* Ingame HUD
	  * This means instant replay shouldn't work, and any other related HUD functions
	* Uploads Tab Sorting
	* Snapshots Tab/Viewer
  * A some of plays.tv online services still run in the background
    * Minor issue, but it would be best for memory usage to get rid of them
	* Could be a possible reason to performance losses
  * Slow and bulky install/update process
  * Make code more maintainable

# Disclaimer
Please be aware that using this client modification is a violation of Plays.tv's Terms of Service. 

None of the authors, contributors, or anyone else connected with RePlaysTV, in any way whatsoever, can be responsible or liable for your use of the content contained in or linked from this Github repository.

# Fair Use Statement
This Github repository may contain bits of copyrighted material, the use of which may not have been specifically authorized by the copyright owner. This material is available in an effort to provide user modifications and bug fixes to improve the quality of life of the Plays.tv client, while teaching the workings behind the Plays.tv client. The material contained in this repository is distributed without profit for personal and educational purposes. Only very small portions of the original work are being referenced and those could not be used easily to duplicate the original work.

This should constitute a ‘fair use’ of any such copyrighted material (referenced and provided for in section 107 of the US Copyright Law).

If you wish to use any copyrighted material from this repository for purposes of your own that go beyond ‘fair use’, you must obtain expressed permission from the copyright owner.
