import fs from 'fs';
import Utils from '../../../../src/core/Utils';
import {updaterLog} from '../../../../src/core/Logger';

//Uses node.js process manager
const request = require('request');
const child_process = require('child_process');

let dir;

//checkForUpdate();

// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, callback) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });

    // You can also use a variable to save the output for when the script closes later
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

function checkForUpdate() {
    if(Utils.isDev()) dir = "F:\\Documents\\RePlaysTV\\RePlays-Updater";
    else dir = require('electron').remote.app.getAppPath().replace('app-3.0.1\\resources\\app.asar', 'Replays-Updater');

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
        if(err) updaterLog.error("Unable to update: ", err);
        let json = JSON.parse(body);

        //'json.body' is the change log

        if(json.tag_name != window.version) {
            updaterLog.debug(`Current RePlaysTV version '${window.version}' does not match remote version '${json.tag_name}'`);
            if (true) {;
                downloadUpdate(json.assets[0].browser_download_url, json.tag_name);
            }
        }
        else {
            updaterLog.debug(`Current RePlaysTV version '${window.version}' matches remote version`);
        }
    });
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
    const _7z = require('7zip')['7z']; //path to 7zip
    run_script(`"${_7z}"`, [`x "${zipFilePath}"`, `-o"${dir}"`, '-y'], function(err, result) {
        if(err) return updaterLog.error(err);
        if(result) {
            installUpdate();
        }
    });
}

function installUpdate() {
    run_script(`${dir}\\RePlaysTV-Installer.exe`, ["hehehehehe"], function(err, result) {
        if(err) return updaterLog.error(err);
        if(result) {
            console.log("Update successful!");
        }
    });
}