import { log } from '../../core/Logger.js';
import to from 'await-to-js';
import LeagueClientAPI from '../LeagueOfLegends/LeagueClientAPI.js';

const LCU_API_CURRENT_SUMMONER = '/lol-summoner/v1/current-summoner';
const LCU_GET_SUMMONER_BY_NAME = '/lol-summoner/v1/summoners';
const LCU_GET_SUMMONER_MATCH_HISTORY = '/lol-match-history/v1/delta';
const LCU_GET_GAME_DATA = '/lol-match-history/v1/games';  // takes path /gameId
const LCU_GET_GAME_TIMELINE = '/lol-match-history/v1/game-timelines'; // takes path /gameId

/*
 * OpLeagueOfLegends
 * Adapter class that interfaces with the LCU api
 */
export default class OpLeagueOfLegends {
  /**
    * Get a game's timeline by gameId
    * gameId: number, summoner id of user
    * Returns Promise to return match data
    * NOTE: in retrieved data, match_start_ts is actually match 'creation time' and not match start
    * Also, 'match_end_ts' is a function of 'match_start_ts' + duration, and so is not valid data
    */
  static getGameTimeline(gameId) {
    return new Promise(async (accept, reject) => {
      if (!gameId) {
        log.error(`Expecting gameId ${gameId}`);
        reject({ message: 'Invalid arguments', code: 400 });
      }
      
      log.debug(`***** Getting Game Timeline Data from gameId: ${gameId}`);
      const api = new LeagueClientAPI();
      const [err, data] = await to(api.doGetEndpoint(`${LCU_GET_GAME_TIMELINE}/${gameId}`));
      if (err) {
        log.debug(`Failed to get game timeline data from: ${gameId}`, err);
        reject(err);
      }
      //log.debug(`***** Game Timeline Data from gameId: ${gameId}`, JSON.stringify(data));
      accept(data);
    });
  }

  static getPlayerIdAndGameDuration(gameId, summonerName) {
    return new Promise(async (accept, reject) => {
      const [err, data] = await to(this.getGameData(gameId));
      if (err || !data) {
        log.debug('Failed to get game data: %s', err);
        reject(err);
      }

      var result = {};
      for(var i=0; i<10; i++) {
        if(data.participantIdentities[i].player.summonerName == summonerName) {
          log.debug('Found a pair of participantIdentities matching, id is %s', data.participantIdentities[i].participantId);
          result.participantId = data.participantIdentities[i].participantId;
        }
      }

      if(data.gameDuration) {
        result.gameDuration = data.gameDuration;
      }

      if (!result) {
        log.debug(`LoL client api data does not contain a matching summoner name?`);
        reject();
      }

      accept(result);
    });
  }

  static getGameData(gameId) {
    return new Promise(async (accept, reject) => {
      if (!gameId) {
        log.error(`Expecting gameId ${gameId}`);
        reject({ message: 'Invalid arguments', code: 400 });
      }
      
      log.debug(`***** Getting Game Data from gameId: ${gameId}`);
      const api = new LeagueClientAPI();
      const [err, data] = await to(api.doGetEndpoint(`${LCU_GET_GAME_DATA}/${gameId}`));
      if (err) {
        log.debug(`Failed to get game data from: ${gameId}`, err);
        reject(err);
      }
      //log.debug(`***** Game Data from gameId: ${gameId}`, JSON.stringify(data));
      accept(data);
    });
  }

  /**
    * Singular form to retrieve summoner info for ONE summonerName
    * summonerName: string, lol summonerNames
    * region: string, region of the summonerName in question
    * Returns Promise to return summoner for summonerName in question
    * eg:
    * {
    *   "accountId": "975dXTCvu8VAwI1cQmxM-9sxqORL2Lmhx48ktPt3NQ",
    *   "summonerId": "CTt4C9Tv1-2R4BtJBbBclCOG057xZzQHaZZOF1ns0w",
    *   "summonerName": "hacky",
    *   "summonerProfileIconId": 533,
    *   "summonerIconUrl": "//ddragon.leagueoflegends.com/cdn/8.24.1/img/profileicon/533.png"
    * }
    */
  static getSummonerBySummonerName(summonerName, region) {
    return new Promise(async (accept, reject) => {
      if (!summonerName || !region) {
        log.error(`Expecting summonerName ${summonerName} and region ${region}`);
        reject({ message: 'Invalid arguments', code: 400 });
      }

      log.debug(`***** Getting Account Data for Summoner: ${summonerName}`);
      const api = new LeagueClientAPI();
      const [err, data] = await to(api.doGetEndpoint(LCU_GET_SUMMONER_BY_NAME, {"name": summonerName}));
      if (err) {
        log.debug(`Failed to get summoner: ${summonerName}`, err);
        reject(err);
      }
      //log.debug(`***** Account Data for Summoner: ${summonerName}`, JSON.stringify(data));
      accept(data);
    });
  }

  // Get the current logged in LoL user's summoner name
  static getCurrentSummonerName() {
    return new Promise(async (accept, reject) => {
      const [err, data] = await to(this.getCurrentSummoner());
      if (err) {
        log.debug('Failed to get current summoner name: %s', err);
        reject(err);
      }
      // data.displayName is summonername with caps and spaces
      // data.internalname is summonername lowercase no space
      if (data && data.displayName) {
        log.debug('current summoner name is %s', data.displayName);
        accept(data.displayName);
      }
      log.debug('LoL client api data does not contain summoner name');
      reject();
    });
  }

  static getCurrentSummoner() {
    return new Promise(async (accept, reject) => {
      log.debug('***** Getting Data for Current Summoner');
      const api = new LeagueClientAPI();
      const [err, data] = await to(api.doGetEndpoint(LCU_API_CURRENT_SUMMONER));
      if (err) {
        log.debug('Failed to get current summoner: %s', err);
        reject(err);
      }
      log.debug('***** Data for Current Summoner: %j', data);
      accept(data);
    });
  }

  static getCurrentSummonerMatchHistory() {
    return new Promise(async (accept, reject) => {
      log.debug(`***** Getting Match History Data`);
      const api = new LeagueClientAPI();
      const [err, data] = await to(api.doGetEndpoint(LCU_GET_SUMMONER_MATCH_HISTORY));
      if (err) {
        log.debug(`Failed to get match history for summoner`, err);
        reject(err);
      }
      //log.debug(`***** Match History Data for Summoner`, JSON.stringify(data));
      accept(data);
    });
  }
}
