import { clipboard } from 'electron';
import moment from 'moment';
import ReplaysSettingsService from './replaysSettingsService';

export function init(){
    fetchAllUploads();
}

function fetchAllUploads(game=null, type=null) {
    ReplaysSettingsService.getUploadClips().then((clips)=> {
        Object.keys(clips).forEach((clip) => {
            makeUploadDOM(clips[clip]);
        });
    });
}

export function makeUploadDOM(video) {
    const _card_id = video.id + "-CARD";
    const _cbox_id = video.id + "-CBOX";
    const _dmenu_id = video.id + "-DMENU";

    const result = document.createElement('div');
    result.setAttribute('class', 'col-xl-3 col-md-5 mb-4');
    result.setAttribute('id', "upload-" + video.id);
    
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
    clickable.onclick = () => window.open(video.url);
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

function deleteVideo(video) {
    const confirmString = `This will only delete the record from Uploads, the link will still be avaliable for viewing. Delete record?`;
    // eslint-disable-next-line no-alert
    if (window.confirm(confirmString)) {
        ReplaysSettingsService.removeUploadClip(video.url);
        document.getElementById("upload-" + video.id).remove();
    }
}

export function createUploadNotification(video, vtitle) {
    const dom = document.createElement('div');
    dom.setAttribute('class', 'toast show');
    dom.setAttribute('id', "noti-u-" + video.id);
    dom.setAttribute('role', 'alert');
    dom.setAttribute('style', 'background-color:#282828;margin-right:-25px;text-align: center;');

    const header = document.createElement('div');
    header.setAttribute('class', 'toast-header');
    header.setAttribute('style', 'background-color:#15b2b1;color:white;');
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