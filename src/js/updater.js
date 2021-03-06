import fs from 'fs';
import Utils from '../../../../src/core/Utils';
import {updaterLog} from '../../../../src/core/Logger';
import ReplaysSettingsService, {
    SETTING_REPLAYS_UPDATE_MODE,
    SETTING_REPLAYS_UPDATE_FOLDER_DIR,
    SETTING_REPLAYS_UPDATE_CHECK_FREQ,
    SETTING_REPLAYS_UPDATE_DELETE_OLD,
} from './replaysSettingsService';

//important defining variables
window.version = "3.0.3";
window.versionToDel = "3.0.2"; //for 3.0.3, 3.0.2 folder does not exist and therefore nothing to delete

//Uses node.js process manager
const request = require('request');
const child_process = require('child_process');
var dir = "F:\\Documents\\RePlaysTV\\installer\\RePlaysTV-Installer\\bin\\RePlays-Updater"; //dev define this

init();

function init() {
    if(!Utils.isDev()) dir = require('electron').remote.app.getAppPath().replace(`app-${window.version}\\resources\\app.asar`, 'Replays-Updater');

    if(ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_FOLDER_DIR) == '') {
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_UPDATE_FOLDER_DIR, dir);
        $('#sett-updateFolderDir').next('.custom-file-label').html(dir);
    }

    if(!Utils.isDev() && ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_DELETE_OLD) == true) {
        let deleteDir = require('electron').remote.app.getAppPath().replace(`app-${window.version}\\resources\\app.asar`, `app-${window.versionToDel}`);
        if (fs.existsSync(deleteDir)) {
            updaterLog.debug(`Detected old Replays to delete: '${deleteDir}', deleting.`);
            fs.rmdir(deleteDir, {recursive: true});
        } else updaterLog.debug(`Did not find dir to delete: '${deleteDir}', ignoring.`);
    }

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    checkForUpdate();
}

function checkForUpdate() {
    const options = {
        url: 'https://api.github.com/repos/lulzsun/RePlaysTV/releases/latest',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'replaystv-client'
        }
    };

    request(options, function(err, res, body) {
        if(err) return updaterLog.error("Unable to update: ", err);
        let json = JSON.parse(body);

        document.getElementById('currentVersionStr').innerHTML = window.version;
        document.getElementById('latestVersionStr').innerHTML = json.tag_name;

        if(window.version != json.tag_name) {
            updaterLog.debug(`Current RePlaysTV version '${window.version}' does not match remote version '${json.tag_name}'`);
            if (ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_MODE) == 'automatic') {
                downloadUpdate(json.assets[0].browser_download_url, json.tag_name);
            } else if (ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_MODE) == 'manual') {
                openUpdateModal("Update", "A new version of Replays is out. Start update in background?", function() { 
                    downloadUpdate(json.assets[0].browser_download_url, json.tag_name);
                    $('#update-modal').modal('toggle');
                });
            }
        }
        else {
            updaterLog.debug(`Current RePlaysTV version '${window.version}' matches remote version`);
        }
    });

    if(ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_CHECK_FREQ) != 0) {
        setTimeout(function() {
            checkForUpdate();
        }, (ReplaysSettingsService.getSetting(SETTING_REPLAYS_UPDATE_CHECK_FREQ) * 3600000));
    }
}

function downloadUpdate(download_url, version) {
    updaterLog.debug(`Downloading ReplaysTV version '${version}'`);

    var bytes = 0;
    var size = 0;
    var lastPercent = -1;
    var zipFilePath = `${dir}\\update.7z`;

    var req = request({
        method: 'GET',
        uri: download_url
    });

    var wr = fs.createWriteStream(zipFilePath);
    wr.on('error', function(err) {
        updaterLog.error('Error occured writing to file: ', err);
    });

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        size = parseInt(data.headers['content-length']*2);
    });

    req.on('error', function ( err ) {
        updaterLog.error("Error during upload: ", err);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        bytes += chunk.length;
        let percent = (((bytes += chunk.length) / size)*100).toFixed(0);
        if(percent != lastPercent) {
            lastPercent = percent;
            updaterLog.debug(lastPercent + '%');
        }
    });

    req.on('end', function() {
        updaterLog.debug("Update succesfully downloaded");
        extractUpdate(zipFilePath);
    });

    req.pipe(wr);
}

function extractUpdate(zipFilePath) {
    updaterLog.debug(`Extracing ReplaysTV update '${zipFilePath}'`);

    const _7z = require('7zip')['7z']; //path to 7zip
    run_script(`"${_7z}"`, [`x "${zipFilePath}"`, `-o"${dir}"`, '-y'], function(err, result) {
        if(err) return updaterLog.error(err);
        if(result) {
            installUpdate();
        }
    });
}

function installUpdate() {
    updaterLog.debug(`Running ReplaysTV installer '${dir}\\RePlaysTV-Installer.exe'`);

    run_script(`"${dir}\\RePlaysTV-Installer.exe"`, [`"${dir}"`], function(err, result) {
        if(err) return updaterLog.error(err);
        if(result) {
            if(result.exitCode != 0) return updaterLog.error("Update Failed: An unhandled error has occurred during the install.");

            updaterLog.debug("Update completed!");
            openUpdateModal("Update", "New update was installed! Restart Replays for update to take effect.", function() { 
                $('#update-modal').modal('toggle');
            });
        }
    });
}

function openUpdateModal(title, body, onConfirm="") {
    if(!$('#myModal').is(':visible'))
        $('#update-modal').modal('toggle');
    document.getElementById("update-modal-title").innerText = title;
    document.getElementById("update-modal-body").innerText = body;
    document.getElementById("update-model-confirm").onclick = onConfirm;
}

// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, callback) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });

    child.on('error', (error) => {
        updaterLog.error(error);  
        callback(error);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data=data.toString();   
        updaterLog.debug(data);      
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        //Here is the output from the command
        updaterLog.debug(data);  
    });

    child.on('close', (code) => {
        updaterLog.debug(`exit code: ${code}`);  
        callback(null, {"exitCode": code});
    });
}