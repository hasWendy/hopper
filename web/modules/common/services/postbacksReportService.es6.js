const imm = require('immutable');
const MatApi = require('lib/api/matApi');

const CrudService = require('lib/crudService');

class Service extends CrudService {

  constructor() {
    super(MatApi);

    this.baseEndpoint = 'publisher/stats/postbacks';
  }
}

module.exports = new Service();