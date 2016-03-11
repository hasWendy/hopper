
const imm = require('immutable');
const MatApi = require('lib/api/matApi');



class Service {

  getCampaigns(params) {
    params = imm.Map({
      fields : 'id,name,site.id'
    }).merge(params);

    return MatApi.get({endpoint: 'publisher/campaigns/find'}, params.toJS());
  }


  getSiteChoices(params) {
    params = imm.Map({
      fields : 'id,name,mobile_app_type',
      limit  : 0
    }).merge(params);


    return MatApi.get({endpoint: 'publisher/sites/find'}, params.toJS());
  }

  getEvents(params) {

     params = imm.Map({
      fields : '*,site.name',
      limit  : 0
    }).merge(params);

    return MatApi.get({endpoint: 'publisher/sites/events/find'}, params.toJS());
  }
}

module.exports = new Service();


