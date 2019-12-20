import {shell, ipcRenderer} from 'electron';
import urljoin from 'url-join';
import moment from 'moment';
import shortid from 'shortid';
import BaseService from '../../../../src/service/BaseService';
import VideoService from '../../../../src/service/VideoService';
import TranscoderService from '../../../../src/service/TranscoderService';
import request from 'request-promise-native';

import * as IPC from '../../../../src/core/IPCCapsule.js';

const Settings = BaseService.getSettings();

const vidList = document.getElementById('session-list-div');
const apiBase = Settings.getMainSetting('api');
const baseUrl = apiBase.baseurl;

var _videos = [];
var sortType = "Newest";
var sortGame = "All Games";

var continuePlay, sliding;
var seeker, segments;
var playClipped = false;
var testSegments;
const ZOOM = [100, 110, 125, 150, 175, 200, 250, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 7500, 10000];
const videoSessDom = document.createElement('video'); //video playback on the editor

TranscoderService.initialize();
fetchAllVideos();

ipcRenderer.on(IPC.LTC_VIDEO_TRANSCODING_STATUS,
    (event, payload) => {
        if(payload.status == "DONE") {
            alert("Clip saved successfully!");
        }
    }
);

function doGet(urlPath) {
return new Promise(
    (accept) => {
    request.get(urlPath).then(
        (response) => {
        accept(JSON.parse(response));
        });
    });
}

//editor tab
$("#video-editor-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='sess-ClipsStamp'){
        element = $(e.target)[0].parentElement;
    }else element = $(e.target)[0];

    if(e.which == 1) {
        if(element.id.includes("sess-")) {
            if(element.id.includes("play-") || element.id.includes("PlayPause")){
                (videoSessDom.paused) ? continuePlay=true : continuePlay=false;
                (videoSessDom.paused) ? videoSessDom.play() : videoSessDom.pause();
                document.getElementById("sess-PlayPause").innerHTML = '';
                const clickable = document.createElement('span');
                (videoSessDom.paused) ? clickable.setAttribute('class', 'fa fa-play') : clickable.setAttribute('class', 'fa fa-pause');
                document.getElementById("sess-PlayPause").append(clickable);
            }
            if(element.id.includes("Rewind5")){
                if(!(videoSessDom.currentTime < 5))
                    videoSessDom.currentTime -= 5;
                else videoSessDom.currentTime = 0;
            }
            if(element.id.includes("PlaySpeed")){
                document.getElementById("sess-PlaySpeed").innerText = element.innerText;
                videoSessDom.playbackRate = parseFloat(element.id.split("-")[2]);
            }
            if(element.id.includes("Volume")){
                element.oninput = function() {
                    videoSessDom.volume = element.value / 100;
        
                    if(element.value > 50)
                        document.getElementById("sess-IcoVolume").className = "fa fa-volume-up";
                    else if(element.value == 0)
                        document.getElementById("sess-IcoVolume").className = "fa fa-volume-off";
                    else if(element.value < 50)
                        document.getElementById("sess-IcoVolume").className = "fa fa-volume-down";
                } 
            }
            if(element.id.includes("AddClip"))
                addClip();
            if(element.id.includes("PlayPauseClips"))
                playPauseClips();
            if(element.id.includes("SaveClips"))
                saveClips();
            if(element.id.includes("Bookmark"))
                alert("Bookmarks and deep integration pins are work in progress");
            if(element.id.includes("Zoom")){
                var index = parseInt(document.getElementById("sess-Zoomer").className.split("-")[1]);
        
                if(element.id.includes("ZoomOut")){
                    if((index-1) < 0) index = 0;
                    else index -= 1;
                }
                else if(element.id.includes("ZoomIn")){
                    if((index+1) >= ZOOM.length) index = ZOOM.length-1;
                    else index += 1;
                }
        
                document.getElementById("sess-Segments").style.width = ZOOM[index] + "%";
                document.getElementById("sess-Seeker").style.width = ZOOM[index] + "%";
        
                document.getElementById("sess-Zoomer").className = "index-" + (index);
                document.getElementById("sess-Zoomer").innerText = document.getElementById("sess-Seeker").style.width;
        
                var offset = $(document.getElementById("sess-Seeker").firstChild.childNodes[1]).position().left+(85*(ZOOM[index]/100));
                document.getElementById("sess-SeekBar").scrollLeft = offset;
                console.log(offset);
            }
        }
        if(element.className == "noUi-base") {
            var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
            var result = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) )
                            .toFixed(2);
            videoSessDom.currentTime = result;
        }
    }

    if(e.which == 3 && element.className == "noUi-connects") {
        removeClip();
    }

    //console.log(element);
});

$("#video-editor-div").dblclick(function(e){
    var element = $(e.target)[0];

    if(element.className.includes("noUi-handle") || element.className.includes("noUi-connect") ) {
        var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
        var result = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) )
                        .toFixed(2);
        videoSessDom.currentTime = result;
    }
}); 

//clip editor key controls
$("#video-editor-div").on('keydown', function(event) {
    if(event.keyCode == 32) { //SPACEBAR
        (videoSessDom.paused) ? videoSessDom.play() : videoSessDom.pause();
    }
    if(event.keyCode == 37) { //LEFT
        videoSessDom.currentTime -= 5;
    }
    if(event.keyCode == 39) { //RIGHT
        videoSessDom.currentTime += 5;
    }
});

//sessions tab
$("#sessions-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='sess-ClipsStamp'){
        element = $(e.target)[0].parentElement;
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        if(element.id.includes("-CARD")) {
            if(document.getElementById("session-play")  && videoSessDom.firstChild) { //if element exists
                videoSessDom.removeChild(videoSessDom.firstChild); //remove src, so that new src can play
            }
            const id = element.id.split("-")[0];
            openVideoEditor(getVideoById(id));
        }
        if(element.id.includes("-CBOX"))
            console.log("clicked on video: " + element.id.split("-")[0]);
        if(element.id.includes("sess-")) {
            if(element.id.includes("Sort-")) {
                if(!element.id.split("-")[2].includes("Game|")) {
                    sortType = element.id.split("-")[2];
                    document.getElementById("sess-SortType").innerText = sortType + " First";
                }
                else {
                    sortGame = element.id.split("|")[1];
                    document.getElementById("sess-SortGame").innerText = sortGame;
                }
                fetchAllVideos(sortGame, sortType);
            }
            if(element.id.includes("Refresh")) {
                fetchAllVideos(sortGame, sortType);
            }
        }
    }
});

function removeClip() {
    $(".noUi-connects").contextMenu({
        menuSelector: "#contextMenu",
        menuSelected: function (invokedOn, selectedMenu) {
            if(selectedMenu.text() == "Delete") {
                var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
                var result = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) ).toFixed(2);

                var starts = segments.noUiSlider.get();
                var connects = segments.noUiSlider.options.connect;

                var toDelete = closest(starts, result); //gets closest value, returns index

                for(var i=0; i<starts.length; i++) {
                    if(starts[toDelete] == starts[i]) {
                        if(toDelete % 2 == 0) 
                            starts.splice(i, 2);
                        else
                            starts.splice(i-1, 2);
                        connects.pop();
                        connects.pop();
                        break;
                    }
                }

                if(starts.length == 0) {
                    starts.push(0, 0);
                    connects.push(true, false);

                    document.getElementById("sess-Segments").style.visibility = "hidden";
                    document.getElementById("sess-ClipAndSave").style.visibility = "hidden";
                    document.getElementById("sess-Seeker").style.height = "100%";
                }

                var options = {
                    start: starts,
                    connect: connects,
                    behaviour: 'drag', //-unconstrained
                    range: {
                        'min': [0],
                        'max': [videoSessDom.duration]
                    }
                }
                segments.noUiSlider.destroy();
                noUiSlider.create(segments, options);
            
                segments.noUiSlider.off('update'); //reset to prevent memory leaks
                segments.noUiSlider.on('update', function () {
                    var numOfClips = segments.noUiSlider.get().length / 2;
                    var txt;
                    var duration = 0;
            
                    for(var i=0; i<segments.noUiSlider.get().length-1; i+=2) {
                        //console.log(segments.noUiSlider.get()[i+1] - segments.noUiSlider.get()[i]);
                        duration += (segments.noUiSlider.get()[i+1] - segments.noUiSlider.get()[i]);
                    }
            
                    duration = moment("2019-12-15 00:00:00").seconds(duration).format('HH:mm:ss').toString();
                
                    if(duration.startsWith("00:")){
                        duration = duration.slice(3);
                    }else if(duration.startsWith("0")){
                        duration = duration.slice(1);
                    }
            
                    (numOfClips>1) ? txt=" Clips: " : txt=" Clip: ";
                    document.getElementById("sess-ClipsStamp").innerText = numOfClips + txt + duration;
                });
            }
        }
    });
}

function closest(array, num) {
    var i = 0;
    var minDiff = 1000;
    var ans;
    for (i in array) {
      var m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = i;
      }
    }
    return ans;
}

function addClip(){
    var starts = segments.noUiSlider.get();
    var connects = segments.noUiSlider.options.connect;

    if(document.getElementById("sess-Segments").style.visibility == "hidden"){ //that means no clips exist, so we will prepare first clip
        starts.pop();
        starts.pop();
        connects.pop();
        connects.pop();
        
        document.getElementById("sess-Segments").style.visibility = "visible";
        document.getElementById("sess-ClipAndSave").style.visibility = "visible";
        document.getElementById("sess-Seeker").style.height = "0px";
    }
    const seekPos = parseFloat(seeker.noUiSlider.get());

    for(var i=1; i<=starts.length+1; i+=2) {
        if(starts[i] == null && starts[i+1] == null){ //when no other clips exist
            starts.push(seekPos, seekPos+10);
            connects.push(true, false);
            break;
        }
        else if((seekPos < starts[0]) && starts[1] != null){ //at the start, when another clip exists
            starts.splice(0, 0, seekPos);
            starts.splice(1, 0, seekPos+10);
            connects.push(true, false);
            break;
        }
        else if((seekPos > starts[i]) && (seekPos < starts[i+1])) { //when there is space between 2 clips
            starts.splice(i+1, 0, seekPos);
            if(seekPos+10 > starts[i+2])
                starts.splice(i+2, 0, starts[i+2]);
            else
                starts.splice(i+2, 0, seekPos+10);
            connects.push(true, false);
            break;
        }
        else if((seekPos > starts[i-1]) && (seekPos < starts[i])) { //in the middle of a clip
            alert("You cannot place a clip inside of a clip");
            break;
        }
        else if(starts[i] != null && starts[i+1] == null){ //at the end
            starts.push(seekPos, seekPos+10);
            connects.push(true, false);
            break;
        }
    }

    var options = {
        start: starts,
        connect: connects,
        behaviour: 'drag', //-unconstrained
        range: {
            'min': [0],
            'max': [videoSessDom.duration]
        }
    }
    segments.noUiSlider.destroy();
    noUiSlider.create(segments, options);

    segments.noUiSlider.off('update'); //reset to prevent memory leaks
    segments.noUiSlider.on('update', function () {
        var numOfClips = segments.noUiSlider.get().length / 2;
        var txt;
        var duration = 0;

        for(var i=0; i<segments.noUiSlider.get().length-1; i+=2) {
            //console.log(segments.noUiSlider.get()[i+1] - segments.noUiSlider.get()[i]);
            duration += (segments.noUiSlider.get()[i+1] - segments.noUiSlider.get()[i]);
        }

        duration = moment("2019-12-15 00:00:00").seconds(duration).format('HH:mm:ss').toString();
    
        if(duration.startsWith("00:")){
            duration = duration.slice(3);
        }else if(duration.startsWith("0")){
            duration = duration.slice(1);
        }

        (numOfClips>1) ? txt=" Clips: " : txt=" Clip: ";
        document.getElementById("sess-ClipsStamp").innerText = numOfClips + txt + duration;
    });
}

function playPauseClips() {
    playClipped = !playClipped;
    if(playClipped){
        testSegments = segments.noUiSlider.get();
        videoSessDom.currentTime = segments.noUiSlider.get()[0];
        videoSessDom.play();
        document.getElementsByClassName("fa fa-play-circle")[0].className = "fa fa-pause-circle";
    }else{
        videoSessDom.pause();
        document.getElementsByClassName("fa fa-pause-circle")[0].className = "fa fa-play-circle";
    }
}

function saveClips(){
    const id = videoSessDom.id.split("-")[2];
    var testSegments = segments.noUiSlider.get();
    var readySegments = new Array();

    for(var i=0; i<testSegments.length; i+=2) {
        if(testSegments[i+1] == null){
            break;
        }else{
            readySegments.push({"duration" : (testSegments[i+1]*1000)-(testSegments[i]*1000), "start" : testSegments[i]*1000});
        }
    }

    console.log(readySegments);
    TranscoderService.beginCreateClipTask(shortid.generate(), getVideoById(id), readySegments).then(
        (msg) => {
          console.log("hello! ");
          console.log(msg);
    });
    console.log("saving clips from video: " + getVideoById(id)._id);
}

$('a[data-toggle="pill"]').on('shown.bs.tab', function () { //pause and cleanup if navigated out of editor
    if(videoSessDom.paused == false) {
        videoSessDom.pause();
        document.getElementById("sess-PlayPause").innerHTML = '';
        const clickable = document.createElement('span');
        clickable.setAttribute('class', 'fa fa-play');
        document.getElementById("sess-PlayPause").append(clickable);
    }

    if(document.getElementById("sess-Segments").style.visibility == 'visible') {
        document.getElementById("sess-ClipAndSave").style.visibility = 'hidden';
        document.getElementById("sess-Segments").style.visibility = 'hidden';
    
        segments.noUiSlider.destroy();
        noUiSlider.create(segments, {
            start: [0, 0],
            connect: [false, true, false],
            behaviour: 'drag',
            range: {
                'min': [0],
                'max': [videoSessDom.duration]
            }
        });
    }
})

videoSessDom.addEventListener('timeupdate', function(){
    if (videoSessDom.paused){
        document.getElementById("sess-PlayPause").innerHTML = '';
        const clickable = document.createElement('span');
        clickable.setAttribute('class', 'fa fa-play');
        document.getElementById("sess-PlayPause").append(clickable);
    }
    
    if(!sliding && seeker){
        seeker.noUiSlider.set(videoSessDom.currentTime);
    }else if(playClipped) playPauseClips();

    if(playClipped){
        for(var i=1; i<testSegments.length; i+=2) {
            if(testSegments[i+1] == null){
                if(videoSessDom.currentTime >= testSegments[i]) {
                    playPauseClips();
                    console.log("ended clip at: " + videoSessDom.currentTime);
                    videoSessDom.currentTime = testSegments[i];
                    break;
                }
            }else if(videoSessDom.currentTime >= testSegments[i]) {
                console.log("ended clip at: " + videoSessDom.currentTime);
                videoSessDom.currentTime = testSegments[i+1];
                testSegments.splice(i,2);
                break;
            }
        }
    }

    var currentTime = moment("2019-12-15 00:00:00").seconds(videoSessDom.currentTime).format('HH:mm:ss').toString();
    var duration = moment("2019-12-15 00:00:00").seconds(videoSessDom.duration).format('HH:mm:ss').toString();

    if(duration.startsWith("00:")){
        duration = duration.slice(3);
        currentTime = currentTime.slice(3);
    }else if(duration.startsWith("0")){
        duration = duration.slice(1);
        currentTime = currentTime.slice(1);
    }

    document.getElementById("sess-TimeStamp").innerText = currentTime + " / " + duration;
})

videoSessDom.addEventListener('loadeddata', function() {
    if(!seeker) {
        seeker = $('#sess-Seeker')[0];
        noUiSlider.create(seeker, {
            start: [0],
            behaviour: 'tap',
            range: {
                'min': [0],
                'max': [videoSessDom.duration]
            }
        });
        seeker.noUiSlider.set(0);
        segments = $('#sess-Segments')[0];
        noUiSlider.create(segments, {
            start: [0, 0],
            connect: [false, true, false],
            behaviour: 'drag',
            range: {
                'min': [0],
                'max': [videoSessDom.duration]
            }
        });
    } else {
        seeker.noUiSlider.off();
        seeker.noUiSlider.updateOptions({
            range: {
                'min': [0],
                'max': [videoSessDom.duration]
            }
        });
        seeker.noUiSlider.set(0);
        segments.noUiSlider.off();
        segments.noUiSlider.updateOptions({
            range: {
                'min': [0],
                'max': [videoSessDom.duration]
            }
        });
    }
    
    seeker.noUiSlider.on('start', function () {
        sliding = true;
        videoSessDom.pause();
    });

    seeker.noUiSlider.on('end', function () {
        sliding = false;
        if(continuePlay)
            videoSessDom.play();
    });

    seeker.noUiSlider.on('slide', function () {
        if(videoSessDom.currentTime != seeker.noUiSlider.get())
            videoSessDom.currentTime = seeker.noUiSlider.get();
    });
 }, false);

function openVideoEditor(video) {
    //console.log(video.url);
    const videoSource = document.createElement('source');
    videoSessDom.setAttribute('id', `sess-play-${video.id}`);
    videoSource.setAttribute('src', video.url);
    videoSessDom.setAttribute('style', "height: calc(100vh - 160px);width: 100%");
    videoSessDom.setAttribute('preload', 'auto');
    videoSessDom.appendChild(videoSource);
    videoSessDom.setAttribute('class', 'vid-vid');

    const clickable = document.createElement('a');
    clickable.setAttribute('id', "session-play");
    clickable.setAttribute('href', '#');
    clickable.appendChild(videoSessDom);

    document.getElementById('sess-video-view').innerHTML = '';
    document.getElementById('sess-video-view').append(clickable);
    document.getElementById(`sess-play-${video.id}`).load();

    $("#v-pills-video-editor-tab").click();
}

function getVideoById(id) {
    for (var i = 0; i < _videos.length; i++) {
        if (_videos[i].id === id){
            return _videos[i];
        }
    }
}

function fetchAllVideos(game=null, type=null) {
    var totalSize = 0;
    document.getElementById("sess-TotalSize").innerText = '';
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
                if(video.type != "clipped") {
                    if(document.getElementById("sess-Sort-Game|" + video.game.title) == null) {
                        const clickable = document.createElement('a');
                        clickable.setAttribute('id', 'sess-Sort-Game|' + video.game.title);
                        clickable.setAttribute('class', 'dropdown-item');
                        clickable.setAttribute('href', '#');
                        clickable.innerText = video.game.title;
                        document.getElementById("sess-SortGameContainer").append(clickable);
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
            document.getElementById("sess-TotalSize").innerText = totalSize.toFixed(2) + " GB";
        }
    );
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
    card_img.onerror = () => {
        card_img.setAttribute('src', './media/video_thumbnail_placeholder.png');
    }
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
    card_hover_ctrl2.setAttribute('style', 'z-index:10; width:0px; margin-right:25px');
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
    card_hover_dmenu1_sub1.setAttribute('style', 'color:#fff; text-decoration:none; width:0px; text-shadow:-1px -1px 0 gray, 1px -1px 0 gray, -1px 1px 0 gray, 1px 1px 0 gray;');
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

//bootstrap context menu - https://stackoverflow.com/a/18667336
(function ($, window) {
    $.fn.contextMenu = function (settings) {
        return this.each(function () {
            // Open context menu
            $(this).on("contextmenu", function (e) {
                // return native menu if pressing control
                if (e.ctrlKey) return;
                
                //open menu
                var $menu = $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: getMenuPosition(e.clientX-200, 'width', 'scrollLeft'),
                        top: getMenuPosition(e.clientY-90, 'height', 'scrollTop')
                    })
                    .off('click')
                    .on('click', 'a', function (e) {
                        $menu.hide();
                
                        var $invokedOn = $menu.data("invokedOn");
                        var $selectedMenu = $(e.target);
                        
                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                    });
                
                return false;
            });

            //make sure menu closes on any click
            $('body').click(function () {
                $(settings.menuSelector).hide();
            });
        });
        
        function getMenuPosition(mouse, direction, scrollDir) {
            var win = $(window)[direction](),
                scroll = $(window)[scrollDir](),
                menu = $(settings.menuSelector)[direction](),
                position = mouse + scroll;
                        
            // opening menu would pass the side of the page
            if (mouse + menu > win && menu < mouse) 
                position -= menu;
            
            return position;
        }    

    };
})(jQuery, window);