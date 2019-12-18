import {shell} from 'electron';
import urljoin from 'url-join';
import moment from 'moment';
import BaseService from '../../../../src/service/BaseService';
import VideoService from '../../../../src/service/VideoService';
import TranscoderService from '../../../../src/service/TranscoderService';
import request from 'request-promise-native';
import { makeUploadDOM } from './uploads';
import Streamable from './libs/uploaders/streamable';
import ReplaysSettingsService, {
    UPLOAD
} from './replaysSettingsService';

const Settings = BaseService.getSettings();

const vidList = document.getElementById('clip-list-div');
const apiBase = Settings.getMainSetting('api');
const baseUrl = apiBase.baseurl;

var _videos = [];
var sortType = "Newest";
var sortGame = "All Games";

var continuePlay, sliding;
var seeker;
var playClipped = false;
const videoClipDom = document.createElement('video'); //video playback on the viewer

TranscoderService.initialize();
fetchAllClips();

function doGet(urlPath) {
return new Promise(
    (accept) => {
    request.get(urlPath).then(
        (response) => {
        accept(JSON.parse(response));
        });
    });
}

$("#video-viewer-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='clip-ClipsStamp'){
        element = $(e.target)[0].parentElement;
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        //viewer tab
        if(element.id.includes("clip-play-") || element.id.includes("clip-PlayPause")){
            (videoClipDom.paused) ? continuePlay=true : continuePlay=false;
            (videoClipDom.paused) ? videoClipDom.play() : videoClipDom.pause();
            document.getElementById("clip-PlayPause").innerHTML = '';
            const clickable = document.createElement('span');
            (videoClipDom.paused) ? clickable.setAttribute('class', 'fa fa-play') : clickable.setAttribute('class', 'fa fa-pause');
            document.getElementById("clip-PlayPause").append(clickable);
        }
        if(element.id.includes("clip-Rewind5")){
            if(!(videoClipDom.currentTime < 5))
                videoClipDom.currentTime -= 5;
            else videoClipDom.currentTime = 0;
        }
        if(element.id.includes("clip-PlaySpeed")){
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
        if(element.id.includes("clip-OpenUploadModal")){
            document.getElementById("clip-UploadPlatform").innerText = ReplaysSettingsService.getSetting("uploadDefault");
        }
        if(element.id.includes("clip-UploadPlatform")){
            if(element.id.split("-")[2]) {
                document.getElementById("clip-UploadPlatform").innerText = element.id.split("-")[2];
            }
        }
        if(element.id.includes("clip-UploadClip")){
            uploadClip(videoClipDom.id.replace("clip-play-", ""));
        }
        if(element.id.includes("clip-DeleteClip")){
            deleteVideo(videoClipDom.id.replace("clip-play-", ""));
        }
        if(element.id == "clip-SeekBar" || element.className == "noUi-base") {
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
    if(event.keyCode == 32) { //SPACEBAR
        (videoClipDom.paused) ? videoClipDom.play() : videoClipDom.pause();
    }
    if(event.keyCode == 37) { //LEFT
        videoClipDom.currentTime -= 5;
    }
    if(event.keyCode == 39) { //RIGHT
        videoClipDom.currentTime += 5;
    }
});

$("#clips-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='clip-ClipsStamp'){
        element = $(e.target)[0].parentElement;
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        if(element.id.includes("-CARD")) {
            if(document.getElementById("clip-play") && videoClipDom.firstChild) { //if element exists
                videoClipDom.removeChild(videoClipDom.firstChild); //remove src, so that new src can play
            }
            const id = element.id.split("-")[0];
            openVideoViewer(getVideoById(id));
        }
        if(element.id.includes("-CBOX"))
            console.log("clicked on video: " + element.id.split("-")[0]);
        if(element.id.includes("clip-Sort-")) {
            if(!element.id.split("-")[2].includes("Game|")) {
                sortType = element.id.split("-")[2];
                document.getElementById("clip-SortType").innerText = sortType + " First";
            }
            else {
                sortGame = element.id.split("|")[1];
                document.getElementById("clip-SortGame").innerText = sortGame;
            }
            fetchAllClips(sortGame, sortType);
        }
    }
    //console.log("clicked on element: " + element.className);
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

videoClipDom.addEventListener('timeupdate', function(){
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
})

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

function openVideoViewer(video) {
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

function getVideoById(id) {
    for (var i = 0; i < _videos.length; i++) {
        if (_videos[i].id === id){
            return _videos[i];
        }
    }
}

function fetchAllClips(game=null, type=null) {
    var totalSize = 0;
    document.getElementById("clip-TotalSize").innerText = '';
    doGet(urljoin(baseUrl, 'api/recordings')).then(
        (videos) => {
        vidList.innerHTML = '';
        videos
            .sort(function(left, right){
                if(type == "Smallest")
                    return left.fileSizeBytes - right.fileSizeBytes;
                else if(type == "Largest")
                    return right.fileSizeBytes - left.fileSizeBytes;
                else if(type == "Oldest")
                    return left.createdTime - right.createdTime;
                else
                    return right.createdTime - left.createdTime;
            })
            .forEach(
            (video) => {
                if(video.type == "clipped") {
                    if(document.getElementById("clip-Sort-Game|" + video.game.title) == null) {
                        const clickable = document.createElement('a');
                        clickable.setAttribute('id', 'clip-Sort-Game|' + video.game.title);
                        clickable.setAttribute('class', 'dropdown-item');
                        clickable.setAttribute('href', '#');
                        clickable.innerText = video.game.title;
                        document.getElementById("clip-SortGameContainer").append(clickable);
                    }
                    if(game && game != "All Games") {
                        if(video.game.title == game) {
                            //console.log('Fetched video.id=%s', video.id);
                            video._id = video.id;
                            const newVidDom = makeVidDOM(video);
                            vidList.appendChild(newVidDom);
                            _videos.push(video);
                            totalSize += parseFloat((video.fileSizeBytes * 0.000000001));
                        }
                    }
                    else {
                        //console.log('Fetched video.id=%s', video.id);
                        video._id = video.id;
                        const newVidDom = makeVidDOM(video);
                        vidList.appendChild(newVidDom);
                        _videos.push(video);
                        totalSize += parseFloat((video.fileSizeBytes * 0.000000001));
                    }
                }
            });
            document.getElementById("clip-TotalSize").innerText = totalSize.toFixed(2) + " GB";
        }
    );
}

function uploadClip(videoId) {
    let title;
    let uploadPlatform = document.getElementById("clip-UploadPlatform").innerText;

    if(!document.getElementById("clip-UploadTitle").value) title = 'Untitled';  
    else title = document.getElementById("clip-UploadTitle").value;

    ReplaysSettingsService.getSettings(UPLOAD).then((setting) => {
        if(setting){
            if(uploadPlatform == 'Streamable'){
                $('.modal').modal('toggle');
                console.log("Uploading to Streamable");
                Streamable.upload(setting.streamableEmail, setting.streamablePass, getVideoById(videoId), title).then((result) => {
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

function makeVidDOM(video) {
    const _card_id = video.id + "-CARD";
    const _cbox_id = video.id + "-CBOX";
    const _dmenu_id = video.id + "-DMENU";

    const result = document.createElement('div');
    result.setAttribute('class', 'col-xl-3 col-md-5 mb-4');
    result.setAttribute('id', video.id);
    
    const card = document.createElement('div');
    card.setAttribute('class', 'card h-100');
    result.append(card);

    const card_img = document.createElement('img');
    card_img.setAttribute('class', 'card-img-top');
    card_img.setAttribute('src', video.posterUrl);
    card_img.setAttribute('alt', 'Missing Thumbnail');
    card.append(card_img);

    const card_hover1 = document.createElement('div');
    card_hover1.setAttribute('class', 'card-img-overlay d-flex flex-column justify-content-between');
    card.append(card_hover1);

    const card_hover2 = document.createElement('h5');
    card_hover2.setAttribute('class', 'row justify-content-between');
    card_hover1.append(card_hover2);

    const clickable = document.createElement('a');
    clickable.setAttribute('class', 'stretched-link');
    clickable.setAttribute('id', _card_id);
    clickable.setAttribute('href', '#');
    card_hover1.append(clickable);

    const card_hover_ctrl1 = document.createElement('div');
    card_hover_ctrl1.setAttribute('class', 'custom-control custom-checkbox');
    card_hover_ctrl1.setAttribute('style', 'z-index:10; width:0px; margin-left:15px');
    card_hover2.append(card_hover_ctrl1);

    const card_hover_cbox1 = document.createElement('input');
    card_hover_cbox1.setAttribute('class', 'custom-control-input');
    card_hover_cbox1.setAttribute('type', 'checkbox');
    card_hover_cbox1.setAttribute('id', _cbox_id);
    card_hover_ctrl1.append(card_hover_cbox1);

    const card_hover_cbox2 = document.createElement('label');
    card_hover_cbox2.setAttribute('class', 'custom-control-label');
    card_hover_cbox2.setAttribute('for', _cbox_id);
    card_hover_ctrl1.append(card_hover_cbox2);

    const card_hover_ctrl2 = document.createElement('div');
    card_hover_ctrl2.setAttribute('class', 'dropdown show');
    card_hover_ctrl2.setAttribute('style', 'z-index:10; width:0px; margin-right:15px');
    card_hover2.append(card_hover_ctrl2);

    const card_hover_dmenu1 = document.createElement('a');
    card_hover_dmenu1.setAttribute('href', '#');
    card_hover_dmenu1.setAttribute('role', 'button');
    card_hover_dmenu1.setAttribute('data-toggle', 'dropdown');
    card_hover_dmenu1.setAttribute('aria-haspopup', 'true');
    card_hover_dmenu1.setAttribute('aria-expanded', 'false');
    card_hover_dmenu1.setAttribute('id', _dmenu_id);
    card_hover_ctrl2.append(card_hover_dmenu1);

    const card_hover_dmenu1_sub1 = document.createElement('i');
    card_hover_dmenu1_sub1.setAttribute('class', 'fa fa-ellipsis-v');
    card_hover_dmenu1_sub1.setAttribute('style', 'color:#fff; text-decoration:none; width:0px');
    card_hover_dmenu1.append(card_hover_dmenu1_sub1);

    const card_hover_dmenu2 = document.createElement('div');
    card_hover_dmenu2.setAttribute('class', 'dropdown-menu');
    card_hover_dmenu2.setAttribute('aria-labelledby', _dmenu_id);
    card_hover_ctrl2.append(card_hover_dmenu2);

    const card_hover_dmenu2_sub1 = document.createElement('a');
    card_hover_dmenu2_sub1.setAttribute('class', 'dropdown-item');
    card_hover_dmenu2_sub1.setAttribute('href', '#');
    card_hover_dmenu2_sub1.append('Show In Folder');
    card_hover_dmenu2_sub1.onclick = () => shell.showItemInFolder(video.filePath);
    card_hover_dmenu2.append(card_hover_dmenu2_sub1);

    const card_hover_dmenu2_sub2 = document.createElement('a');
    card_hover_dmenu2_sub2.setAttribute('class', 'dropdown-item');
    card_hover_dmenu2_sub2.setAttribute('href', '#');
    card_hover_dmenu2_sub2.append('Delete');
    card_hover_dmenu2_sub2.onclick = () => deleteVideo(video.id);
    card_hover_dmenu2.append(card_hover_dmenu2_sub2);

    const card_body = document.createElement('div');
    card_body.setAttribute('class', 'card-body');
    card_body.setAttribute('style', '10px;padding-bottom: 0px;padding-left: 10px;padding-right: 10px;');
    card.append(card_body);

    const card_title = document.createElement('p');
    card_title.setAttribute('class', 'card-title');
    card_title.setAttribute('style', 'margin-bottom: 5px;');
    const icon = document.createElement('i');
    icon.setAttribute('class', 'fa fa-video');
    card_title.append(icon);
    card_title.append(" " + (video.game || {}).title || 'Game Unknown');
    card_body.append(card_title);

    const card_subtitle = document.createElement('p');
    card_subtitle.setAttribute('class', 'card-subtitle mb-2 text-muted');
    card_subtitle.append(moment(video.createdTime).format('YYYY/MM/DD | hh:mm A | ' + (video.fileSizeBytes * 0.000000001).toFixed(2) + ' GB'));
    card_body.append(card_subtitle);
    return result;
}

function deleteVideo(videoId) {
    VideoService.getVideo(videoId).then(
        (video) => {
        if (!video) {
            console.log(`Did not find video ${videoId}`);
            return;
        }
        const confirmString = `Are you certain you want to delete ${video.fileName}? It will also delete the file`;
        // eslint-disable-next-line no-alert
        if (window.confirm(confirmString)) {
            console.log(`Deleting video ${video._id} - ${video.fileName}`);
            VideoService.deleteVideos([videoId]).then(
            (docs) => {
                console.log(`Successfully deleted ${docs.length} documents`);
                document.getElementById(videoId).remove();
            }
            );
        }
    });
}