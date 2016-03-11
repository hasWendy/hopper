const geoService = require('services/geoService');
const {Actions} = require('flummox');
const imm = require('immutable');


export default class GeoActions extends Actions {

  getCountries() {
    try {
      return geoService.getCountries();
    } catch (e) {
      console.error('error in action', e);
    }
  }

}
