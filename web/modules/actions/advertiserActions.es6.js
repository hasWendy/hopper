const advertiserService = require('services/advertiserService');
const preferenceService = require('services/preferenceService');
const {Actions} = require('flummox');
const imm = require('immutable');


export default class AdvertiserActions extends Actions {

  getAdvertiserResults(params) {
    try {
      return advertiserService.read(params);
    } catch (e) {
      console.error('error in action', e);
    }
  }

  getPinnedAdvertisers() {
    try {
      return preferenceService.read('pinnedAdvertisers');
    } catch (e) {
      console.error('error in preferenceAction', e);
    }
  }

  setPinnedAdvertisers(list) {
    try {
      return preferenceService.save('pinnedAdvertisers', list);
    } catch(e) {
      console.error('error in set pinned action', e);
    }
  }

  getPinnedAdvertiserResults(params) {
    try {
      return preferenceService.read('pinnedAdvertisers').then((pinned) => {
        if (!imm.List.isList(pinned) || pinned.size === 0) {
          return imm.List();
        }
        params = params.set('advertiser_ids', pinned.toJS());
        return advertiserService.read(params)
      });
    } catch(e) {
      console.log('error in pinned advertisers action', e);
    }
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }
  
}
