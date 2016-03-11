const imm = require('immutable');
const MatApi = require('lib/api/matApi');
const CrudService = require('lib/crudService');

class AccountService extends CrudService {

  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id'         : 'equal',
      'name'       : 'like',
      'email'      : 'like',
      'first_name' : 'like',
      'last_name'  : 'like',
      'title'      : 'like',
      'phone'      : 'like',
      'cell_phone' : 'like'
    });

    this.baseEndpoint = 'account/users';
  }

  checkPassword(params){
    let promise = MatApi.get({'endpoint': 'account/users/password/check_strength'}, params.toJS());
    return promise.then(data => {
      return imm.fromJS(data);
    });
  }
}

module.exports = new AccountService();
