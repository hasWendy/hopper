const imm = require('immutable');
const MatApi = require('lib/api/matApi');

class Service {
  getCountries() {
    return MatApi.get({endpoint: 'countries/choices'}, imm.Map({}));
  }
}

module.exports = new Service();
