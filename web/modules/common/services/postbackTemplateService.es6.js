
const imm = require('immutable');
const MatApi = require('lib/api/matApi');

const CrudService = require('lib/crudService');


class Service extends CrudService {

  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id'                        : 'equal',
      'name'                      : 'like',
      'description'               : 'like',
      'os_type'                   : 'equal',
      'event_type'                : 'equal',
      'all_sites'                 : 'equal',
      'all_publishers'            : 'equal',
      'url'                       : 'like',
      'status'                    : 'equal',
      'http_method'               : 'equal',
      'result_should_contain'     : 'like',
      'result_should_not_contain' : 'like'
    });



    this.baseEndpoint = 'publisher/ad_networks/postbacks';
  }
}

module.exports = new Service();
