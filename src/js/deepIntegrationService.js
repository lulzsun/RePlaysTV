var currentVideo = null; //the current video object passed in from openVideoEditor()

export const DI_CS_GLOBAL_OFFENSIVE = '04094bf1f162594b28707b50c4e8349e';
export const DI_LEAGUE_OF_LEGENDS = 'b179585c6b68a2791eea4a1ad3d7ef72';

export const GAMES = [
    DI_CS_GLOBAL_OFFENSIVE,
    DI_LEAGUE_OF_LEGENDS,
]

function initPinSettings(video) {
    currentVideo = video;

    if(currentVideo.game.id == DI_CS_GLOBAL_OFFENSIVE) {
        makeSettingDOM("K", "Kills");
        makeSettingDOM("D", "Deaths");
        makeSettingDOM("A", "Assists");
        makeSettingDOM("R", "Round Status");
        makeSettingDOM("B", "Bomb Status", true);
    }
}

function setPinTooltip(key) {
    let icon = '<span class="fa fa-bookmark" aria-hidden="true"></span>';

    if(currentVideo.game.id == DI_CS_GLOBAL_OFFENSIVE) {
        if(key && currentVideo.allPins[key].type == "di") {
            if(currentVideo.allPins[key].group == "di:player:kill")
                icon = '<span class="fa fa-crosshairs" aria-hidden="true"></span>';
            else if(currentVideo.allPins[key].group == "di:player:death")
                icon = '<span class="fa fa-skull-crossbones" aria-hidden="true"></span>';
            else if(currentVideo.allPins[key].group == "di:player:assist")
                icon = '<span class="fa fa-hands-helping" aria-hidden="true"></span>';
            else if(currentVideo.allPins[key].group.includes("di:objective:")) 
                icon = '<span class="fa fa-bomb" aria-hidden="true"></span>';
            else if(currentVideo.allPins[key].group.includes("di:round:")) 
                icon = '<span class="fa fa-stopwatch" aria-hidden="true"></span>';
        }
    }

    return icon;
}

function makeSettingDOM(id, innerText, divider=false) {
    const dd_item = document.createElement('div');
    dd_item.setAttribute('class', 'dropdown-item custom-control custom-checkbox');
    dd_item.setAttribute('style', 'padding-left: 47px;');
    document.getElementById("sess-Dropdown-Pins").append(dd_item);

    const cbox = document.createElement('input');
    cbox.setAttribute('type', 'checkbox');
    cbox.setAttribute('class', 'custom-control-input');
    cbox.setAttribute('id', `sess-Bookmark-Show-${id}`);
    cbox.checked = true;
    cbox.addEventListener("change", onCheckboxChange);
    dd_item.append(cbox);

    const label = document.createElement('label');
    label.setAttribute('class', 'custom-control-label');
    label.setAttribute('for', `sess-Bookmark-Show-${id}`);
    label.innerText = innerText;
    dd_item.append(label);

    if(divider) {
        const dividerDOM = document.createElement('div');
        dividerDOM.setAttribute('class', 'dropdown-divider');
        document.getElementById("sess-Dropdown-Pins").append(dividerDOM);
    }
}

function onCheckboxChange(e) {
    console.log(e.target.id, e.target.checked);
}

export {initPinSettings, setPinTooltip};