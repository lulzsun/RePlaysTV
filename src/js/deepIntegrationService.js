import VideoService from '../../../../src/service/VideoService';
import Pin from '../../../../src/service/Pins/Pin';
import BaseService from '../../../../src/service/BaseService';

export const DI_CS_GLOBAL_OFFENSIVE = '04094bf1f162594b28707b50c4e8349e';
export const DI_LEAGUE_OF_LEGENDS = 'b179585c6b68a2791eea4a1ad3d7ef72';

export const GAMES = [
    DI_CS_GLOBAL_OFFENSIVE,
    DI_LEAGUE_OF_LEGENDS,
]

const VideoNeDB = BaseService.getModel('Video');

var currentVideo = null; //the current video object passed in from openVideoEditor()
var tempAddPins = [], tempRemovePins = []; //exists for bookmarks added manually

function initPinSettings(video) {
    tempAddPins = [], tempRemovePins = [];
    currentVideo = video;
    document.getElementById("sess-Dropdown-Pins").innerHTML = '';

    if(currentVideo.game.id == DI_CS_GLOBAL_OFFENSIVE) {
        makeSettingDOM("di:player:kill", "Kills");
        makeSettingDOM("di:player:death", "Deaths");
        makeSettingDOM("di:player:assist", "Assists");
        makeSettingDOM("di:round", "Round Status");
        makeSettingDOM("di:objective", "Bomb Status", true);
    } else if(currentVideo.game.id == DI_LEAGUE_OF_LEGENDS) {
        makeSettingDOM("CHAMPION_KILL", "Kills");
        makeSettingDOM("CHAMPION_DEATH", "Deaths");
        makeSettingDOM("CHAMPION_ASSIST", "Assists");
        makeSettingDOM("ELITE_MONSTER_KILL", "Epic Monsters");
        makeSettingDOM("BUILDING_KILL", "Structures", true);
    }
}

function setPinTooltip(value) {
    const exists = Object.keys(currentVideo.pins).find(key => (currentVideo.pins[key].time/1000).toFixed(4) === value);
    if(exists) value = exists;
    else return `<span id="${value*1000}" class="pinObject fa fa-bookmark" aria-hidden="true"></span>`; //this must be a tempAddPins array object

    let icon = `<span id="${currentVideo.pins[value].time}" class="pinObject fa fa-bookmark" aria-hidden="true"></span>`;

    if(currentVideo.game.id == DI_CS_GLOBAL_OFFENSIVE) {
        if(value && currentVideo.pins[value].type == "di") {
            if(currentVideo.pins[value].group == "di:player:kill")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject di:player:kill fa fa-crosshairs" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "di:player:death")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject di:player:death fa fa-skull-crossbones" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "di:player:assist")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject di:player:assist fa fa-hands-helping" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group.includes("di:objective")) 
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject di:objective fa fa-bomb" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group.includes("di:round")) 
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject di:round fa fa-stopwatch" aria-hidden="true"></span>`;
        }
    } else if(currentVideo.game.id == DI_LEAGUE_OF_LEGENDS) {
        if(value && currentVideo.pins[value].type == "di") {
            if(currentVideo.pins[value].group == "CHAMPION_KILL")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject CHAMPION_KILL fa fa-crosshairs" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "CHAMPION_DEATH")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject CHAMPION_DEATH fa fa-skull-crossbones" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "CHAMPION_ASSIST")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject CHAMPION_ASSIST fa fa-hands-helping" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "ELITE_MONSTER_KILL")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject ELITE_MONSTER_KILL fa fa-dragon" aria-hidden="true"></span>`;
            else if(currentVideo.pins[value].group == "BUILDING_KILL")
                icon = `<span id="${currentVideo.pins[value].time}" class="pinObject BUILDING_KILL fa fa-gopuram" aria-hidden="true"></span>`; //monument
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
    let id = e.target.id.replace('sess-Bookmark-Show-', '');
    let pinObjects = document.getElementsByClassName(id);
    for(var i = 0; i != pinObjects.length; ++i) {
        if(e.target.checked)
            pinObjects[i].parentElement.parentElement.style.visibility = "visible";
        else
            pinObjects[i].parentElement.parentElement.style.visibility = "hidden";
    }
    //console.log(id, e.target.checked);
}

function addPin(type, time) {
    const newPin = new Pin(type, time);
    VideoService.addPins(currentVideo.id, [newPin]).then(
        (result) => {
            //console.log(result);
        }
    ).catch(
        (err) => {
            console.error(err);
        }
    );
    tempAddPins.push({[currentVideo.id]: newPin}); //video pins do not actually update until restart, we store these so we can fake an add
}

function removePin(type, time) { //VideoService does not have removePin(), I'm not exactly sure how original plays did it, but this way works fine.
    //refactor this lol
    const newPin = new Pin(type, time);
    const pinToSet = [newPin].reduce(
        (acc, item) => {
          const pinId = Pin.getId(item, currentVideo.id);
          acc[`pins.${pinId}`] = item;
          return acc;
        },
        {}
      );
    const update = {
        $unset: pinToSet,
    };
    //end of lol

    VideoNeDB.updateOne(currentVideo.id, update).then(
        (result) => {
            //console.log(result);
        }
    ).catch(
        (err) => {
            console.error(err);
        }
    );

    //check to see if this is a tempAddPin before adding it as a tempRemovePin
    for(var pin in tempAddPins){
        if(tempAddPins[pin][currentVideo.id].time == time) {
            tempAddPins.splice(pin,1); //remove from temp array
            return; //exit before push
        }
    }
    tempRemovePins.push({[currentVideo.id]: newPin}); //video pins do not actually update until restart, we store these so we can fake a removal
}

export {initPinSettings, setPinTooltip, addPin, removePin, tempAddPins, tempRemovePins};