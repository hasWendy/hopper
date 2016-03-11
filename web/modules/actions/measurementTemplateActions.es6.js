import adNetworkPreferencesService from 'services/adNetworkPreferencesService';
import {Actions} from 'flummox';
import {Map} from 'immutable';
import ENV from 'CONFIG';

export default class MeasurementTemplateActions extends Actions {

  getTemplateById(id) {
    return adNetworkPreferencesService.find(Map({
      filter: `id = ${id}`
    }));
  }

  getDefinition() {
    return adNetworkPreferencesService.define();
  }

  getMeasurementTemplates(params) {
    let baseParams = Map({
      filter : `preference='click' and ad_network_id=${ENV.AD_NETWORK_ID}`
    });
    return adNetworkPreferencesService.find(baseParams.merge(params));
  }

  saveTemplate(tpl) {
    // delete uneditable keys before save
    return adNetworkPreferencesService.save(tpl.delete('created').delete('modified'));
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  deleteTemplate(tpl) {
    return adNetworkPreferencesService.remove(tpl);
  }

}
