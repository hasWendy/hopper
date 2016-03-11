const {Actions} = require('flummox');
const campaignService = require('services/campaignService');


export default class CampaignActions extends Actions {

  getEvents(params) {
    return campaignService.getEvents(params);
  }

  getSites(params) {
    return campaignService.getSiteChoices(params);
  }

  reset() {
    return true;
  }
}
