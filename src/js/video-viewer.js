import moment from 'moment';
import { makeUploadDOM } from './uploads';
import ReplaysSettingsService, {
    UPLOAD
} from './replaysSettingsService';
import {deleteVideo, getVideoById} from './clips';

// Uploaders
import Streamable from './libs/uploaders/streamable';
import SharedFolder from './libs/uploaders/sharedFolder';

var continuePlay, sliding;
var seeker;
var videoClipDom = document.createElement('video'); //video playback on the viewer

export default function openVideoViewer(video) {
    if(videoClipDom == null)
        videoClipDom = document.createElement('video');

    console.log(video.url);
    const videoSource = document.createElement('source');
    videoClipDom.setAttribute('id', `clip-play-${video.id}`);
    videoSource.setAttribute('src', video.url);
    videoClipDom.setAttribute('style', "height: calc(100vh - 160px);width: 100%");
    videoClipDom.setAttribute('preload', 'auto');
    videoClipDom.appendChild(videoSource);
    videoClipDom.setAttribute('class', 'vid-vid');

    const clickable = document.createElement('a');
    clickable.setAttribute('id', "clip-play");
    clickable.setAttribute('href', '#');
    clickable.appendChild(videoClipDom);

    document.getElementById('clip-video-view').innerHTML = '';
    document.getElementById('clip-video-view').append(clickable);
    document.getElementById(`clip-play-${video.id}`).load();

    $("#v-pills-video-viewer-tab").click();
}

$("#video-viewer-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='clip-ClipsStamp'){
        element = $(e.target)[0].parentElement;
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        //viewer tab
        if(element.id.includes("clip-")) {
            if(element.id.includes("play-") || element.id.includes("PlayPause")){
                (videoClipDom.paused) ? continuePlay=true : continuePlay=false;
                (videoClipDom.paused) ? videoClipDom.play() : videoClipDom.pause();
                document.getElementById("clip-PlayPause").innerHTML = '';
                const clickable = document.createElement('span');
                (videoClipDom.paused) ? clickable.setAttribute('class', 'fa fa-play') : clickable.setAttribute('class', 'fa fa-pause');
                document.getElementById("clip-PlayPause").append(clickable);
            }
            if(element.id.includes("Rewind5")){
                if(!(videoClipDom.currentTime < 5))
                    videoClipDom.currentTime -= 5;
                else videoClipDom.currentTime = 0;
            }
            if(element.id.includes("PlaySpeed")){
                document.getElementById("clip-PlaySpeed").innerText = element.innerText;
                videoClipDom.playbackRate = parseFloat(element.id.split("-")[2]);
            }
            if(element.id.includes("clip-Volume")){
                element.oninput = function() {
                    videoClipDom.volume = element.value / 100;
        
                    if(element.value > 50)
                        document.getElementById("clip-IcoVolume").className = "fa fa-volume-up";
                    else if(element.value == 0)
                        document.getElementById("clip-IcoVolume").className = "fa fa-volume-off";
                    else if(element.value < 50)
                        document.getElementById("clip-IcoVolume").className = "fa fa-volume-down";
                } 
            }
            if(element.id.includes("OpenUploadModal")){
                document.getElementById("clip-UploadPlatform").innerText = ReplaysSettingsService.getSetting("uploadDefault");
            }
            if(element.id.includes("UploadPlatform")){
                if(element.id.split("-")[2]) {
                    document.getElementById("clip-UploadPlatform").innerText = element.id.split("-")[2];
                }
            }
            if(element.id.includes("UploadClip")){
                uploadClip(videoClipDom.id.replace("clip-play-", ""));
            }
            if(element.id.includes("DeleteClip")){
                deleteVideo(videoClipDom.id.replace("clip-play-", ""));
            }
        }
        
        if(element.className == "noUi-base") {
            var xpos = window.event.x + document.getElementById("clip-SeekBar").scrollLeft - 227;
            var result = ( xpos / ( document.getElementById("clip-Seeker").clientWidth / videoClipDom.duration ) )
                            .toFixed(2);
            videoClipDom.currentTime = result;
        }
    }
    //console.log("clicked on element: " + element.className);
});

$("#video-viewer-div").dblclick(function(){
    var element = $(e.target)[0];

    if(element.className.includes("noUi-handle") || element.className.includes("noUi-connect") ) {
        var xpos = window.event.x + document.getElementById("clip-SeekBar").scrollLeft - 227;
        var result = ( xpos / ( document.getElementById("clip-Seeker").clientWidth / videoClipDom.duration ) )
                        .toFixed(2);
        videoClipDom.currentTime = result;
    }
}); 

//clip editor key controls
$("#video-viewer-div").on('keydown', function(event) {
    if(!$('#upload-modal').is(':visible')) {
        if(event.keyCode == 32) { //SPACEBAR
            (videoClipDom.paused) ? videoClipDom.play() : videoClipDom.pause();
        }
        if(event.keyCode == 37) { //LEFT
            videoClipDom.currentTime -= 5;
        }
        if(event.keyCode == 39) { //RIGHT
            videoClipDom.currentTime += 5;
        }
    }
});

$('a[data-toggle="pill"]').on('shown.bs.tab', function () { //pause and cleanup if navigated out of viewer
    if(videoClipDom.paused == false) {
        videoClipDom.pause();
        document.getElementById("clip-PlayPause").innerHTML = '';
        const clickable = document.createElement('span');
        clickable.setAttribute('class', 'fa fa-play');
        document.getElementById("clip-PlayPause").append(clickable);
    }
})

videoClipDom.addEventListener('timeupdate', function() {
    if (videoClipDom.paused){
        document.getElementById("clip-PlayPause").innerHTML = '';
        const clickable = document.createElement('span');
        clickable.setAttribute('class', 'fa fa-play');
        document.getElementById("clip-PlayPause").append(clickable);
    }

    if(!sliding && seeker){
        seeker.noUiSlider.set(videoClipDom.currentTime);
    }

    var currentTime = moment("2019-12-15 00:00:00").seconds(videoClipDom.currentTime).format('HH:mm:ss').toString();
    var duration = moment("2019-12-15 00:00:00").seconds(videoClipDom.duration).format('HH:mm:ss').toString();

    if(duration.startsWith("00:")){
        duration = duration.slice(3);
        currentTime = currentTime.slice(3);
    }else if(duration.startsWith("0")){
        duration = duration.slice(1);
        currentTime = currentTime.slice(1);
    }

    document.getElementById("clip-TimeStamp").innerText = currentTime + " / " + duration;
});

videoClipDom.addEventListener('loadeddata', function() {
    if(!seeker) {
        seeker = $('#clip-Seeker')[0];
        noUiSlider.create(seeker, {
            start: [0],
            behaviour: 'tap',
            range: {
                'min': [0],
                'max': [videoClipDom.duration]
            }
        });
        seeker.noUiSlider.set(0);
    } else {
        seeker.noUiSlider.off();
        seeker.noUiSlider.updateOptions({
            range: {
                'min': [0],
                'max': [videoClipDom.duration]
            }
        });
        seeker.noUiSlider.set(0);
    }
    
    seeker.noUiSlider.on('start', function () {
        sliding = true;
        videoClipDom.pause();
    });

    seeker.noUiSlider.on('end', function () {
        sliding = false;
        if(continuePlay)
            videoClipDom.play();
    });

    seeker.noUiSlider.on('slide', function () {
        if(videoClipDom.currentTime != seeker.noUiSlider.get())
            videoClipDom.currentTime = seeker.noUiSlider.get();
    });
}, false);

function uploadClip(videoId) {
    let title;
    let uploadPlatform = document.getElementById("clip-UploadPlatform").innerText;

    if(!document.getElementById("clip-UploadTitle").value) title = 'Untitled';  
    else title = document.getElementById("clip-UploadTitle").value;

    ReplaysSettingsService.getSettings(UPLOAD).then((setting) => {
        if(setting){
            if(uploadPlatform == 'Streamable'){
                $('#upload-modal').modal('toggle');
                console.log("Uploading to Streamable");
                Streamable.upload(setting.streamableEmail, setting.streamablePass, getVideoById(videoId), title).then((result) => {
                    if(result) {
                        console.log(result);
                        makeUploadDOM(result);
                    }else console.error("Unknown upload error.");
                });
            }
            else if(uploadPlatform == 'Shared Folder'){
                $('#upload-modal').modal('toggle');
                console.log("Uploading to Shared Folder");
                SharedFolder.upload(setting.sharedFolderDir, getVideoById(videoId), title).then((result) => {
                    if(result) {
                        console.log(result);
                        makeUploadDOM(result);
                    }else console.error("Unknown upload error.");
                });
            }
            else{
                alert("The selected Upload Platform is not yet implemented.");
            }
        }else console.error("Error retrieving Upload settings. Missing?");
    });
}