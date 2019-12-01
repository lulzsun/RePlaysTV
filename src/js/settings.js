import SettingsService, {
    SETTING_MAIN_AUTO_START_APP,
    SETTING_MAIN_DETECT_ELEVATED_PROCESSES,
    SETTING_MAIN_PYQT_MIGRATION_TIME,
    SETTING_MAIN_REMEMBER_ME,
    SETTING_MAIN_START_MINIMIZED,
    SETTING_MAIN_VIDEO_PRUNE_TIME,
    SETTING_MAIN_VIDEO_SAVE_DIR,
    SETTING_MAIN_VIDEO_TMP_DIR,
    // Keybind mappings - used in KEYBIND_SETTING_MAP to create keybinds
    SETTING_KB_BOOKMARK,
    SETTING_KB_INSTANT_REPLAY,
    SETTING_KB_PUSH_TO_TALK,
    SETTING_KB_SAVE_HIGHLIGHT,
    SETTING_KB_TAKE_SCREENSHOT,
    SETTING_KB_START_STOP_REC,
    SETTING_KB_TOGGLE_MUTE_AUDIO,
    SETTING_KB_TOGGLE_MUTE_MIC,
    // LTC settings
    SETTING_LTC_STARTUP_PARAMS,
    // Messaging settings
    SETTING_MESSAGING_AUDIO_ENABLED,
} from '../../../../src/service/SettingsService';
import GameDVRService, {
    SETTING_AUDIO_DEVICES_MICROPHONE,
    SETTING_AUDIO_GAME_ENABLED,
    SETTING_AUDIO_MIC_ENABLED,
    SETTING_AUDIO_MIC_RECORDING_MODE,
    SETTING_AUDIO_SPECTATE_SFX_VOLUME,
    SETTING_AUDIO_VOLUME_GAME_AUDIO,
    SETTING_AUDIO_VOLUME_MICROPHONE,
    SETTING_AUTO_DELETE_ON_SHARE,
    SETTING_AUTO_MANAGE_DISKSPACE_THRESHOLD,
    SETTING_AUTO_MANAGE_TIMESTAMP_THRESHOLD,
    SETTING_AUTO_MANAGE_TYPE,
    SETTING_AUTO_MANAGE_VIDEOS,
    SETTING_AUTO_RECORD,
    SETTING_AUTO_UPLOAD_CLIP,
    SETTING_HIGHLIGHT_LENGTH_SECS,
    SETTING_IR_LENGTH_SECS,
    SETTING_MANUAL_RECORD,
    SETTING_OPTIMIZE_FOR_UPLOAD,
    SETTING_OVERLAY_LOCATION,
    SETTING_PIN_DURATION_SECS,
    SETTING_RECORD_MOUSE_CURSOR,
    SETTING_SHOW_RECORDING_TIMER,
    SETTING_VIDEO_BITRATE,
    SETTING_VIDEO_FRAMERATE,
    SETTING_VIDEO_RECORDING_MODE,
    SETTING_VIDEO_RESOLUTION,
    SETTING_WEBCAM_DEVICE_ID,
    SETTING_WEBCAM_ENABLED,
    SETTING_WEBCAM_LOCATION,
    SETTING_WEBCAM_OPACITY,
} from '../../../../src/service/GameDVRService';

var keyboardMap = [
    "", // [0]
    "", // [1]
    "", // [2]
    "CANCEL", // [3]
    "", // [4]
    "", // [5]
    "HELP", // [6]
    "", // [7]
    "BACK_SPACE", // [8]
    "TAB", // [9]
    "", // [10]
    "", // [11]
    "CLEAR", // [12]
    "ENTER", // [13]
    "ENTER_SPECIAL", // [14]
    "", // [15]
    "SHIFT", // [16]
    "CONTROL", // [17]
    "ALT", // [18]
    "PAUSE", // [19]
    "CAPS_LOCK", // [20]
    "KANA", // [21]
    "EISU", // [22]
    "JUNJA", // [23]
    "FINAL", // [24]
    "HANJA", // [25]
    "", // [26]
    "ESCAPE", // [27]
    "CONVERT", // [28]
    "NONCONVERT", // [29]
    "ACCEPT", // [30]
    "MODECHANGE", // [31]
    "SPACE", // [32]
    "PAGE_UP", // [33]
    "PAGE_DOWN", // [34]
    "END", // [35]
    "HOME", // [36]
    "LEFT", // [37]
    "UP", // [38]
    "RIGHT", // [39]
    "DOWN", // [40]
    "SELECT", // [41]
    "PRINT", // [42]
    "EXECUTE", // [43]
    "PRINTSCREEN", // [44]
    "INSERT", // [45]
    "DELETE", // [46]
    "", // [47]
    "0", // [48]
    "1", // [49]
    "2", // [50]
    "3", // [51]
    "4", // [52]
    "5", // [53]
    "6", // [54]
    "7", // [55]
    "8", // [56]
    "9", // [57]
    "COLON", // [58]
    "SEMICOLON", // [59]
    "LESS_THAN", // [60]
    "EQUALS", // [61]
    "GREATER_THAN", // [62]
    "QUESTION_MARK", // [63]
    "AT", // [64]
    "A", // [65]
    "B", // [66]
    "C", // [67]
    "D", // [68]
    "E", // [69]
    "F", // [70]
    "G", // [71]
    "H", // [72]
    "I", // [73]
    "J", // [74]
    "K", // [75]
    "L", // [76]
    "M", // [77]
    "N", // [78]
    "O", // [79]
    "P", // [80]
    "Q", // [81]
    "R", // [82]
    "S", // [83]
    "T", // [84]
    "U", // [85]
    "V", // [86]
    "W", // [87]
    "X", // [88]
    "Y", // [89]
    "Z", // [90]
    "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
    "", // [92]
    "CONTEXT_MENU", // [93]
    "", // [94]
    "SLEEP", // [95]
    "NUMPAD0", // [96]
    "NUMPAD1", // [97]
    "NUMPAD2", // [98]
    "NUMPAD3", // [99]
    "NUMPAD4", // [100]
    "NUMPAD5", // [101]
    "NUMPAD6", // [102]
    "NUMPAD7", // [103]
    "NUMPAD8", // [104]
    "NUMPAD9", // [105]
    "MULTIPLY", // [106]
    "ADD", // [107]
    "SEPARATOR", // [108]
    "SUBTRACT", // [109]
    "DECIMAL", // [110]
    "DIVIDE", // [111]
    "F1", // [112]
    "F2", // [113]
    "F3", // [114]
    "F4", // [115]
    "F5", // [116]
    "F6", // [117]
    "F7", // [118]
    "F8", // [119]
    "F9", // [120]
    "F10", // [121]
    "F11", // [122]
    "F12", // [123]
    "F13", // [124]
    "F14", // [125]
    "F15", // [126]
    "F16", // [127]
    "F17", // [128]
    "F18", // [129]
    "F19", // [130]
    "F20", // [131]
    "F21", // [132]
    "F22", // [133]
    "F23", // [134]
    "F24", // [135]
    "", // [136]
    "", // [137]
    "", // [138]
    "", // [139]
    "", // [140]
    "", // [141]
    "", // [142]
    "", // [143]
    "NUM_LOCK", // [144]
    "SCROLL_LOCK", // [145]
    "WIN_OEM_FJ_JISHO", // [146]
    "WIN_OEM_FJ_MASSHOU", // [147]
    "WIN_OEM_FJ_TOUROKU", // [148]
    "WIN_OEM_FJ_LOYA", // [149]
    "WIN_OEM_FJ_ROYA", // [150]
    "", // [151]
    "", // [152]
    "", // [153]
    "", // [154]
    "", // [155]
    "", // [156]
    "", // [157]
    "", // [158]
    "", // [159]
    "CIRCUMFLEX", // [160]
    "EXCLAMATION", // [161]
    "DOUBLE_QUOTE", // [162]
    "HASH", // [163]
    "DOLLAR", // [164]
    "PERCENT", // [165]
    "AMPERSAND", // [166]
    "UNDERSCORE", // [167]
    "OPEN_PAREN", // [168]
    "CLOSE_PAREN", // [169]
    "ASTERISK", // [170]
    "PLUS", // [171]
    "PIPE", // [172]
    "HYPHEN_MINUS", // [173]
    "OPEN_CURLY_BRACKET", // [174]
    "CLOSE_CURLY_BRACKET", // [175]
    "TILDE", // [176]
    "", // [177]
    "", // [178]
    "", // [179]
    "", // [180]
    "VOLUME_MUTE", // [181]
    "VOLUME_DOWN", // [182]
    "VOLUME_UP", // [183]
    "", // [184]
    "", // [185]
    "SEMICOLON", // [186]
    "EQUALS", // [187]
    "COMMA", // [188]
    "MINUS", // [189]
    "PERIOD", // [190]
    "SLASH", // [191]
    "BACK_QUOTE", // [192]
    "", // [193]
    "", // [194]
    "", // [195]
    "", // [196]
    "", // [197]
    "", // [198]
    "", // [199]
    "", // [200]
    "", // [201]
    "", // [202]
    "", // [203]
    "", // [204]
    "", // [205]
    "", // [206]
    "", // [207]
    "", // [208]
    "", // [209]
    "", // [210]
    "", // [211]
    "", // [212]
    "", // [213]
    "", // [214]
    "", // [215]
    "", // [216]
    "", // [217]
    "", // [218]
    "OPEN_BRACKET", // [219]
    "BACK_SLASH", // [220]
    "CLOSE_BRACKET", // [221]
    "QUOTE", // [222]
    "", // [223]
    "META", // [224]
    "ALTGR", // [225]
    "", // [226]
    "WIN_ICO_HELP", // [227]
    "WIN_ICO_00", // [228]
    "", // [229]
    "WIN_ICO_CLEAR", // [230]
    "", // [231]
    "", // [232]
    "WIN_OEM_RESET", // [233]
    "WIN_OEM_JUMP", // [234]
    "WIN_OEM_PA1", // [235]
    "WIN_OEM_PA2", // [236]
    "WIN_OEM_PA3", // [237]
    "WIN_OEM_WSCTRL", // [238]
    "WIN_OEM_CUSEL", // [239]
    "WIN_OEM_ATTN", // [240]
    "WIN_OEM_FINISH", // [241]
    "WIN_OEM_COPY", // [242]
    "WIN_OEM_AUTO", // [243]
    "WIN_OEM_ENLW", // [244]
    "WIN_OEM_BACKTAB", // [245]
    "ATTN", // [246]
    "CRSEL", // [247]
    "EXSEL", // [248]
    "EREOF", // [249]
    "PLAY", // [250]
    "ZOOM", // [251]
    "", // [252]
    "PA1", // [253]
    "WIN_OEM_CLEAR", // [254]
    "" // [255]
  ];

$( document ).ready(function() {
    init();
});

var isKeybinding = false;
var keybind = "";

const GENERAL = [
    SETTING_MAIN_AUTO_START_APP,
    SETTING_MAIN_START_MINIMIZED,
    SETTING_MAIN_REMEMBER_ME,
    SETTING_MAIN_DETECT_ELEVATED_PROCESSES,
    SETTING_KB_TAKE_SCREENSHOT,
    SETTING_OVERLAY_LOCATION,
    SETTING_SHOW_RECORDING_TIMER,
]

const VIDEO = [
    SETTING_AUTO_RECORD,
    SETTING_MANUAL_RECORD,
    SETTING_KB_START_STOP_REC,
]

function init() {
    //load all setting sub tabs
    $("#settings-general-div").load("./html/settings/general.html"); 
    $("#settings-video-div").load("./html/settings/video.html"); 
    $("#settings-audio-div").load("./html/settings/audio.html"); 
    $("#settings-upload-div").load("./html/settings/upload.html"); 
    $("#settings-advanced-div").load("./html/settings/advanced.html"); 
    $("#settings-news-div").load("./html/settings/news.html"); 
    $("#settings-help-div").load("./html/settings/help.html"); 
    SettingsService.init();
    initGeneral();
    initVideo(); 
}

function initGeneral(){
    SettingsService.getSettings(GENERAL).then((setting) => {
        if(setting){
            $('#sett-autoStartApp').prop('checked', setting.autoStartApp); 
            $('#sett-startMinimized').prop('checked', setting.startMinimized); 
            $('#sett-rememberMe').prop('checked', setting.rememberMe); 
            $('#sett-detectElevatedProcesses').prop('checked', setting.detectElevatedProcesses); 
            document.getElementById("sett-keybindTakeScreenshot").innerText = setting.keybindTakeScreenshot;
            $('#sett-overlayLocation-'+setting.overlayLocation).prop('checked', setting.overlayLocation); 
            $('#sett-showRecordingTimer').prop('checked', setting.showRecordingTimer); 
            console.log(setting);
        }else console.error("General setting missing?");
    })
}

function initVideo(){
    SettingsService.getSettings(VIDEO).then((setting) => {
        if(setting){
            $('#sett-autoRecord').prop('checked', setting.autoRecord); 
            $('#sett-manualRecord').prop('checked', setting.manualRecord); 
            if(!setting.manualRecord && !setting.autoRecord)
                $('#sett-offRecord').prop('checked', true); 
            document.getElementById("sett-keybindStartStopRec").innerText = setting.keybindStartStopRec;
            // $('#sett-overlayLocation-'+setting.overlayLocation).prop('checked', setting.overlayLocation); 
            console.log(setting);
        }else console.error("Video setting missing?");
    })
}

$("#settings-general-div").mousedown( function (e) {
    var element;
    isKeybinding = false;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("autoStartApp")){
            SettingsService.setSetting(SETTING_MAIN_AUTO_START_APP, !$(element).is(":checked"));
        }
        if(element.id.includes("startMinimized")){
            SettingsService.setSetting(SETTING_MAIN_START_MINIMIZED, !$(element).is(":checked"));
        }
        if(element.id.includes("rememberMe")){
            SettingsService.setSetting(SETTING_MAIN_REMEMBER_ME, !$(element).is(":checked"));
        }
        if(element.id.includes("detectElevatedProcesses")){
            SettingsService.setSetting(SETTING_MAIN_DETECT_ELEVATED_PROCESSES, !$(element).is(":checked"));
        }
        if(element.id.includes("keybindTakeScreenshot")){
            onKeybind(element, SETTING_KB_TAKE_SCREENSHOT);
        }
        if(element.id.includes("overlayLocation")){
            SettingsService.setSetting(SETTING_OVERLAY_LOCATION, element.id.split("-")[2]);
        }
        if(element.id.includes("showRecordingTimer")){
            SettingsService.setSetting(SETTING_SHOW_RECORDING_TIMER, !$(element).is(":checked"));
        }
    }
});

$("#settings-video-div").mousedown( function (e) {
    var element;
    isKeybinding = false;
    if(!$(e.target)[0].id) {
        element = $(e.target)[0].parentElement;
        if(element.className.includes('custom-control')) {
            element = element.children[0];
        }
    }else element = $(e.target)[0];

    if(e.which == 1 && element.id.includes("sett-")) { //left click
        if(element.id.includes("autoRecord")){
            SettingsService.setSetting(SETTING_AUTO_RECORD, !$(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, $(element).is(":checked"));
        }
        if(element.id.includes("manualRecord")){
            SettingsService.setSetting(SETTING_AUTO_RECORD, $(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, !$(element).is(":checked"));
        }
        if(element.id.includes("desktopRecord")){
            alert("This feature is not implemented, if you wish to have this feature, request it on Github.");
        }
        if(element.id.includes("offRecord")){
            SettingsService.setSetting(SETTING_AUTO_RECORD, $(element).is(":checked"));
            SettingsService.setSetting(SETTING_MANUAL_RECORD, $(element).is(":checked"));
        }
        if(element.id.includes("keybindStartStopRec")){
            onKeybind(element, SETTING_KB_START_STOP_REC);
        }
    }

    if(element.id.includes("debugger")){
        //console.log(SettingsService.MAIN_SETTING_LIST);
        SettingsService.getSettings(VIDEO).then((result) => {
            console.log(result);
        })
    }
    console.log("clicked on element: " + element.id);
});

$(document).on('keydown', function(event) {
    if ( event.shiftKey && event.keyCode ) {
        if(event.keyCode == 16 || event.keyCode == 17 || event.keyCode == 18)
            keybind = "Shift";
        else
            keybind = "Shift+" + keyboardMap[event.keyCode];
    }
    if ( event.ctrlKey && event.keyCode ) {
        if(event.keyCode == 16 || event.keyCode == 17 || event.keyCode == 18)
            keybind = "Control";
        else
            keybind = "Control+" + keyboardMap[event.keyCode];
    }
    if ( event.altKey && event.keyCode ) {
        if(event.keyCode == 16 || event.keyCode == 17 || event.keyCode == 18)
            keybind = "Alt";
        else
            keybind = "Alt+" + keyboardMap[event.keyCode];
    }
    if ( (!event.ctrlKey && !event.altKey && !event.shiftKey) && event.keyCode ) {
        keybind = keyboardMap[event.keyCode];
    }
});

function onKeybind(element, setting){
    isKeybinding = true;
    element.innerText = keybind;

    setTimeout(function(){ 
        if(isKeybinding) onKeybind(element, setting);
        else {
            if(keybind == "") {
                SettingsService.getSetting(setting).then((result) => {
                    element.innerText = result;
                })
            }
            else {
                SettingsService.setSetting(setting, keybind);
            }
        }
    }, 100);
}