import fs from 'fs';
import { GameDVRService } from '../../../../src/service/GameDVRService';

import Config from '../../../../src/model/Config';
import { log } from '../../../../src/core/Logger';

export const SETTING_REPLAYS_THEME = 'theme';
export const SETTING_REPLAYS_UPLOADED_VIDEOS = 'uploadedVideos';
export const SETTING_REPLAYS_UPLOAD_DEFAULT = 'uploadDefault';
//maybe its not a good idea to store in plain text... oh well, basic auth consequence
export const SETTING_REPLAYS_STREAMABLE_EMAIL = 'streamableEmail';
export const SETTING_REPLAYS_STREAMABLE_PASS = 'streamablePass';

export const SETTING_REPLAYS_GFYCAT_TOKEN = 'gfycatToken';
export const SETTING_REPLAYS_GFYCAT_MUTE_AUDIO = 'gfycatMuteAudio';
export const SETTING_REPLAYS_GFYCAT_UNLISTED = 'gfycatUnlisted';

export const SETTING_REPLAYS_YOUTUBE_TOKEN = 'youtubeToken';
export const SETTING_REPLAYS_YOUTUBE_UNLISTED = 'youtubeUnlisted';

export const UPLOAD = [
    SETTING_REPLAYS_THEME,
    SETTING_REPLAYS_UPLOAD_DEFAULT,
    SETTING_REPLAYS_STREAMABLE_EMAIL,
    SETTING_REPLAYS_STREAMABLE_PASS,
    SETTING_REPLAYS_GFYCAT_TOKEN,
    SETTING_REPLAYS_GFYCAT_MUTE_AUDIO,
    SETTING_REPLAYS_GFYCAT_UNLISTED,
    SETTING_REPLAYS_YOUTUBE_TOKEN,
    SETTING_REPLAYS_YOUTUBE_UNLISTED,
]

const defaultSettings = {
    [SETTING_REPLAYS_THEME]: "Default",
    [SETTING_REPLAYS_UPLOADED_VIDEOS]: {},
    [SETTING_REPLAYS_UPLOAD_DEFAULT]: 'None',
    [SETTING_REPLAYS_STREAMABLE_EMAIL]: '',
    [SETTING_REPLAYS_STREAMABLE_PASS]: '',
    [SETTING_REPLAYS_GFYCAT_TOKEN]: '',
    [SETTING_REPLAYS_GFYCAT_MUTE_AUDIO]: false,
    [SETTING_REPLAYS_GFYCAT_UNLISTED]: true,
    [SETTING_REPLAYS_YOUTUBE_TOKEN]: '',
    [SETTING_REPLAYS_YOUTUBE_UNLISTED]: true,
}

export default class ReplaysSettingsService {
    /**
    * Get an item (or defaultVal if the item doesn't exist) from the config.
    * @param {string} key - key to retrieve associated value for.
    */
    static getSetting(key) {
        if(Config.get('replays_settings')) {
            if(!Config.get('replays_settings')[key])
                this.setSetting(key, defaultSettings[key]);
            return Config.get('replays_settings')[key];
        }
        return Config.set('replays_settings', defaultSettings);
    }

    static getSettings(keys) {
        return new Promise((accept, reject) => {
            const settings = {};
            const settingsPromises = [];
            keys.forEach((key) => {
                settingsPromises.push(this.getSetting(key));
            });
            Promise.all(settingsPromises).then((values) => {
                for (let i = 0; i < values.length; i++) {
                settings[keys[i]] = values[i];
                }
                accept(settings);
            }).catch(err => reject(err));
        });
    }

    /**
    * Set an item in the config.
    * @param {string} key - key to associated for given value.
    * @param {object} value - a JSON serializable object.
    */
    static setSetting(key, value) {
        if(Config.get('replays_settings')) {
            let data = Config.get('replays_settings');
            data[key] = value;
            Config.set('replays_settings', data);
        } 
        else {
            Config.set('replays_settings', defaultSettings);
            this.setSetting(key, value);
        }
        if(key == SETTING_REPLAYS_STREAMABLE_PASS) //just a quick privacy solution incase logs are being transfered
            log.debug(`Setting ${key} to {REDACTED}`);
        else
            log.debug(`Setting ${key} to ${value}`);
    }

    static addUploadClip(key, value) {
        if(Config.get('replays_settings')) {
            let data = Config.get('replays_settings');
            data['uploadedVideos'][key] = value;
            Config.set('replays_settings', data);
        } 
        else {
            Config.set('replays_settings', defaultSettings);
            this.addUploadClip(key, value);
        }
    }

    /**
    * Remove an uploaded clip in the config.
    * @param {string} key - the url of the uploaded clip
    */
    static removeUploadClip(key) {
        if(Config.get('replays_settings')) {
            let data = Config.get('replays_settings');
            let thumbPath = GameDVRService.getSaveDir() + data['uploadedVideos'][key].posterUrl.replace('http://localhost:9000/s/thumbnails', '').replace(/%20/g, ' ');

            fs.unlink(thumbPath,function(err){
                if(err) return console.log(err);
            }); 

            delete data['uploadedVideos'][key];
            Config.set('replays_settings', data);
        } 
        else {
            Config.set('replays_settings', defaultSettings);
            this.removeUploadClip(key, value);
        }
        
    }

    static getUploadClip(key) {
        if(Config.get('replays_settings')) {
            return Config.get('replays_settings')['uploadedVideos'][key];
        }
        return Config.set('replays_settings', defaultSettings);
    }

    static getUploadClips() {
        return new Promise((accept, reject) => {
            const clips = {};
            const clipsPromises = [];
            let keys = Object.keys(Config.get('replays_settings')['uploadedVideos']);
            keys.forEach((key) => {
                clipsPromises.push(this.getUploadClip(key));
            });
            Promise.all(clipsPromises).then((values) => {
                for (let i = 0; i < values.length; i++) {
                    clips[keys[i]] = values[i];
                }
                accept(clips);
            }).catch(err => reject(err));
        });
    }
}