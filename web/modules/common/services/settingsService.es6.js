const imm = require('immutable');
const SelfApi = require('lib/api/selfApi');
const CrudService = require('lib/crudService');

class SettingsService {
  read() {
    let promise = SelfApi.get({ 'endpoint'  : 'integration' });

    return promise.then(data => {
      return data.get('result');
    });
  }

  save(settings) {
    let promise = SelfApi.post({ 'endpoint' : 'integration' }, settings);

    return promise;
  }
}

module.exports = new SettingsService();
