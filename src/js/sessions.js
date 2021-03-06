import {shell} from 'electron';
import moment from 'moment';
import shortid from 'shortid';
import VideoService from '../../../../src/service/VideoService';
import MediaService from '../../../../src/service/MediaService';
import openVideoEditor from './video-editor';
import TranscoderService from '../../../../src/service/TranscoderService';

var vidList;
var _videos = [];
var sortType = "Newest";
var sortGame = "All Games";
var sortView = "Grid";
var videoSessDom; //video playback on the editor

initialize();
function initialize() {
    vidList = document.getElementById('session-list-div');
    videoSessDom = document.getElementById("sess-play-UNKNOWN");

    if(!vidList) { //if vidList is found to be null, reinitialize. this happens occasionally when the dom loads slower than script
        setTimeout(initialize, 1000);
    } else {
        TranscoderService.initialize();
        fetchAllSessions();
    }
}

//sessions tab
$("#sessions-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='sess-ClipsStamp'){
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        if(element.id.includes("-CARD")) {
            if(document.getElementById("session-play")  && videoSessDom.firstChild) { //if element exists
                videoSessDom.removeChild(videoSessDom.firstChild); //remove src, so that new src can play
            }
            const id = element.id.split("-")[0];
            openVideoEditor(getVideoById(id));
            videoSessDom = document.getElementById(`sess-play-${id}`);
        }
        if(element.id.includes("-CBOX")) {
            let card = element.parentElement.parentElement.parentElement.parentElement;
            if(!$(element).is(":checked")) {
                makeSelectDOM(card);
            }
            else {
                makeUnselectDOM(card);
            }
            let selectedLength = vidList.getElementsByClassName("card border-primary h-100").length;
            document.getElementById("sess-SelectionLength").innerText = 
                selectedLength + ((selectedLength == 1) ? " selected session" : " selected sessions");

            if(selectedLength == 1) {
                $(element).prop('checked', true); //if this was the first checked element, sometimes it doesnt check so lets force it
                document.getElementById("sess-SelectionToolbar").style.visibility = "visible";
                vidList.style.marginTop = "4rem";
            } 
            else if (selectedLength == 0) {
                $(element).prop('checked', false); //same here on last checked element
                document.getElementById("sess-SelectionToolbar").style.visibility = "hidden";
                document.getElementById("session-list-div").style.marginTop = "0rem";
            }
        }
        if(element.id.includes("sess-")) {
            if(element.id.includes("DeleteSelected")) {
                const confirmString = `Are you certain you want to delete the ${document.getElementById("sess-SelectionLength").innerText}?\n` +
                                    `It will also delete the file`;
                if (window.confirm(confirmString)) {
                    vidList.querySelectorAll('.card.border-primary').forEach(card => {
                        let domID = card.getElementsByClassName("stretched-link")[1].id.split("-CARD")[1];
                        $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', false);
                        deleteVideo(card.parentElement.id, false);
                    });
                    document.getElementById("sess-SelectionToolbar").style.visibility = "hidden";
                    document.getElementById("session-list-div").style.marginTop = "0rem";
                    fetchAllSessions(sortGame, sortType);
                }
            }
            if(element.id.includes("SelectAll")) {
                let selectedLength = 0;
                vidList.querySelectorAll('.card:not(.border-primary)').forEach(card => {
                    let domID = card.getElementsByClassName("stretched-link")[0].id.split("-CARD")[1];
                    $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', true);
                    makeSelectDOM(card);
                    selectedLength++;
                });
                if(selectedLength > 0) {
                    document.getElementById("sess-SelectionLength").innerText = 
                        selectedLength + ((selectedLength == 1) ? " selected session" : " selected sessions");
                }
            }
            if(element.id.includes("UnselectAll")) {
                vidList.querySelectorAll('.card.border-primary').forEach(card => {
                    makeUnselectDOM(card);
                    let domID = card.getElementsByClassName("stretched-link")[0].id.split("-CARD")[1];
                    $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', false);
                });
                document.getElementById("sess-SelectionToolbar").style.visibility = "hidden";
                document.getElementById("session-list-div").style.marginTop = "0rem";
            }
            if(element.id.includes("Sort-")) {
                if(!element.id.split("-")[2].includes("Game|")) {
                    sortType = element.id.split("-")[2];
                    document.getElementById("sess-SortType").innerText = sortType + " First";
                }
                else {
                    sortGame = element.id.split("|")[1];
                    document.getElementById("sess-SortGame").innerText = sortGame;
                }
                fetchAllSessions(sortGame, sortType);
            }
            if(element.id.includes("GridView")) {
                setGridView();
            }
            if(element.id.includes("DetailsView")) {
                setDetailsView();
            }
            if(element.id.includes("Refresh")) {
                fetchAllSessions(sortGame, sortType);
            }
        }
    }
});

function getVideoById(id) {
    for (var i = 0; i < _videos.length; i++) {
        if (_videos[i].id === id){
            return _videos[i];
        }
    }
}

function fetchAllSessions(game=null, type=null) {
    if(game==null && type==null) {
        game = sortGame;
        type = sortType;
    }
    _videos = [];
    var totalSize = 0;
    if(document.getElementById("sess-TotalSize")) document.getElementById("sess-TotalSize").innerText = '';
    MediaService.getAllMedia().then(async (data) => {
        let videos = data[1];
        //console.log(videos);
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
                if(video.createType == "recorded") {
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
                            video.id = video.mediaId.replace("video-", "");
                            const newVidDom = makeVidDOM(video);
                            vidList.appendChild(newVidDom);
                            totalSize += parseFloat((video.fileSizeBytes * 0.000000001));
                        }
                    }
                    else {
                        //console.log('Fetched video.id=%s', video.id);
                        video.id = video.mediaId.replace("video-", "");
                        const newVidDom = makeVidDOM(video);
                        vidList.appendChild(newVidDom);
                        totalSize += parseFloat((video.fileSizeBytes * 0.000000001));
                    }
                    _videos.push(video);
                }
            });
            if(document.getElementById("sess-TotalSize")) document.getElementById("sess-TotalSize").innerText = totalSize.toFixed(2) + " GB";
        }
    );
}

function makeSelectDOM(card) {
    card.setAttribute('class', 'card border-primary h-100');

    const card_hover1 = document.createElement('div');
    card_hover1.setAttribute('class', 'card-img-overlay d-flex flex-column justify-content-between');
    card.prepend(card_hover1);

    const card_hover2 = document.createElement('b');
    card_hover2.setAttribute('class', 'row justify-content-between');
    card_hover1.append(card_hover2);

    const clickable = document.createElement('a');
    clickable.setAttribute('class', 'stretched-link');
    clickable.setAttribute('href', '#');
    card_hover1.append(clickable);

    const card_hover_ctrl1 = document.createElement('div');
    card_hover_ctrl1.setAttribute('class', 'custom-control custom-checkbox');
    card_hover_ctrl1.setAttribute('style', 'z-index:10; width:0px; margin-left:15px');
    card_hover2.append(card_hover_ctrl1);

    const card_hover_cbox1 = document.createElement('input');
    card_hover_cbox1.setAttribute('class', 'custom-control-input');
    $(card_hover_cbox1).prop('checked', true); 
    card_hover_cbox1.setAttribute('type', 'checkbox');
    card_hover_ctrl1.append(card_hover_cbox1);

    const card_hover_cbox2 = document.createElement('label');
    card_hover_cbox2.setAttribute('class', 'custom-control-label');
    card_hover_ctrl1.append(card_hover_cbox2);
}

function makeUnselectDOM(card) {
    card.setAttribute('class', 'card h-100');
    card.firstChild.remove();
}

function makeVidDOM(video) {
    const rand = shortid.generate();
    const _card_id = video.id + "-CARD" + rand;
    const _cbox_id = video.id + "-CBOX" + rand;
    const _dmenu_id = video.id + "-DMENU" + rand;

    const result = document.createElement('div');
    if(sortView == "Grid") result.setAttribute('class', 'col-xl-3 col-md-5 mb-3');
    else if(sortView == "Details") result.setAttribute('class', 'pr-3');
    result.setAttribute('style', 'padding-left: 15px;padding-bottom: 15px');
    result.setAttribute('id', video.id);
    
    const card = document.createElement('div');
    card.setAttribute('class', 'card h-100');
    if(sortView == "Details") card.setAttribute('style', 'width: calc(100vw - 290px);');
    result.append(card);

    const content = document.createElement('div');
    content.setAttribute('class', 'row no-gutters');
    card.append(content);

    const img_container = document.createElement('div');
    img_container.setAttribute('class', 'col-auto');
    if(sortView == "Details") img_container.setAttribute('style', 'width: 25%');
    content.append(img_container);

    const card_img = document.createElement('img');
    card_img.setAttribute('class', 'img-fluid');
    card_img.onerror = () => {
        card_img.setAttribute('src', './media/video_thumbnail_placeholder.png');
    }
    card_img.setAttribute('src', `${video.saveDir}/${video.poster}`);
    card_img.setAttribute('alt', 'Missing Thumbnail');
    card_img.setAttribute('style', 'position: absolute;');
    img_container.append(card_img);

    const ph_img = document.createElement('img');
    ph_img.setAttribute('class', 'img-fluid');
    ph_img.setAttribute('src', './media/video_thumbnail_placeholder.png');
    ph_img.setAttribute('alt', 'Missing Thumbnail');
    img_container.append(ph_img);

    const card_hover1 = document.createElement('div');
    card_hover1.setAttribute('class', 'card-img-overlay d-flex flex-column justify-content-between');
    card.prepend(card_hover1);

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
    card_hover_dmenu2_sub1.onclick = () => shell.showItemInFolder(`${video.saveDir}/${video.path.substring(1)}/${video.fileName}`);
    card_hover_dmenu2.append(card_hover_dmenu2_sub1);

    const card_hover_dmenu2_sub2 = document.createElement('a');
    card_hover_dmenu2_sub2.setAttribute('class', 'dropdown-item');
    card_hover_dmenu2_sub2.setAttribute('href', '#');
    card_hover_dmenu2_sub2.append('Delete');
    card_hover_dmenu2_sub2.onclick = () => deleteVideo(video.id);
    card_hover_dmenu2.append(card_hover_dmenu2_sub2);

    const card_body_container = document.createElement('div');
    card_body_container.setAttribute('class', 'col');
    content.append(card_body_container);

    const card_body = document.createElement('div');
    card_body.setAttribute('class', 'card-block px-2');
    card_body.setAttribute('style', 'padding-top: 10px;');
    card_body_container.append(card_body);

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

function setGridView() {
    sortView = "Grid";
    vidList.querySelectorAll('.card').forEach(card => {
        card.parentElement.setAttribute('class', 'col-xl-3 col-md-5 mb-3');
        card.removeAttribute('style');
        card.children[1].children[0].removeAttribute('style');
    });
}

function setDetailsView() {
    sortView = "Details";
    vidList.querySelectorAll('.card').forEach(card => {
        card.parentElement.setAttribute('class', 'pr-3');
        card.setAttribute('style', 'width: calc(100vw - 290px);');
        card.children[1].children[0].setAttribute('style', 'width: 25%');
    });
}

function deleteVideo(videoId, confirmation=true) {
    VideoService.getVideo(videoId).then(
        (video) => {
        if (!video) {
            console.log(`Did not find video ${videoId}`);
            return;
        }
        const confirmString = `Are you certain you want to delete ${video.fileName}?\nIt will also delete the file`;

        if (confirmation) {
            if (window.confirm(confirmString)) {
                console.log(`Deleting video ${video._id} - ${video.fileName}`);
                VideoService.deleteVideos([videoId]).then(
                    (docs) => {
                        console.log(`Successfully deleted ${docs.length} documents`);
                        document.getElementById(videoId).remove();
                    }
                );
                setTimeout(function(){ 
                    fetchAllSessions(sortGame, sortType);
                }, 500);
            }
        }
        else {
            console.log(`Deleting video ${video._id} - ${video.fileName}`);
            VideoService.deleteVideos([videoId]).then(
                (docs) => {
                    console.log(`Successfully deleted ${docs.length} documents`);
                    document.getElementById(videoId).remove();
                }
            );
            setTimeout(function(){ 
                fetchAllSessions(sortGame, sortType);
            }, 500);
        }
    });
}

export {getVideoById, fetchAllSessions};