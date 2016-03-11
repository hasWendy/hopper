const SelfApi = require('lib/api/selfApi');
const imm = require('immutable');

class RankingService {
  read() {
    let promise = SelfApi.get({'endpoint': 'integration/rankings'});

    return promise.then(data => {
      return data.get('result');
    });
  }
}

module.exports = new RankingService();
