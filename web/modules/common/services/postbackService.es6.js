const imm = require('immutable');
const MatApi = require('lib/api/matApi');

const CrudService = require('lib/crudService');


class Service extends CrudService {

  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id'                        : 'equal',
      'name'                      : 'like',
      'site.id'                   : 'like',
      'site.name'                 : 'like',
      'site_event.id'             : 'like',
      'site_event.name'           : 'like',
      'advertiser.name'           : 'like',
      'code'                      : false,
      'created'                   : false,
      'advertiser_id'             : false,
      'comment'                   : false,
      'ad_network_postback_id'    : false,
      'ad_network_preferences'    : false,
      'http_method'               : false,
      'http_post_data_type'       : false,
      'http_timeout'              : false,
      'delay_request_seconds'     : false,
      'result_should_contain'     : false,
      'result_should_not_contain' : false,
    });



    this.baseEndpoint = 'publisher/event_notifications';
  }
}

module.exports = new Service();
