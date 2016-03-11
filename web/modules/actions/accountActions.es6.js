import {Actions} from 'flummox';
import accountService from 'services/accountService';
import userSessionService from 'services/userSessionService';
import imm from 'immutable';

export default class AccountActions extends Actions {

  getAccounts(params) {
    return accountService.find(params);
  }

  getAccountById(id) {
    return accountService.find(imm.Map({
      filter: `id = ${id}`
    }));
  }

  getMyAccount() {
    return userSessionService.getSessionInfo('user');
  }

  getDefinition() {
    return accountService.define();
  }

  validatePassword(acct) {
    return accountService.checkPassword(acct.delete('created').delete('modified').delete('name'));
  }

  saveAccount(acct) {
    // delete uneditable keys before save
    return accountService.save(acct.delete('created').delete('modified').delete('name'));
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  deleteAccount(acct) {
    return accountService.remove(String(acct));
  }
}
