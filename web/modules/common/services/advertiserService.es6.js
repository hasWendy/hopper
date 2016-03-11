let SelfApi = require('lib/api/selfApi');
let imm = require('immutable');

class Service {
  read(params) {
    if (typeof params === 'undefined') {
      params = imm.Map();
    }
    params = params.set('includeCount', true);
    let promise = SelfApi.get({'endpoint': 'advertisers'}, params.toJS());

    return promise.then(data => {
      return data.get('result').set('metaData', params);
    });
  }
}

module.exports = new Service();
