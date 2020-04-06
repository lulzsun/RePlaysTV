import {ipcRenderer} from 'electron';
import moment from 'moment';
import shortid from 'shortid';
import TranscoderService from '../../../../src/service/TranscoderService';
import * as IPC from '../../../../src/core/IPCCapsule.js';
import {fetchAllSessions, getVideoById} from './sessions';
import {fetchAllClips} from './clips';
import {initPinSettings, setPinTooltip, addPin, removePin, tempAddPins, tempRemovePins} from './deepIntegrationService';

var continuePlay, sliding;
var seeker, segments, pins;
var playClipped = false;
var testSegments;
const ZOOM = [100, 110, 125, 150, 175, 200, 250, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 7500, 10000];

var videoSessDom = document.createElement('video'); //video playback object
var currentVideo = null; //the current video object passed in from openVideoEditor()

export default function openVideoEditor(video) {
    currentVideo = video;

    if(videoSessDom == null) videoSessDom = document.createElement('video');

    videoSessDom.removeEventListener('timeupdate', onTimeUpdate);
    videoSessDom.removeEventListener('loadeddata', onLoadVideo);
    videoSessDom.addEventListener('timeupdate', onTimeUpdate);
    videoSessDom.addEventListener('loadeddata', onLoadVideo, false);

    const videoSource = document.createElement('source');
    videoSessDom.setAttribute('id', `sess-play-${currentVideo.id}`);
    videoSource.setAttribute('src', `http://localhost:9000/s/v2/recordings/${currentVideo.id}`)
    // code below is futureproof, but is not secure
    // before using, set
    // webPreferences: {
    //   webSecurity: false
    // }
    //videoSource.setAttribute('src', `${currentVideo.saveDir}/${currentVideo.path.substring(1)}/${currentVideo.fileName}`);
    videoSessDom.setAttribute('style', "height: calc(100vh - 190px);width: 100%");
    videoSessDom.setAttribute('preload', 'auto');
    videoSessDom.appendChild(videoSource);
    videoSessDom.setAttribute('class', 'vid-vid');

    const clickable = document.createElement('a');
    clickable.setAttribute('id', "session-play");
    clickable.setAttribute('href', '#');
    clickable.appendChild(videoSessDom);

    document.getElementById('sess-video-view').innerHTML = '';
    document.getElementById('sess-video-view').append(clickable);
    document.getElementById(`sess-play-${currentVideo.id}`).load();

    $("#v-pills-video-editor-tab").click();
}

ipcRenderer.on(IPC.LTC_VIDEO_TRANSCODING_STATUS,(event, payload) => {
    if(payload.status == "DONE") {
        alert("Clip saved successfully!");
    }
});

//editor tab
$("#video-editor-div").on('click', function (e) { //left click functions
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='sess-ClipsStamp'){
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

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
        if(element.id.includes("Bookmark")) {
            if(element.id.split('-')[2]) {
                if(element.id.split('-')[2] == "Add") {
                    addPin('bookmark', videoSessDom.currentTime * 1000);
                    createPins(currentVideo.pins, true);
                }
                if(element.id.split('-')[2] == "Show") //this is a checkbox object, 
                    e.stopPropagation();               //do not close dropdown if it is changed
            }
        }
        if(element.id.includes("Zoom")) {
            var index = parseInt(document.getElementById("sess-Zoomer").className.split("-")[1]);
    
            if(element.id.includes("ZoomOut")) {
                if((index-1) < 0) index = 0;
                else index -= 1;
            }
            else if(element.id.includes("ZoomIn")) {
                if((index+1) >= ZOOM.length) index = ZOOM.length-1;
                else index += 1;
            }
    
            document.getElementById("sess-Segments").style.width = ZOOM[index] + "%";
            document.getElementById("sess-Seeker").style.width = ZOOM[index] + "%";
            document.getElementById("sess-Pins").style.width = ZOOM[index] + "%";
    
            document.getElementById("sess-Zoomer").className = "index-" + (index);
            document.getElementById("sess-Zoomer").innerText = document.getElementById("sess-Seeker").style.width;
    
            var offset = $(document.getElementById("sess-Seeker").firstChild.childNodes[1]).position().left+(85*(ZOOM[index]/100));
            document.getElementById("sess-SeekBar").scrollLeft = offset;
            //console.log(offset);
        }
    }
    if(element.className == "noUi-base") {
        var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
        var result = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) )
                        .toFixed(2);
        videoSessDom.currentTime = result;
    }

    //console.log(element);
});

$("#video-editor-div").mousedown(function (e) { //right click functions
    if(e.which == 3) {
        var element;
        if($(e.target)[0].id == '' || $(e.target)[0].id =='sess-ClipsStamp'){
            element = $(e.target)[0].parentElement;
            if(element.className.includes('custom-control')) {
                element = element.children[0];
            }
        }else element = $(e.target)[0];
    
        if (element.className == "noUi-connects") {
            var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
            var target = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) ).toFixed(2);
            removeClip(target); 
        }
        if (element.className == "noUi-tooltip" || element.classList.contains("pinObject") || $(element.firstChild).find('.noUi-tooltip').length) { 
            var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
            var target = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) ).toFixed(2);
            deletePin(target); //rightclicking on a pin/bookmark
        }
        //console.log(element);
    }
});

$("#video-editor-div").dblclick(function(e) { //double left click functions
    var element = $(e.target)[0];

    if(element.className.includes("noUi-handle") || element.className.includes("noUi-connect") || 
       element.parentElement.className.includes("noUi-tooltip") || element.className.includes("noUi-tooltip") ||
       element.className.includes("noUi-touch-area")) {
        var xpos = window.event.x + document.getElementById("sess-SeekBar").scrollLeft - 227;
        var result = ( xpos / ( document.getElementById("sess-Seeker").clientWidth / videoSessDom.duration ) )
                        .toFixed(2);
        videoSessDom.currentTime = result;
    }
}); 

$("#video-editor-div").on('keydown', function(event) { //clip editor key controls
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

function createPins(allPins, update=false) {
    var sliderPins = [];

    for(var i=0; i<Object.keys(allPins).length; i++) { //this should be faster? still pretty slow. push() is probably the issue? make this async?
        let key = Object.keys(allPins)[i];
        //console.log(key + ':', allPins[key]);
        sliderPins.push(allPins[key].time/1000);
    }
    // Object.keys(allPins).forEach(function(key) {
    //     //console.log(key + ':', allPins[key]);
    //     sliderPins.push(allPins[key].time/1000);
    // });

    if(tempAddPins) {
        tempAddPins.forEach(pin => {
            if(pin[currentVideo.id]) //if there is a temp pin for the current video
                sliderPins.push(pin[currentVideo.id].time/1000);
        });
    }

    if(tempRemovePins) {
        tempRemovePins.forEach(pin => {
            if(pin[currentVideo.id]) { //if there is a temp pin for the current video
                for(var sliderPin in sliderPins){
                    if(sliderPins[sliderPin] == pin[currentVideo.id].time/1000){
                        sliderPins.splice(sliderPin,1);
                        break;
                    }
                }
            }
        });
    }

    if(sliderPins.length == 0) {
        sliderPins.push(0);
        document.getElementById("sess-Seeker").style.height = "100%";
        document.getElementById("sess-Pins").style.visibility = "hidden";
    }
    else {
        document.getElementById("sess-Seeker").style.height = "0px";
        document.getElementById("sess-Pins").style.visibility = "visible";
    }

    if(update) pins.noUiSlider.destroy();
    initPinSettings(currentVideo);

    sliderPins.sort(function(a, b){return a-b;});

    pins = $('#sess-Pins')[0];
    noUiSlider.create(pins, {
        start: sliderPins,
        behaviour: 'none',
        tooltips: true,
        range: {
            'min': [0],
            'max': [videoSessDom.duration]
        },
        format: {
            from: Number,
            to: (value) => setPinTooltip(value.toFixed(4))
        }
    });
    pins.setAttribute('disabled', true);
}

function deletePin(target) {
    $(".noUi-origin").contextMenu({
        menuSelector: "#contextMenu",
        menuSelected: function (invokedOn, selectedMenu) {
            if(selectedMenu.text() == "Delete") {
                var starts = pins.noUiSlider.get();
                
                if(starts[0] != "<") {
                    for (var i in starts) {
                        starts[i] = $(starts[i]).attr('id')/1000; //removes the formatting and gives us the time only
                    }
                    var toDelete = closest(starts, target); //gets closest value, returns index
                    removePin('bookmark', starts[toDelete]*1000);
                } else {
                    starts = $(starts).attr('id')/1000;
                    removePin('bookmark', starts*1000);
                }
                createPins(currentVideo.pins, true);
            }
        }
    });
}

function addClip() {
    var starts = segments.noUiSlider.get();
    var connects = segments.noUiSlider.options.connect;

    if(document.getElementById("sess-Segments").style.visibility == "hidden") { //that means no clips exist, so we will prepare first clip
        starts.pop();
        starts.pop();
        connects.pop();
        connects.pop();
        
        document.getElementById("sess-Segments").style.visibility = "visible";
        document.getElementById("sess-ClipAndSave").style.visibility = "visible";
        document.getElementById("sess-Pins").style.height = "0px";
        if(document.getElementById("sess-Seeker").style.height == "100%") {
            document.getElementById("sess-Seeker").style.height = "0px";
        }
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

function removeClip(target) {
    $(".noUi-connects").contextMenu({
        menuSelector: "#contextMenu",
        menuSelected: function (invokedOn, selectedMenu) {
            if(selectedMenu.text() == "Delete") {
                var starts = segments.noUiSlider.get();
                var connects = segments.noUiSlider.options.connect;

                var toDelete = closest(starts, target); //gets closest value, returns index

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
                    document.getElementById("sess-Pins").style.height = "100%";
                    if(document.getElementById("sess-Seeker").style.height == "0px") {
                        document.getElementById("sess-Seeker").style.height = "100%";
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
        }
    });
}

function saveClips() {
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

function forcePause() {
    if(videoSessDom.paused == false) {
        videoSessDom.pause();
        document.getElementById("sess-PlayPause").innerHTML = '';
        const clickable = document.createElement('span');
        clickable.setAttribute('class', 'fa fa-play');
        document.getElementById("sess-PlayPause").append(clickable);
    }
}

$('#close').on('click', function () { //if the user closed the window, pause video
    forcePause();
})

$('a[data-toggle="pill"]').on('shown.bs.tab', function () { //pause and cleanup if navigated out of editor
    forcePause();

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
    fetchAllSessions();
    fetchAllClips();
})

function onTimeUpdate() {
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
}

function onLoadVideo() {
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
        createPins(currentVideo.pins);
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
        createPins(currentVideo.pins, true);
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

    document.getElementById("sess-Pins").style.height = "100%";
}

//helper functions
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