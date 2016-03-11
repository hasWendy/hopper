import {Actions} from 'flummox';
import pbService from 'services/postbackService';
import templateService from 'services/postbackTemplateService';
import pbPreferenceService from 'services/adNetworkPreferencesService';
import campaignService from 'services/campaignService';
import imm from 'immutable';

export default class PostbackActions extends Actions {

  getPostbacks(params) {
    return pbService.find(params);
  }


  getTemplates(params) {
    return templateService.find(params);
  }

  getCompletePostback(params) {
    return pbService.find(params).then((postbackData) => {
      if (postbackData.has('errors')) {
        return postbackData;
      }
      let postback = postbackData.get('data').first();
      let promises = [];
      promises.push(templateService.find(imm.Map({
        filter: `id = ${postback.get('ad_network_postback_id')}`
      })));
      promises.push(campaignService.getSiteChoices(imm.Map({
        filter: `advertiser_id = ${postback.get('advertiser_id')}`
      })));
      promises.push(campaignService.getEvents(imm.Map({
        filter: `id = ${postback.getIn(['site_event', 'id'])}`
      })));

      return Promise.all(promises).then((results) => {
        let templates = results[0].get('data');
        let sites = results[1];

        let template = templates.find((item) => {
          return postback.get('ad_network_postback_id') === item.get('id');
        });

        let site = sites.find((item) => {
          return postback.getIn(['site', 'id']) === item.get('id');
        });

        return postback
          .set('template', template)
          .set('site', site)
          .set('site_event', results[2].first());
      });
    });
  }

  getTemplatePreferences(params) {
    return pbPreferenceService.find(params);
  }

  save(params) {
    return pbService.save(params);
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  deletePostback(postbackId) {
    return pbService.remove(String(postbackId));
  }

}
