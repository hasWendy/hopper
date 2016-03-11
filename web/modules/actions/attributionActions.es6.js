const {Actions} = require('flummox');
const attrService = require('services/attributionWindowsService');

export default class AttributionActions extends Actions {

  getAttributions(params) {
    return attrService.find(params);
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

}
