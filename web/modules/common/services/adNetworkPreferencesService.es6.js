const imm = require('immutable');
const MatApi = require('lib/api/matApi');

const CrudService = require('lib/crudService');


class Service extends CrudService {

  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id'                     : 'equal',
      'mobile_app_type'        : 'equal',
      'code'                   : 'like',
      'status'                 : 'equal',
      'display'                : 'like',
      'description'            : 'like',
      'options'                : 'like',
      'ad_network_postback_id' : 'equal'
    });



    this.baseEndpoint = 'publisher/ad_networks/preferences';
  }
}

module.exports = new Service();
