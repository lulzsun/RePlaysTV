import ReplaysSettingsService, {
    UPLOAD,
    SETTING_REPLAYS_THEME,
    SETTING_REPLAYS_UPLOAD_DEFAULT,
    SETTING_REPLAYS_STREAMABLE_EMAIL,
    SETTING_REPLAYS_STREAMABLE_PASS,
    SETTING_REPLAYS_SHAREDFOLDER_DIR,
    SETTING_REPLAYS_UPDATE_MODE,
    SETTING_REPLAYS_UPDATE_FOLDER_DIR,
    SETTING_REPLAYS_UPDATE_CHECK_FREQ,
} from './replaysSettingsService';
import { SETTING_EXTERNAL_VIDEO_DIRS } from '../../../../src/service/FolderService';
import SettingsService, {
    SETTING_MAIN_AUTO_START_APP,
    SETTING_MAIN_DETECT_ELEVATED_PROCESSES,
    SETTING_MAIN_PYQT_MIGRATION_TIME,
    SETTING_MAIN_REMEMBER_ME,
    SETTING_MAIN_START_MINIMIZED,
    SETTING_MAIN_VIDEO_PRUNE_TIME,
    SETTING_MAIN_VIDEO_SAVE_DIR,
    SETTING_MAIN_VIDEO_TMP_DIR,
    // Keybind mappings - used in KEYBIND_SETTING_MAP to create keybinds
    SETTING_KB_BOOKMARK,
    SETTING_KB_INSTANT_REPLAY,
    SETTING_KB_PUSH_TO_TALK,
    SETTING_KB_SAVE_HIGHLIGHT,
    SETTING_KB_TAKE_SCREENSHOT,
    SETTING_KB_START_STOP_REC,
    SETTING_KB_TOGGLE_MUTE_AUDIO,
    SETTING_KB_TOGGLE_MUTE_MIC,
    // LTC settings
    SETTING_LTC_STARTUP_PARAMS,
    // Messaging settings
    SETTING_MESSAGING_AUDIO_ENABLED,
} from '../../../../src/service/SettingsService';
import GameDVRService, {
    SETTING_AUDIO_DEVICES_MICROPHONE,
    SETTING_AUDIO_GAME_ENABLED,
    SETTING_AUDIO_MIC_ENABLED,
    SETTING_AUDIO_MIC_RECORDING_MODE,
    //SETTING_AUDIO_SPECTATE_SFX_VOLUME, useless, but keeping for future purposes
    SETTING_AUDIO_VOLUME_GAME_AUDIO,
    SETTING_AUDIO_VOLUME_MICROPHONE,
    SETTING_AUTO_DELETE_ON_SHARE,
    SETTING_AUTO_MANAGE_DISKSPACE_THRESHOLD,
    SETTING_AUTO_MANAGE_TIMESTAMP_THRESHOLD,
    SETTING_AUTO_MANAGE_TYPE,
    SETTING_AUTO_MANAGE_VIDEOS,
    SETTING_AUTO_RECORD,
    SETTING_AUTO_UPLOAD_CLIP,
    SETTING_HIGHLIGHT_LENGTH_SECS,
    SETTING_IR_LENGTH_SECS,
    SETTING_MANUAL_RECORD,
    SETTING_OPTIMIZE_FOR_UPLOAD,
    SETTING_OVERLAY_LOCATION,
    SETTING_PIN_DURATION_SECS,
    SETTING_RECORD_MOUSE_CURSOR,
    SETTING_SHOW_RECORDING_TIMER,
    SETTING_VIDEO_BITRATE,
    SETTING_VIDEO_FRAMERATE,
    SETTING_VIDEO_RECORDING_MODE,
    SETTING_VIDEO_RESOLUTION,
    SETTING_WEBCAM_DEVICE_ID,
    SETTING_WEBCAM_ENABLED,
    SETTING_WEBCAM_LOCATION,
    SETTING_WEBCAM_OPACITY,
} from '../../../../src/service/GameDVRService';
import KeyBindService from '../../../../src/service/KeyBindService.js';
import GameDetectionService from '../../../../src/service/GameDetectionService.js';
import UserDetectionService from '../../../../src/service/UserDetectionService.js';
import { log } from '../../../../src/core/Logger.js';
import to from 'await-to-js';
import shortid from 'shortid';
//import { SETTING_RECORD_GAME_MOUSE_CURSOR } from '../../../../src/service/Analytics/Consts';
const {shell, remote} = require('electron');

$( document ).ready(function() {
    init();
});

const GENERAL = [
    SETTING_MAIN_AUTO_START_APP,
    SETTING_MAIN_START_MINIMIZED,
    SETTING_MAIN_REMEMBER_ME,
    SETTING_MAIN_DETECT_ELEVATED_PROCESSES,
    SETTING_KB_TAKE_SCREENSHOT,
    SETTING_OVERLAY_LOCATION,
    SETTING_SHOW_RECORDING_TIMER,
]

const VIDEO = [
    SETTING_VIDEO_RECORDING_MODE,
    SETTING_AUTO_RECORD,
    SETTING_MANUAL_RECORD,
    SETTING_KB_START_STOP_REC,
    SETTING_AUTO_UPLOAD_CLIP,   //this is disabled for now, since it will try to upload to plays.
    SETTING_HIGHLIGHT_LENGTH_SECS, //replay
    SETTING_KB_SAVE_HIGHLIGHT,
    SETTING_KB_BOOKMARK,
    SETTING_IR_LENGTH_SECS,
    SETTING_KB_INSTANT_REPLAY,
    SETTING_VIDEO_RESOLUTION,
    SETTING_VIDEO_FRAMERATE,
    SETTING_VIDEO_BITRATE,
    SETTING_RECORD_MOUSE_CURSOR,
    //SETTING_RECORD_GAME_MOUSE_CURSOR, //what is the difference of the one above?
    SETTING_WEBCAM_ENABLED,
    //SETTING_WEBCAM_DEVICE_ID, //currently not used, only because lazy to make the elements for the settings, sorry!
    //SETTING_WEBCAM_LOCATION,  //TO DO: add these later
    //SETTING_WEBCAM_OPACITY,   //TO DO: add these later
]

const AUDIO = [
    SETTING_AUDIO_GAME_ENABLED,
    SETTING_KB_TOGGLE_MUTE_AUDIO,
    SETTING_AUDIO_VOLUME_GAME_AUDIO,
    SETTING_AUDIO_MIC_ENABLED,
    SETTING_AUDIO_DEVICES_MICROPHONE,
    SETTING_AUDIO_MIC_RECORDING_MODE,
    SETTING_AUDIO_VOLUME_MICROPHONE,
    SETTING_KB_TOGGLE_MUTE_MIC,
    SETTING_KB_PUSH_TO_TALK,
]

const ADVANCED = [
    SETTING_MAIN_VIDEO_SAVE_DIR,
    SETTING_MAIN_VIDEO_TMP_DIR,
    SETTING_EXTERNAL_VIDEO_DIRS,
    SETTING_AUTO_MANAGE_VIDEOS,
    SETTING_AUTO_MANAGE_TYPE,
    SETTING_AUTO_MANAGE_DISKSPACE_THRESHOLD,
    SETTING_AUTO_MANAGE_TIMESTAMP_THRESHOLD,
]

function init() {
    //load all setting sub tabs
    $("#settings-general-div").load("./html/settings/general.html"); 
    $("#settings-video-div").load("./html/settings/video.html"); 
    $("#settings-audio-div").load("./html/settings/audio.html"); 
    $("#settings-upload-div").load("./html/settings/upload.html"); 
    $("#settings-advanced-div").load("./html/settings/advanced.html"); 
    $("#settings-update-div").load("./html/settings/update.html"); 
    $("#settings-help-div").load("./html/settings/help.html"); 
    $("#settings-about-div").load("./html/settings/about.html"); 
    SettingsService.init();
    setTimeout(function(){ //sometimes the html loads slower than these functions
        initGeneral();
        initVideo(); 
        initAudio(); 
        initUpload();
        initAdvanced();
        initUpdate();
        document.getElementById("sett-openDevTools").onclick = () => remote.BrowserWindow.getFocusedWindow().webContents.openDevTools();
    }, 1000);
}

var externalFolders;
function initGeneral() {
    SettingsService.getSettings(GENERAL).then((setting) => {
        if(setting){
            $('#sett-autoStartApp').prop('checked', setting.autoStartApp); 
            $('#sett-startMinimized').prop('checked', setting.startMinimized); 
            $('#sett-rememberMe').prop('checked', setting.rememberMe); 
            $('#sett-detectElevatedProcesses').prop('checked', setting.detectElevatedProcesses); 
            document.getElementById("sett-keybindTakeScreenshot").innerText = setting.keybindTakeScreenshot;
            $('#sett-overlayLocation-'+setting.overlayLocation).prop('checked', setting.overlayLocation); 
            $('#sett-showRecordingTimer').prop('checked', setting.showRecordingTimer); 
            //console.log(setting);
        }else console.error("General settings missing?");
    })

    ReplaysSettingsService.getSettings(UPLOAD).then((setting) => {
        if(setting){
            if(setting.theme == "Dark")
                document.getElementById("css-theme").href = "./css/bootstrap-dark.css";
            else if(setting.theme == "Light")
                document.getElementById("css-theme").href = "./css/bootstrap-light.css";
            else
                document.getElementById("css-theme").href = "./css/bootstrap.css";
            //console.log(setting);
        }else console.error("Theme setting missing?");
    });
}

function initVideo() {
    SettingsService.getSettings(VIDEO).then((setting) => {
        if(setting){
            $('#sett-autoRecord').prop('checked', setting.autoRecord); 
            $('#sett-manualRecord').prop('checked', setting.manualRecord); 
            if(!setting.manualRecord && !setting.autoRecord)
                $('#sett-offRecord').prop('checked', true); 
            document.getElementById("sett-keybindStartStopRec").innerText = setting.keybindStartStopRec;
            document.getElementById("sett-highlightLengthSecs").innerText = setting.highlightLengthSecs + " Seconds";
            document.getElementById("sett-keybindSaveHighlight").innerText = setting.keybindSaveHighlight;
            document.getElementById("sett-keybindBookmark").innerText = setting.keybindBookmark;
            document.getElementById("sett-instantReplayLengthSecs").innerText = setting.instantReplayLengthSecs + " Seconds";
            document.getElementById("sett-keybindInstantReplay").innerText = setting.keybindInstantReplay;
            if(setting.videoFramerate == 30){
                if(setting.videoResolution == 480 && setting.videoBitrate == 5) 
                    $('#sett-qualityPresets-low').prop('checked', true); 
                else if(setting.videoResolution == 720 && setting.videoBitrate == 10) 
                    $('#sett-qualityPresets-med').prop('checked', true); 
                else if(setting.videoResolution == 1080 && setting.videoBitrate == 15) 
                    $('#sett-qualityPresets-med').prop('checked', true); 
                else 
                    $('#sett-qualityPresets-cust').prop('checked', true); 
            }else $('#sett-qualityPresets-cust').prop('checked', true); 
            document.getElementById("sett-videoResolution").innerText = setting.videoResolution + "p";
            document.getElementById("sett-videoFramerate").innerText = setting.videoFramerate + "fps";
            document.getElementById("sett-videoBitrate").innerText = setting.videoBitrate + "Mbps";
            $('#sett-recordMouseCursor').prop('checked', setting.recordMouseCursor); 
            $('#sett-webcamEnabled').prop('checked', setting.webcamEnabled); 
            // $('#sett-overlayLocation-'+setting.overlayLocation).prop('checked', setting.overlayLocation); 
            //console.log(setting);
        }else console.error("Video settings missing?");
    })
}

function initAudio() {
    SettingsService.getSettings(AUDIO).then((setting) => {
        if(setting){
            $('#sett-audioGameEnabled').prop('checked', setting.audioGameEnabled); 
            document.getElementById("sett-audioRecordVolumeGameAudio").value = setting.audioRecordVolumeGameAudio*100;
            document.getElementById("gameAudioLabel").innerText = setting.audioRecordVolumeGameAudio*100 + "%"
            document.getElementById("sett-keybindToggleMuteAudio").innerText = setting.keybindToggleMuteAudio;
            document.getElementById("sett-audioRecordVolumeMicrophone").value = setting.audioRecordVolumeMicrophone*100;
            document.getElementById("micAudioLabel").innerText = setting.audioRecordVolumeMicrophone*100 + "%"
            document.getElementById("sett-audioRecordingDevices").innerText = setting.audioRecordingDevices[0].label.substring(0,35);
            SettingsService.getAudioInputDevices().then((result) => {
                result.forEach((device) => {
                    const mic = document.createElement('a');
                    mic.setAttribute('id', "sett-audioRecordingDevices-" + device.deviceId);
                    mic.setAttribute('class', 'dropdown-item');
                    mic.setAttribute('href', '#');
                    mic.innerText = device.label;
                    document.getElementById("micDeviceList").append(mic);
                });
            });
            $('#sett-audioMicrophoneRecordingMode-'+setting.audioMicrophoneRecordingMode).prop('checked', setting.audioMicrophoneRecordingMode);
            if(setting.audioMicrophoneRecordingMode == "push_to_talk") 
                document.getElementById("sett-keybindToggleMuteMic").innerText = setting.keybindPushToTalk;
            else
                document.getElementById("sett-keybindToggleMuteMic").innerText = setting.keybindToggleMuteMic;
            //console.log(setting);
        }else console.error("Audio settings missing?");
    });
    $('#sett-audioRecordVolumeGameAudio').on('input',function(e){
        var value = e.target.value;
        document.getElementById("gameAudioLabel").innerText = value + "%";
        SettingsService.setSetting(SETTING_AUDIO_VOLUME_GAME_AUDIO, value / 100);
    })

    $('#sett-audioRecordVolumeMicrophone').on('input',function(e){
        var value = e.target.value;
        document.getElementById("micAudioLabel").innerText = value + "%";
        SettingsService.setSetting(SETTING_AUDIO_VOLUME_MICROPHONE, value / 100);
    })
}

function initUpload() {
    ReplaysSettingsService.getSettings(UPLOAD).then((setting) => {
        if(setting){
            document.getElementById('sett-streamableEmail').value = setting.streamableEmail;
            document.getElementById('sett-streamablePass').value = setting.streamablePass;
            $('#sett-sharedFolderDir').next('.custom-file-label').html(setting.sharedFolderDir);
            //console.log(setting);
        }else console.error("Upload settings missing?");
    });

    $('#sett-streamableEmail').on('change',function(e){
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_STREAMABLE_EMAIL, e.target.value);
    })

    $('#sett-streamablePass').on('change',function(e){
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_STREAMABLE_PASS, e.target.value);
    })

    $('#sett-sharedFolderDir').on('change',function(e){
        var fileName = e.target.files[0].path;
        $(this).next('.custom-file-label').html(fileName);
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_SHAREDFOLDER_DIR, fileName);
    })
}

function initUpdate() {
    ReplaysSettingsService.getSettings(UPLOAD).then((setting) => {
        if(setting){
            $('#sett-updateMode-'+setting.updateMode).prop('checked', true); 
            $('#sett-updateFolderDir').next('.custom-file-label').html(setting.updateFolderDir);
            document.getElementById('sett-updateCheckFreq').value = setting.updateCheckFreq;
            //console.log(setting);
        }else console.error("Update settings missing?");
    });

    $('#sett-updateFolderDir').on('change',function(e){
        var fileName = e.target.files[0].path;
        $(this).next('.custom-file-label').html(fileName);
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_SHAREDFOLDER_DIR, fileName);
    })

    $('#sett-updateCheckFreq').on('input',function(event){
        ReplaysSettingsService.setSetting(SETTING_REPLAYS_UPDATE_CHECK_FREQ, event.target.value);
    })
}

function initAdvanced() {
    SettingsService.getSettings(ADVANCED).then((setting) => {
        if(setting){
            externalFolders = setting.externalFolders;
            if(externalFolders.length != 0)
                externalFolders.forEach(folder => addExternalFolder(folder));
            $('#sett-videoSaveDirectory').next('.custom-file-label').html(setting.videoSaveDirectory);
            $('#sett-videoTmpDirectory').next('.custom-file-label').html(setting.videoTmpDirectory);
            $('#sett-autoManageType-'+setting.autoManageType).prop('checked', true); 
            $('#sett-autoManageVideos').prop('checked', setting.autoManageVideos);
            document.getElementById("sett-autoManageDiskspaceThreshold").value = setting.autoManageDiskspaceThreshold;
            document.getElementById("sett-autoManageTimestampThreshold").value = setting.autoManageTimestampThreshold;
            updateUserDetectionList();
            //console.log(setting);
        }else console.error("Advanced settings missing?");
    });

    $('#sett-videoSaveDirectory').on('change',function(e){
        var fileName = e.target.files[0].path;
        $(this).next('.custom-file-label').html(fileName);
        SettingsService.setSetting(SETTING_MAIN_VIDEO_SAVE_DIR, fileName);
    })

    $('#sett-videoTmpDirectory').on('change',function(e){
        var fileName = e.target.files[0].path;
        $(this).next('.custom-file-label').html(fileName);
        SettingsService.setSetting(SETTING_MAIN_VIDEO_TMP_DIR, fileName);
    })

    $('#sett-addExternalFolder').on('input',function(event){
        externalFolders.push(event.target.files[0].path);
        SettingsService.setSetting(SETTING_EXTERNAL_VIDEO_DIRS, externalFolders).then(function(){
            addExternalFolder(event.target.files[0].path);
        }).catch(function(error) {
            alert(error.message);
        });
    })

    $('#sett-autoManageDiskspaceThreshold').on('input',function(event){
        SettingsService.setSetting(SETTING_AUTO_MANAGE_DISKSPACE_THRESHOLD, event.target.value);
    })

    $('#sett-autoManageTimestampThreshold').on('input',function(event){
        SettingsService.setSetting(SETTING_AUTO_MANAGE_TIMESTAMP_THRESHOLD, event.target.value);
    })
}

$("#settings-general-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("autoStartApp")){
            SettingsService.setSetting(SETTING_MAIN_AUTO_START_APP, !$(element).is(":checked"));
        }
        if(element.id.includes("startMinimized")){
            SettingsService.setSetting(SETTING_MAIN_START_MINIMIZED, !$(element).is(":checked"));
        }
        if(element.id.includes("rememberMe")){
            SettingsService.setSetting(SETTING_MAIN_REMEMBER_ME, !$(element).is(":checked"));
        }
        if(element.id.includes("detectElevatedProcesses")){
            SettingsService.setSetting(SETTING_MAIN_DETECT_ELEVATED_PROCESSES, !$(element).is(":checked"));
        }
        if(element.id.includes("keybindTakeScreenshot")){
            onKeybind(element, SETTING_KB_TAKE_SCREENSHOT);
        }
        if(element.id.includes("overlayLocation")){
            SettingsService.setSetting(SETTING_OVERLAY_LOCATION, element.id.split("-")[2]);
        }
        if(element.id.includes("showRecordingTimer")){
            SettingsService.setSetting(SETTING_SHOW_RECORDING_TIMER, !$(element).is(":checked"));
        }
        if(element.id.includes("theme")){
            if(element.id.split("-")[2]) {
                ReplaysSettingsService.setSetting(SETTING_REPLAYS_THEME, element.id.split("-")[2]);
                document.getElementById("sett-theme").innerText = element.id.split("-")[2];
                if(element.id.split("-")[2] == "Dark")
                    document.getElementById("css-theme").href = "./css/bootstrap-dark.css";
                else if(element.id.split("-")[2] == "Light")
                    document.getElementById("css-theme").href = "./css/bootstrap-light.css";
                else
                    document.getElementById("css-theme").href = "./css/bootstrap.css";
            }
        }
    }
});

$("#settings-video-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("autoRecord")){
            SettingsService.setSetting(SETTING_VIDEO_RECORDING_MODE, "automatic");
            SettingsService.setSetting(SETTING_AUTO_RECORD, !$(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, $(element).is(":checked"));
        }
        if(element.id.includes("manualRecord")){
            SettingsService.setSetting(SETTING_VIDEO_RECORDING_MODE, "manual");
            SettingsService.setSetting(SETTING_AUTO_RECORD, $(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, !$(element).is(":checked"));
        }
        if(element.id.includes("desktopRecord")){
            alert("This feature is not reimplemented yet.");
        }
        if(element.id.includes("offRecord")){
            SettingsService.setSetting(SETTING_VIDEO_RECORDING_MODE, "off");
            SettingsService.setSetting(SETTING_AUTO_RECORD, $(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, $(element).is(":checked"));
        }
        if(element.id.includes("keybindStartStopRec")){
            onKeybind(element, SETTING_KB_START_STOP_REC);
        }
        if(element.id.includes("highlightLengthSecs")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_HIGHLIGHT_LENGTH_SECS, element.id.split("-")[2]);
                document.getElementById("sett-highlightLengthSecs").innerText = element.id.split("-")[2] + " Seconds";
            }
        }
        if(element.id.includes("keybindSaveHighlight")){
            onKeybind(element, SETTING_KB_SAVE_HIGHLIGHT);
        }
        if(element.id.includes("keybindBookmark")){
            onKeybind(element, SETTING_KB_BOOKMARK);
        }
        if(element.id.includes("instantReplayLengthSecs")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_IR_LENGTH_SECS, element.id.split("-")[2]);
                document.getElementById("sett-instantReplayLengthSecs").innerText = element.id.split("-")[2] + " Seconds";
            }
        }
        if(element.id.includes("keybindInstantReplay")){
            onKeybind(element, SETTING_KB_INSTANT_REPLAY);
        }
        if(element.id.includes("qualityPresets")){
            if(element.id.split("-")[2] == "low"){
                SettingsService.setSetting(SETTING_VIDEO_RESOLUTION, 480);
                SettingsService.setSetting(SETTING_VIDEO_FRAMERATE, 30);
                SettingsService.setSetting(SETTING_VIDEO_BITRATE, 5);
                document.getElementById("sett-videoResolution").innerText = "480p";
                document.getElementById("sett-videoFramerate").innerText = "30fps";
                document.getElementById("sett-videoBitrate").innerText = "5Mbps";
            }else if(element.id.split("-")[2] == "med"){
                SettingsService.setSetting(SETTING_VIDEO_RESOLUTION, 720);
                SettingsService.setSetting(SETTING_VIDEO_FRAMERATE, 30);
                SettingsService.setSetting(SETTING_VIDEO_BITRATE, 10);
                document.getElementById("sett-videoResolution").innerText = "720p";
                document.getElementById("sett-videoFramerate").innerText = "30fps";
                document.getElementById("sett-videoBitrate").innerText = "10Mbps";
            }else if(element.id.split("-")[2] == "high"){
                SettingsService.setSetting(SETTING_VIDEO_RESOLUTION, 1080);
                SettingsService.setSetting(SETTING_VIDEO_FRAMERATE, 30);
                SettingsService.setSetting(SETTING_VIDEO_BITRATE, 15);
                document.getElementById("sett-videoResolution").innerText = "1080p";
                document.getElementById("sett-videoFramerate").innerText = "30fps";
                document.getElementById("sett-videoBitrate").innerText = "15Mbps";
            }
        }
        if(element.id.includes("videoResolution")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_VIDEO_RESOLUTION, element.id.split("-")[2]);
                document.getElementById("sett-videoResolution").innerText = element.id.split("-")[2] + "p";
                $('#sett-qualityPresets-cust').prop('checked', true); 
            }
        }
        if(element.id.includes("videoFramerate")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_VIDEO_FRAMERATE, element.id.split("-")[2]);
                document.getElementById("sett-videoFramerate").innerText = element.id.split("-")[2] + "fps";
                $('#sett-qualityPresets-cust').prop('checked', true); 
            }
        }
        if(element.id.includes("videoBitrate")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_VIDEO_BITRATE, element.id.split("-")[2]);
                document.getElementById("sett-videoBitrate").innerText = element.id.split("-")[2] + "Mbps";
                $('#sett-qualityPresets-cust').prop('checked', true); 
            }
        }
        if(element.id.includes("recordMouseCursor")){
            SettingsService.setSetting(SETTING_RECORD_MOUSE_CURSOR, !$(element).is(":checked"));
        }
        if(element.id.includes("webcamEnabled")){
            SettingsService.setSetting(SETTING_WEBCAM_ENABLED, !$(element).is(":checked"));
            //alert("If you actually use this and want to see the settings for webcam, \nthey currently do not exist. Please ask dev to add them in.");
        }
    }
});

$("#settings-audio-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("audioGameEnabled")){
            SettingsService.setSetting(SETTING_AUDIO_GAME_ENABLED, !$(element).is(":checked"));
        }
        // if(element.id.includes("audioRecordVolumeGameAudio")){
        //     document.getElementById("gameAudioLabel").innerText = element.value + "%";
        //     SettingsService.setSetting(SETTING_AUDIO_VOLUME_GAME_AUDIO, element.value / 100);
        // }
        if(element.id.includes("keybindToggleMuteAudio")){
            onKeybind(element, SETTING_KB_TOGGLE_MUTE_AUDIO);
        }
        // if(element.id.includes("audioRecordVolumeMicrophone")){
        //     document.getElementById("micAudioLabel").innerText = element.value + "%";
        //     SettingsService.setSetting(SETTING_AUDIO_VOLUME_MICROPHONE, element.value / 100);
        // }
        if(element.id.includes("audioRecordingDevices")){
            if(element.id.split("-")[2]) {
                SettingsService.setSetting(SETTING_AUDIO_DEVICES_MICROPHONE, [{"deviceId": element.id.split("-")[2], "label": element.innerText}]);
                document.getElementById("sett-audioRecordingDevices").innerText = element.innerText.substring(0,35);
            }
        }
        if(element.id.includes("audioMicrophoneRecordingMode")){
            if(element.id.split("-")[2]){
                if(element.id.split("-")[2] == "disabled")
                    SettingsService.setSetting(SETTING_AUDIO_MIC_ENABLED, false);
                else SettingsService.setSetting(SETTING_AUDIO_MIC_ENABLED, true);
                if(element.id.split("-")[2] == "push_to_talk")
                    SettingsService.setSetting(SETTING_KB_PUSH_TO_TALK, document.getElementById("sett-keybindToggleMuteMic").innerText);
                else SettingsService.setSetting(SETTING_KB_TOGGLE_MUTE_MIC, document.getElementById("sett-keybindToggleMuteMic").innerText);
                SettingsService.setSetting(SETTING_AUDIO_MIC_RECORDING_MODE, element.id.split("-")[2]);
            }
        }
        if(element.id.includes("keybindToggleMuteMic")){
            if($("#sett-audioMicrophoneRecordingMode-push_to_talk").is(":checked"))
                onKeybind(element, SETTING_KB_PUSH_TO_TALK);
            else{
                onKeybind(element, SETTING_KB_TOGGLE_MUTE_MIC);
            }
        }
    }
});

$("#settings-upload-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("uploadDefault")){
            if(element.id.split("-")[2]) {
                ReplaysSettingsService.setSetting(SETTING_REPLAYS_UPLOAD_DEFAULT, element.id.split("-")[2]);
                alert(element.id.split("-")[2] + ' set as upload default.');
            }
        }
        if(element.id.includes("openSharedFolderDir")){
            shell.openItem($('#sett-sharedFolderDir').next('.custom-file-label').text());
        }
    }
});

$("#settings-update-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("updateMode")){
            ReplaysSettingsService.setSetting(SETTING_REPLAYS_UPDATE_MODE, element.id.split("-")[2]);
        }
        if(element.id.includes("openUpdateFolderDir")){
            shell.openItem($('#sett-updateFolderDir').next('.custom-file-label').text());
        }
    }
});

$("#settings-advanced-div").mousedown(function (e) {
    var element;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("openVideoSaveDir")){
            shell.openItem($('#sett-videoSaveDirectory').next('.custom-file-label').text());
        }
        if(element.id.includes("openVideoTmpDir")){
            shell.openItem($('#sett-videoTmpDirectory').next('.custom-file-label').text());
        }
        if(element.id.includes("autoManageVideos")){
            SettingsService.setSetting(SETTING_AUTO_MANAGE_VIDEOS, !$(element).is(":checked"));
        }
        if(element.id.includes("autoManageType")){
            SettingsService.setSetting(SETTING_AUTO_MANAGE_TYPE, element.id.split("-")[2]);
        }
    }
});

//userDetections
async function addUserDetection(fileList, type) {
    //const fileList = document.getElementById('input-game-exe').files;
    const fileArray = [];
    for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
      fileArray.push({
        name: fileList[fIdx].name,
        path: fileList[fIdx].path,
      });
    }
    const gameExePath = fileArray[0].path;
  
    const payload = {
      gameExePath,
    };
    const [errGetDet, gameDetection] = await to(GameDetectionService.getDetectionByLTCData(payload));
    
    const gameTitle = (!errGetDet && gameDetection && gameDetection.detection.title)
      ? gameDetection.detection.title
      : fileArray[0].name;
  
    const userDetectionData = {
      det_exe: gameExePath,
      title: gameTitle,
      type: type,
    };
    log.debug(`Creating detection: ${JSON.stringify(userDetectionData)}`);
    const [err] = await to(UserDetectionService.createUserDetection(userDetectionData));
    if (err) {
        log.error(`createUserDetection err: ${err}`);
    }
    updateUserDetectionList();
}

async function removeUserDetection(id) {
    const detId = id;
    const [err] = await to(UserDetectionService.deleteUserDetection(detId));
    if (err) {
      log.error(`deleteUserDetection err: ${err}`);
      return;
    }
    log.debug(`deleted user detection _id: ${detId}`);
    updateUserDetectionList();
}

async function updateUserDetectionList() {
    const [err, userDetections] = await to(UserDetectionService.getUserDetections());
    if (err) {
        log.error(`getUserDetections err: ${err}`);
      return;
    }
    log.debug(`user detections: ${JSON.stringify(userDetections)}`);

    //update dom objects
    document.getElementById("exeWhitelist").innerHTML = '';
    document.getElementById("exeBlacklist").innerHTML = '';

    for (var key in userDetections) {
        let id = userDetections[key]._id;
        let title = userDetections[key].title;
        const dom = document.createElement('label');
        dom.setAttribute('id', id);
        dom.setAttribute('class', 'btn btn-outline-secondary m-1');
        dom.setAttribute('style', 'cursor:pointer');
        dom.onmouseover = function(){dom.setAttribute('class', 'btn btn-outline-danger m-1');};
        dom.onmouseout = function(){dom.setAttribute('class', 'btn btn-outline-secondary m-1');};
        dom.onclick = function(){removeUserDetection(id);};
        dom.innerText = title;
        //userDetections[key].det_exe - if need full directory

        if(userDetections[key].type == "whitelist")
            document.getElementById("exeWhitelist").append(dom);
        else 
            document.getElementById("exeBlacklist").append(dom);
    }

    const addGameBtn1 = document.createElement('label');
    addGameBtn1.setAttribute('class', 'btn btn-secondary m-1');
    addGameBtn1.setAttribute('style', 'cursor:pointer');
    addGameBtn1.innerText = 'Add Game';

    const input1 = document.createElement('input');
    input1.setAttribute('id', 'sett-addToBlacklist');
    input1.setAttribute('style', 'display:none');
    input1.setAttribute('type', 'file');
    addGameBtn1.append(input1);
    document.getElementById("exeBlacklist").append(addGameBtn1);

    const addGameBtn2 = document.createElement('label');
    addGameBtn2.setAttribute('class', 'btn btn-secondary m-1');
    addGameBtn2.setAttribute('style', 'cursor:pointer');
    addGameBtn2.innerText = 'Add Game';

    const input2 = document.createElement('input');
    input2.setAttribute('id', 'sett-addToWhitelist');
    input2.setAttribute('style', 'display:none');
    input2.setAttribute('type', 'file');
    addGameBtn2.append(input2);
    document.getElementById("exeWhitelist").append(addGameBtn2);

    $('#sett-addToWhitelist').on('change',function(e){
        addUserDetection(e.target.files, 'whitelist');
    })

    $('#sett-addToBlacklist').on('change',function(e){
        addUserDetection(e.target.files, 'blacklist');
    })
}

//keybinding
window.onkeydown = setKey;
var currentKeyDOM;
var currentKey;
function setKey(event) {
    const newKey = KeyBindService.createKey(event);
    currentKey = newKey.keyBind;
    if(currentKeyDOM != null)
        currentKeyDOM.innerText = currentKey;

    if (!newKey.valid) {
      log.debug(`Missing key detection: ${event.code}`);
    }
}

function onKeybind(element, setting) {
    if (currentKeyDOM == element && currentKey) {
        currentKeyDOM = null;
        element.innerText = currentKey;
        element.setAttribute('class', 'btn btn-outline-primary');
        SettingsService.setSetting(setting, currentKey);
        return;
    }

    currentKeyDOM = element;
    element.innerText = "";
    element.setAttribute('class', 'btn btn-outline-warning');
}

//external folders
function addExternalFolder(fileName) {
    var id = shortid.generate();

    const folder = document.createElement('div');
    folder.setAttribute('id', id);
    folder.setAttribute('style', 'clear:both;')
    const a = document.createElement('div');
    a.setAttribute('class', 'input-group mb-3');
    a.setAttribute('style', "float: left; width: 75%");
    folder.append(a);
    const b = document.createElement('input');
    b.setAttribute('class', 'form-control');
    b.setAttribute('type', 'text');
    b.setAttribute('value', fileName);
    b.setAttribute('style', 'pointer-events: none');
    a.append(b);
    const c = document.createElement('button');
    c.setAttribute('class', 'btn btn-primary');
    c.setAttribute('type', 'button');
    c.onclick = function() { 
        externalFolders = externalFolders.filter(e => e !== fileName);
        SettingsService.setSetting(SETTING_EXTERNAL_VIDEO_DIRS, externalFolders);
        $('#sett-addExternalFolder').val(null);
        document.getElementById(id).remove();
    };
    c.innerText = "Delete";
    a.append(c);
    const d = document.createElement('div');
    folder.append(d);
    const e = document.createElement('button');
    e.setAttribute('class', 'btn btn-secondary');
    e.setAttribute('type', 'button');
    e.onclick = function() { 
        shell.openItem(fileName);
    };
    e.innerText = "Open Folder";
    d.append(e);
    document.getElementById("extFoldersList").append(folder);
}