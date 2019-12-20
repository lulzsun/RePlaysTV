import { clipboard } from 'electron';
import moment from 'moment';
import shortid from 'shortid';
import ReplaysSettingsService from './replaysSettingsService';

export function init(){
    fetchAllUploads();
}

$("#uploads-div").mousedown( function (e) {
    var element;
    if($(e.target)[0].id == '' || $(e.target)[0].id =='clip-ClipsStamp'){
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1) { //left click
        if(element.id.includes("-CBOX")) {
            let uploadListDiv = document.getElementById("upload-list-div");
            let card = element.parentElement.parentElement.parentElement.parentElement;
            if(!$(element).is(":checked")) {
                makeSelectDOM(card);
            }
            else {
                makeUnselectDOM(card);
            }
            let selectedLength = uploadListDiv.getElementsByClassName("card border-primary h-100").length;
            document.getElementById("upload-SelectionLength").innerText = 
                selectedLength + ((selectedLength == 1) ? " selected upload" : " selected uploads");

            if(selectedLength == 1) {
                $(element).prop('checked', true); //if this was the first checked element, sometimes it doesnt check so lets force it
                document.getElementById("upload-SelectionToolbar").style.visibility = "visible";
                uploadListDiv.style.marginTop = "4rem";
            } 
            else if (selectedLength == 0) {
                $(element).prop('checked', false); //same here on last checked element
                document.getElementById("upload-SelectionToolbar").style.visibility = "hidden";
                document.getElementById("upload-list-div").style.marginTop = "0rem";
            }
        }
        if(element.id.includes("upload-")) {
            if(element.id.includes("DeleteSelected")) {
                let uploadListDiv = document.getElementById("upload-list-div");
                const confirmString = `Are you certain you want to delete the ${document.getElementById("upload-SelectionLength").innerText}?\n` +
                                    `This will only delete the record from Uploads, the link will still be avaliable for viewing.\nDelete record?`;
                if (window.confirm(confirmString)) {
                    uploadListDiv.querySelectorAll('.card.border-primary').forEach(card => {
                        let domID = card.getElementsByClassName("stretched-link")[1].id.split("-CARD")[1];
                        $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', false);
                        let video = {
                            id: card.getElementsByClassName("stretched-link")[1].id.split("-CARD")[0],
                            url: card.getElementsByClassName("stretched-link")[1].href
                        };
                        deleteVideo(video, false);
                    });
                    document.getElementById("upload-SelectionToolbar").style.visibility = "hidden";
                    document.getElementById("upload-list-div").style.marginTop = "0rem";
                }
            }
            if(element.id.includes("SelectAll")) {
                let uploadListDiv = document.getElementById("upload-list-div");
                let selectedLength = 0;
                uploadListDiv.querySelectorAll('.card:not(.border-primary)').forEach(card => {
                    let domID = card.getElementsByClassName("stretched-link")[0].id.split("-CARD")[1];
                    $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', true);
                    makeSelectDOM(card);
                    selectedLength++;
                });
                if(selectedLength > 0) {
                    document.getElementById("upload-SelectionLength").innerText = 
                        selectedLength + ((selectedLength == 1) ? " selected upload" : " selected uploads");
                }
            }
            if(element.id.includes("UnselectAll")) {
                let uploadListDiv = document.getElementById("upload-list-div");
                uploadListDiv.querySelectorAll('.card.border-primary').forEach(card => {
                    let domID = card.getElementsByClassName("stretched-link")[1].id.split("-CARD")[1];
                    $(document.getElementById(card.parentElement.id+"-CBOX"+domID)).prop('checked', false);
                    makeUnselectDOM(card);
                });
                document.getElementById("upload-SelectionToolbar").style.visibility = "hidden";
                document.getElementById("upload-list-div").style.marginTop = "0rem";
            }
            if(element.id.includes("Sort-")) {

            }
            if(element.id.includes("Refresh")) {
                
            }
        }
    }
});

function fetchAllUploads(game=null, type=null) {
    ReplaysSettingsService.getUploadClips().then((clips)=> {
        Object.keys(clips).forEach((clip) => {
            makeUploadDOM(clips[clip]);
        });
    });
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

export function makeUploadDOM(video) {
    const rand = shortid.generate();
    const _card_id = video.id + "-CARD" + rand;
    const _cbox_id = "upload-" + video.id + "-CBOX" + rand;
    const _dmenu_id = video.id + "-DMENU" + rand;

    const result = document.createElement('div');
    result.setAttribute('class', 'col-xl-3 col-md-5 mb-4');
    result.setAttribute('id', "upload-" + video.id);
    
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
    clickable.setAttribute('href', video.url);
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
    card_hover_dmenu2_sub1.append('Copy link to clipboard');
    card_hover_dmenu2_sub1.onclick = () => clipboard.writeText(video.url);
    card_hover_dmenu2.append(card_hover_dmenu2_sub1);

    const card_hover_dmenu2_sub2 = document.createElement('a');
    card_hover_dmenu2_sub2.setAttribute('class', 'dropdown-item');
    card_hover_dmenu2_sub2.setAttribute('href', '#');
    card_hover_dmenu2_sub2.append('Delete');
    card_hover_dmenu2_sub2.onclick = () => deleteVideo(video);
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
    card_title.append(" " + video.title);
    card_body.append(card_title);

    const card_subtitle = document.createElement('p');
    card_subtitle.setAttribute('class', 'card-subtitle mb-2 text-muted');
    card_subtitle.append(moment(video.createdTime).format('YYYY/MM/DD | hh:mm A'));
    card_body.append(card_subtitle);
    
    document.getElementById('upload-list-div').appendChild(result);
}

function deleteVideo(video, confirmation=true) {
    const confirmString = `This will only delete the record from Uploads, the link will still be avaliable for viewing.\nDelete record?`;
    if(confirmation) {
        if (window.confirm(confirmString)) {
            ReplaysSettingsService.removeUploadClip(video.url);
            document.getElementById("upload-" + video.id).remove();
        }
    }
    else {
        ReplaysSettingsService.removeUploadClip(video.url);
        document.getElementById("upload-" + video.id).remove();
    }
}

export function createUploadNotification(video, vtitle) {
    const dom = document.createElement('div');
    dom.setAttribute('class', 'toast show');
    dom.setAttribute('id', "noti-u-" + video.id);
    dom.setAttribute('role', 'alert');
    dom.setAttribute('style', 'background-color:var(--secondary);margin-right:-25px;text-align: center;');

    const header = document.createElement('div');
    header.setAttribute('class', 'toast-header');
    header.setAttribute('style', 'background-color:var(--primary);');
    dom.append(header);

    const h1 = document.createElement('strong');
    h1.setAttribute('class', 'mr-auto');
    h1.innerText = 'Uploading Clip';
    header.append(h1);

    const closebtn = document.createElement('button');
    closebtn.setAttribute('class', 'ml-2 mb-1 close');
    closebtn.onclick = () => dom.remove();
    //header.append(closebtn);

    const closeico = document.createElement('i');
    closeico.setAttribute('class', 'fa fa-window-close');
    closebtn.append(closeico);

    const body = document.createElement('div');
    body.setAttribute('class', 'toast-body');
    dom.append(body);

    const progress = document.createElement('div');
    progress.setAttribute('class', 'progress');
    body.append(progress);

    const progressbar = document.createElement('div');
    progressbar.setAttribute('class', 'progress-bar progress-bar-striped progress-bar-animated');
    progressbar.setAttribute('role', 'progressbar');
    progressbar.setAttribute('style', 'width: 0%');
    progress.append(progressbar);

    const title = document.createElement('small');
    title.innerText = vtitle;
    body.append(title);

    document.getElementById("notifications").append(dom);
    return {progressbar, dom};
}