const imm = require('immutable');
const SelfApi = require('lib/api/selfApi');

class Service {

  find(params) {
    if (typeof params === 'undefined') {
      params = imm.Map();
    }
    return SelfApi.get({
      endpoint: 'integration/rankings'
    }, params.toJS());
  }
}

module.exports = new Service();
