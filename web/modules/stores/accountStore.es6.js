import {Store} from 'flummox';
import imm from 'immutable';

export default class AccountStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('account');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getAccountById, this.loadingBegan, this.accountReceived);
    this.registerAsync(actionIds.getMyAccount, this.loadingBegan, this.myAccountReceived);
    this.registerAsync(actionIds.getDefinition, this.defineBegan, this.defineReceived);
    this.registerAsync(actionIds.getAccounts, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.validatePassword, this.validateBegan, this.validateComplete);
    this.registerAsync(actionIds.saveAccount, this.saveBegan, this.saveComplete);
    this.registerAsync(actionIds.deleteAccount, this.deleteBegan, this.deleteComplete);

    this.state = {
      loading                     : false,
      accountList                 : imm.List(),
      pagedAccounts               : imm.List(),
      myAccountId                 : null,
      count                       : 0,
      validating                  : false,
      validated                   : false,
      saving                      : false,
      saved                       : false,
      deleting                    : false,
      deleted                     : false,
      errors                      : imm.List(),
      account                     : imm.Map(),
      loadingDefinition           : false,
      definition                  : imm.Map(),
      accountErrors               : imm.List()
    };
  }

  defineBegan() {
    this.setState({loadingDefinition: true});
  }

  defineReceived(res) {
    this.setState({
      loadingDefinition : false,
      definition        : res
    });
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') return;
    let newState = {
      loading       : false,
      accountErrors : res.get('errors', imm.List())
    };

    if (res.hasIn(['metaData', 'limit'])) {
      newState.pagedAccounts = res.get('data', imm.List());
    } else {
      newState.accountList = res.get('data', imm.List());
    }

    newState.count = res.get('count', 0);
    this.setState(newState);
  }

  loadingBegan() {
    this.setState({ loading : true });
  }

  accountReceived(res) {
    let account = res.get('data', imm.List()).first().set('password', true);
    this.setState({
      loading       : false,
      account       : account,
      accountErrors : res.get('errors', imm.List())
    });
  }

  myAccountReceived(res) {
    this.setState({
      loading       : false,
      myAccountId   : res.get('id')
    });
  }

  validateBegan(res) {
    this.setState({
      validating   :  true,
      validated    :  false,
      errors       :  imm.List()
    });
  }

  validateComplete(res) {
    let newState = {};

    if (res) {
      if (res === true) {
        newState = {
          validating    : false,
          validated     : true,
          errors        : imm.Map()
        };
      } else {
        newState = {
          validating    : false,
          validated     : false,
          errors        : res.get('errors')
        };
      }
    }

    this.setState(newState);
  }

  saveBegan(res) {
    if (!imm.Map.isMap(res)) {
      res = imm.fromJS(res);
    }
    let newState = {saving : true};
    if (res.has('actionArgs') && res.get('actionArgs').size) {
      let acct = res.get('actionArgs').get(0);
      let accounts = this.state.pagedAccounts;

      if (!accounts.size) { accounts = this.state.accountList; }

      if (accounts.size) {
        accounts = accounts.update(
          accounts.findIndex((item) => {
            return item.get('id') === acct.get('id');
          }),
          (item) => {
            return item.set('status', acct.get('status'));
          }
        );
        newState.pagedAccounts = accounts;
      }
    }
    this.setState(newState);
  }

  saveComplete(res) {
    this.setState({
      saving        : false,
      saved         : res.get('errors') ? false : true,
      accountErrors : res.get('errors', imm.List())
    });
  }

  deleteBegan() {
    this.setState({ deleting: true });
  }

  deleteComplete(res) {
    this.setState({
      deleting      : false,
      deleted       : res.get('errors') ? false : true,
      accountErrors : res.get('errors', imm.List())
    });
  }

  reset(val) {
    this.setState({
      loading                     : val === 'page',
      accountList                 : imm.List(),
      pagedAccounts               : imm.List(),
      count                       : val === 'page' ? this.state.count : 0,
      validating                  : false,
      validated                   : false,
      saving                      : false,
      saved                       : false,
      deleting                    : false,
      deleted                     : false,
      errors                      : imm.List(),
      account                     : imm.Map(),
      definition                  : imm.Map(),
      accountErrors               : imm.List()
    });
  }
}
