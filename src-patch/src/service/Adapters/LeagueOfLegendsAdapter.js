import to from 'await-to-js';
import yaml from 'js-yaml';
import fs from 'fs';
import { log } from '../../core/Logger';
import BaseAdapter from './BaseAdapter';
import OpLeagueOfLegends from '../OpClient/OpLeagueOfLegends';
import GameSessionService, { EVENT_TYPE_DI } from '../GameSessionService';
import Pin from '../Pins/Pin';
import { DI_CODE } from './AdapterConsts';

const DEFAULT_GAME_ROOT = 'C:/Riot Games/League of Legends/';
const GAME_ROOT_NEEDS_EXTRAS = 'solutions/';  // old RADS detections may start with this
const GAME_ROOT_EXTRAS = 'RADS/';  // add this if the game exe detected starts with 'solutions/'

export default class LeagueOfLegendsAdapter extends BaseAdapter {
  constructor(gameId, sessionId, sessionData = {}) {
    super(gameId, sessionId, sessionData, 'LeagueOfLegendsAdapter');
  }

  onStart(gameSession) {
    return new Promise(
      (accept) => {
        super.onStart(gameSession).then(async () => {
          this.sessionData = gameSession;
          const [errName, summonerName] = await to(
            this._getLolClientApiSummonerName()
          );
          const [errConfig, lolConfig] = await to(
            LeagueOfLegendsAdapter._getLolAccountIdRegion(gameSession)
          );
          if (errName) {
            log.error(errName);
            return;
          }
          if (errConfig) {
            log.error(errConfig);
            return;
          }
          const { region } = lolConfig;
          log.debug(`detected lol summonername: ${summonerName} - region ${region}`);

          const [errInfo, summonerInfo] = await to(
            OpLeagueOfLegends.getSummonerBySummonerName(summonerName, region)
          );
          if (errInfo) {
            log.error(`Error while retrieving summoner info from replayweb for summonerName, region ${summonerName}, ${region}. error ${JSON.stringify(errInfo)}`);
            // Still save some data to session metadata
            this.sessionData.status = DI_CODE.MATCH_DATA_STATUS_NO_DATA_GAME;
            this.sessionData.summonerData = { summonerName, region };
            this._updateSessionMetadataOnStart();
            return;
          }
          log.debug(`Retrieved summoner data by account: ${JSON.stringify(summonerInfo)}`);
          const summonerInfoNew = { ...summonerInfo, region };  // Append region
          this.sessionData.summonerData = summonerInfoNew;
          this.sessionData.status = DI_CODE.MATCH_DATA_STATUS_NO_DATA_GAME;
          this.sessionData.startTime = new Date().getTime();
          this._updateSessionMetadataOnStart();
          // Get current match data in the background
          //this._requestCurrentMatchAsync(summonerInfo.summonerId, region);

          accept();
        });
      }
    );
  }

  /**
   * Helper function to update session meta data to hold the proper state onStart of LoL
   * summonerData: all known summoner information to this point
   * status: known status of current data
   */
  _updateSessionMetadataOnStart() {
    const sessionMetadata = {
      matchSpectatorInfo: this.sessionData.currentMatchInfo,
      summonerData: this.sessionData.summonerData,
      matchTime: this.sessionData.matchTime,
      status: this.sessionData.status,
      startTime: this.sessionData.startTime,
    };
    GameSessionService.updateSessionMetadata(this.sessionId, sessionMetadata);
  }

  /**
    * Function to get the League of Legends game root based on the game detection.
    * But in order to get game root, we will look at the gameExePath and game detection
    * pattern to deduce the game root.
    * gameSession: game session object containing detection information
    */
  static _getGameRootPromise(gameSession) {
    return new Promise((accept) => {
      if (!gameSession.ltcData
        || !gameSession.ltcData.gameExePath
        || !gameSession.detection
        || !gameSession.detection.det_exe) {
        log.error(`gameSession object does not have required detection information. Defaulting to DEFAULT_GAME_ROOT. gameSession: ${gameSession}`);
        accept(DEFAULT_GAME_ROOT);
        return;
      }
      // gameExePath comes with escaped backslashes. Simplicity calls to replace with '/'
      const cleanedGameExePath = gameSession.ltcData.gameExePath.replace(/\\/g, '/');
      // Replace asterisk with wildcard matches
      let cleanedExe = gameSession.detection.det_exe.replace(/\*/gi, '.+');
      // For older RADS LoL detections, presume a prepended 'RADS/' directory. Ensure it's there
      // in the regex for determining game root.
      // Newer non-RADS LoL game exe's do not need this! (April 2019)
      if (cleanedExe.startsWith(GAME_ROOT_NEEDS_EXTRAS)) {
        cleanedExe = `${GAME_ROOT_EXTRAS}${cleanedExe}`;
      }
      const reGameExe = new RegExp(`${cleanedExe}$`, 'i');
      const gameExeMatch = cleanedGameExePath.match(reGameExe);
      if (gameExeMatch && gameExeMatch.index) {
        accept(cleanedGameExePath.substring(0, gameExeMatch.index));
      } else {
        // Default to the LoL game root default
        log.debug(`Unable to determine LoL game root from detection. ${JSON.stringify(gameSession)} -- Defaulting to LoL Default ${DEFAULT_GAME_ROOT}`);
        accept(DEFAULT_GAME_ROOT);
      }
    });
  }

  /**
    * Retrieve the lol settings stored in user's directory in Promise
    */
  static _getLolSettingsPromise(gameSession) {
    return new Promise((accept, reject) => {
      // Get the account and summoner id by looking looking at the LoL config located at:
      // {Game root}/Config\LeagueClientSettings.yaml
      LeagueOfLegendsAdapter._getGameRootPromise(gameSession).then((gameRoot) => {
        const yamlFile = `${gameRoot}Config/LeagueClientSettings.yaml`;
        log.debug(`Reading LoL yaml file at ${yamlFile}`);
        fs.readFile(yamlFile, (err, data) => {
          if (err) {
            reject({ message: 'Error reading LoL yaml file. Missing?', code: 500 });
          } else {
            const lolSettings = yaml.safeLoad(data);
            if (!lolSettings) {
              reject({ message: 'LoL yaml was empty', code: 404 });
              return;
            }
            accept(lolSettings);
          }
        });
      }).catch(err => reject(err));
    });
  }

  /**
    * Helper to get the account id and region from the lol settings (_getLolSettingsPromise)
    * gameSession: object, game session object
    * Returns: object of account id and region from lol settings { accountId, region }
    */
  static _getLolAccountIdRegion(gameSession) {
    return new Promise((accept, reject) => {
      LeagueOfLegendsAdapter._getLolSettingsPromise(gameSession).then((lolSettings) => {
        log.debug(`detected lolSettings: ${JSON.stringify(lolSettings)}`);
        if (lolSettings.install
          && lolSettings.install['game-settings']
          && lolSettings.install['game-settings'].accountId
          && lolSettings.install.globals
          && lolSettings.install.globals.region) {
          const { accountId } = lolSettings.install['game-settings'];
          const region = lolSettings.install.globals.region.toLowerCase();
          accept({ accountId, region });
        } else {
          log.error(`Unable to detect lol summoner information! LoL yaml file: ${JSON.stringify(lolSettings)}`);
          reject({ message: 'Unable to detect lol summoner info from yaml', code: 500 });
        }
      }).catch(err => reject(err));
    });
  }

  onComplete() {
    return new Promise(
      (accept) => {
        super.onComplete().then(() => {
          const maxRetryTime = 180000; // Stop trying after 3 minutes
          let retryTime = 60000;  // First try at 1 minute
          const retryTimeInterval = 60000;  // try every 1 minute
          const statusCheckStartTime = Date.now();
          const attemptCheck = () => new Promise((attemptAccept, attemptReject) => {
            this._getCurrentSummonerMatchHistory().then((lolMatchHistory) => {
              // get latest match's timestamp ('createdTime') and verify if it is between our 'startTime' and 'endTime'
              let startTime = this.sessionData.startTime;
              let endTime = new Date().getTime();
              let createdTime = lolMatchHistory.games.games[0].gameCreation;
              let gameId = lolMatchHistory.games.games[0].gameId;

              // returns true if 'createdTime' is between 'startTime' and 'endTime'
              if (startTime < createdTime && endTime > createdTime) {
                log.debug(`Retrieved gameId, match fits between startTime and endTime. Requests took ${Date.now() - statusCheckStartTime}ms`);
                this.sessionData.endTime = createdTime; //remove this if problems arise
                attemptAccept(gameId);
              } else if (retryTime < maxRetryTime) {
                retryTime += retryTimeInterval;
                log.debug(`Did not get correct gameId from match history yet. Attempt after ${retryTime}ms. Trying again in ${retryTimeInterval}ms...`);
                setTimeout(function(){
                  attemptCheck().then(msg => attemptAccept(msg)).catch(err => attemptReject(err));
                }, retryTimeInterval);
              } else {
                log.debug(`Unable to retrieve matching gameId: ${gameId} from _getLolClientApiMatchHistory after ${retryTime}ms. ` +
                          `Bot match? Latest existing match info: ${JSON.stringify({"gameId": gameId, "startTime": startTime, "endTime": endTime, "createdTime": createdTime})}`);
                attemptReject({ code: DI_CODE.MATCH_DATA_STATUS_NO_DATA_GAME });
              }
            }).catch((err) => {
              log.debug('error on asyncOnComplete, %j', err);
              accept();
            });
          });

          // callback hell lol :S
          attemptCheck().then((gameId) => {
            // get the participant id of current player
            this._getPlayerIdAndGameDuration(gameId, this.sessionData.summonerData.displayName).then((data) => {
              // get and set gameDuration
              this.sessionData.gameDuration = data.gameDuration*1000; // convert to milli
              this.sessionData.createdTime = this.sessionData.endTime - this.sessionData.gameDuration;
              // get timeline data
              this._getGameTimeline(gameId).then((timelineData) => {
                // get all events that are linked with the participant
                this.parseTimelineDataAsEvents(timelineData, data.participantId).then((events) => {
                  this.sessionData.eventData = events;
                  accept();
                });
              });
            });
          }).catch((err) => {
            if (err.code) {
              this.sessionData.status = err.code;
              GameSessionService.updateSessionMetadata(this.sessionId, {status: err.code});
            } else {
              log.error(err);
            }
            accept();
          });
        }).catch((err) => {
          log.debug('error on super.onComplete, %j', err);
          accept();
        });
      }
    );
  }

  parseTimelineDataAsEvents(timelineData, participantId) {
    return new Promise((accept) => {
      var result = [];
      //log.debug(`TESTING: length: ${timelineData.frames.length} ${JSON.stringify(timelineData)}`);
      for(var x=0; x<timelineData.frames.length; x++) {
        //log.debug(`TEST: A ${x+1} of ${timelineData.frames.length}`);
        if(timelineData.frames[x].events.length !== 0) {
          for(var y=0; y<timelineData.frames[x].events.length; y++) {
            let event = timelineData.frames[x].events[y];
            //log.debug(`TEST: B ${y+1} of ${timelineData.frames[x].events.length} ${JSON.stringify(timelineData.frames[x].events[y])}`);
            if(event.victimId == participantId || 
              event.killerId == participantId || 
              event.assistingParticipantIds.includes(participantId)) {
              //log.debug(`TEST: B ${y+1} of ${timelineData.frames[x].events.length} ${JSON.stringify(timelineData.frames[x].events[y])}`);

              let newType = event.type;
              if(event.type === "CHAMPION_KILL") { // check if it is a kill/death/assist
                if(event.killerId === participantId) newType = "CHAMPION_KILL";
                else if(event.victimId === participantId) newType = "CHAMPION_DEATH";
                else if(event.assistingParticipantIds.includes(participantId)) newType = "CHAMPION_ASSIST";
              }

              let simpleEvent = {
                "type": newType,
                "time": (this.sessionData.createdTime + event.timestamp),
                "meta": {
                  "participantId": participantId,
                  "killerId": event.killerId,
                  "victimId": event.victimId,
                  "monsterType": event.monsterType,
                  "monsterSubType": event.monsterSubType,
                  "buildingType": event.buildingType,
                  "towerType": event.towerType
                }
              };
              //log.debug(`FRAME: ${JSON.stringify(simpleEvent)}`);
              result.push(simpleEvent);
            }
          }
        }
      }
      accept(result);
    });
  }

  /**
  * Helper functions to get data from LoL Client API
  */

  async _getLolClientApiSummonerName() {
    const [err, lolSummonerName] = await to(
      OpLeagueOfLegends.getCurrentSummonerName()
    );
    if (err) {
      log.error('Error getting LoL summoner name from client api: %s', err);
      throw err;
    }
    return lolSummonerName;
  }

  async _getPlayerIdAndGameDuration(gameId, summonerName) {
    const [err, lolMatchHistory] = await to(
      OpLeagueOfLegends.getPlayerIdAndGameDuration(gameId, summonerName)
    );
    if (err) {
      log.error('Error getting game participant id from client api: %s', err);
      throw err;
    }
    return lolMatchHistory;
  }

  async _getGameTimeline(gameId) {
    const [err, lolMatchHistory] = await to(
      OpLeagueOfLegends.getGameTimeline(gameId)
    );
    if (err) {
      log.error('Error getting game timeline from client api: %s', err);
      throw err;
    }
    return lolMatchHistory;
  }

  /**
    * async-await part of onComplete. because super can't be used in async method
    */
  async _getCurrentSummonerMatchHistory() {
    const [err, lolMatchHistory] = await to(
      OpLeagueOfLegends.getCurrentSummonerMatchHistory()
    );
    if (err) {
      log.error('Error getting LoL match history from client api: %s', err);
      throw err;
    }
    return lolMatchHistory;
  }

  /**
    * Perform LoL-specific data translations from the API result to the uniform data structure of
    * Orbital pins. Also make metadata fit replayweb's requirements here for phase 1 (or in a
    * parser, etc)
    */
  async exportData() {
    // Call parent (BaseAdapter) to export bookmarks, then process our data on top of bookmarks.
    const baseData = await super.exportData();
    const result = { ...baseData };

    result.di = await this._parseDiData();
    return result;
  }

  _parseDiData() {
    var startTime = this.sessionData.startTime;
    const result = {
      // matches,
      // player,
      // rounds,
    };

    const pins = this.sessionData.eventData.map(eventData => LeagueOfLegendsAdapter._createPinFromEvent(eventData));
    result.pins = pins.reduce((acc, pin) => {
      // normalize the pin key to seconds, ditching any decimals left over from using
      // node time (ms) vs LOL Game Integration time (s)
      const pinKey = Math.floor((pin.time - startTime) / 1000);
      // In the event that the given 'pinKey-0' exists (multiple events in the same second),
      // increment the second number until it no longer collides
      let keyCounter = 0;
      let pinId = `${pinKey}-${keyCounter}`;
      while (acc[pinId]) {
        keyCounter++;
        pinId = `${pinKey}-${keyCounter}`;
      }
      Object.assign(pin, { key: pinId });
      acc[pinId] = pin;
      return acc;
    }, {});
    //log.debug(`_parseDiData(): ${JSON.stringify(result)}`);
    return result;
  }

  static _createPinFromEvent({
    meta,
    time,
    type,
  }) {
    return new Pin({
      name: type,
      group: type,
      type: EVENT_TYPE_DI,
      // LOL pins are guaranteed to be in milliseconds
      time: time,
      data: meta,
    });
  }
}