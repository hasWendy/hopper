const imm = require('immutable');
const MatApi = require('lib/api/matApi');

const CrudService = require('lib/crudService');

class TestProfileService extends CrudService {

  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id'          : 'equal',
      'name'        : 'like',
      'device_id'   : 'like',
      'google_aid'  : 'like',
      'device_ip'   : 'like',
      'os_id'       : 'like',
      'ios_ifv'     : 'like',
      'ios_ifa'     : 'like',
      'mat_id'      : 'like',
      'user_id'     : 'like',
      'windows_aid' : 'like',
      'status'      : 'like'
    });

    this.baseEndpoint = 'account/test_profiles';
  }
}

module.exports = new TestProfileService();


