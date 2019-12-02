const IPC = require('../../../src/core/IPCCapsule.js');
const { remote, ipcRenderer } = require('electron');

window.onload=function(){
    onLoader();
    document.getElementById('close').addEventListener('click', closeWindow);
    document.getElementById('minimize').addEventListener('click', minimizeWindow);
    document.getElementById('maximize').addEventListener('click', maximizeWindow);

    ipcRenderer.on(IPC.ORB_VIDEOS_EXTRACT_FINISHED,
        () => {
            $('[id*="clip-Sort-Game"]').first().trigger({ //hacky way to update the video lists
                type: 'mousedown',
                which: 1
            });
        }
    );
    ipcRenderer.on(IPC.LTC_VIDEO_THUMBNAIL_GENERATED,
        () => {
            $('[id*="sess-Sort-Game"]').first().trigger({ //hacky way to update the video lists
                type: 'mousedown',
                which: 1
            });
        }
    );
    ipcRenderer.on(IPC.ORB_GAMEDVR_STATUS_UPDATED,
        (event, payload) => {
            if(payload.isRecording == true) {
                document.getElementById("recordingStatus").style.visibility = "visible";
            }
            else {
                document.getElementById("recordingStatus").style.visibility = "hidden";
            }
        }
    );
    ipcRenderer.on(IPC.ORB_RGM_GAME_SESSION_START,
        (event, payload) => {
            if(payload.detectionData.title) {
                document.getElementById("recordingGameTitle").innerText = "Detected Game: " + payload.detectionData.title;
                console.log("Recording game: " + payload.detectionData.title);
            }
        }
    );
}

function onLoader() { //this will check if the local api is online (is there a better way to do this?)
    fetch('http://localhost:9000/').then(   //hacky way to check if local filesystem is online
        function() {
            init();
        }
    )
    .catch(function() {
        setTimeout(function () {
            onLoader();
        }, 5000);
    });
}

function closeWindow () {
    var window = remote.BrowserWindow.getFocusedWindow();
    window.close();
}

function minimizeWindow () {  
    var window = remote.BrowserWindow.getFocusedWindow();
    window.minimize();
}

function maximizeWindow () {
    var window = remote.BrowserWindow.getFocusedWindow();
    window.isMaximized() ? window.unmaximize() : window.maximize();
}

function init() {
    $("#sessions-div").load("./html/sessions.html"); 
    $("#clips-div").load("./html/clips.html"); 
    $("#uploads-div").load("./html/uploads.html"); 
    $("#settings-div").load("./html/settings.html"); 
    $("#video-editor-div").load("./html/video-editor.html"); 
    $("#video-viewer-div").load("./html/video-viewer.html"); 

    document.getElementById("loader").style.visibility = "hidden";
    document.getElementById("app").style.visibility = "visible";
}