const rankingsService = require('services/rankingsService');
const {Actions} = require('flummox');
const imm = require('immutable');


export default class RankingsActions extends Actions {

  getRankingsResults() {
    try {
      return rankingsService.read();
    } catch (e) {
      console.error('error in action', e);
    }
  }
}
