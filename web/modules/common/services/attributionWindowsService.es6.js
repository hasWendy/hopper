const imm = require('immutable');
const SelfApi = require('lib/api/selfApi');

class Service {

  find(params) {
    if (typeof params === 'undefined') {
      params = imm.Map({includeCount: true});
    }
    return SelfApi.get({
      endpoint : 'advertisers/attributionWindows'
    }, params.toJS());
  }
}

module.exports = new Service();
