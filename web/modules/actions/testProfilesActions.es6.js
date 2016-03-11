import testProfilesService from 'services/testProfilesService';
import {Actions} from 'flummox';
import {Map} from 'immutable';

export default class TestProfilesActions extends Actions {

  getTestProfiles(params) {
    return testProfilesService.find(params);
  }

  getTestProfileById(id) {
    return testProfilesService.find(Map({
      filter: `id = ${id}`
    }));
  }

  saveTestProfile(profile) {
    // delete uneditable keys before save
    return testProfilesService.save(profile.delete('created').delete('modified'));
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  deleteTestProfile(profile) {
    return testProfilesService.remove(profile);
  }

}
