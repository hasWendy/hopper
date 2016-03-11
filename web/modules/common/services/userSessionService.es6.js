const imm = require('immutable');
const SelfApi = require('lib/api/selfApi');

class Service {

  getSessionInfo(key) {
    return SelfApi.get({endpoint : 'auth/session'}).then(data => {
      return data.getIn(['result', key], imm.Map());
    });
  }
}

module.exports = new Service();
