import {Store} from 'flummox';
import imm from 'immutable';

export default class TestProfilesStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('testProfiles');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getTestProfiles, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.getTestProfileById, this.loadingBegan, this.testProfileReceived);
    this.registerAsync(actionIds.saveTestProfile, this.saveBegan, this.saveComplete);
    this.registerAsync(actionIds.deleteTestProfile, this.deleteBegan, this.deleteComplete);

    this.state = {
      loading           : false,
      testProfiles      : imm.List(),
      pagedTestProfiles : imm.List(),
      count             : 0,
      saving            : false,
      saved             : false,
      deleting          : false,
      deleted           : false,
      testProfile       : imm.Map(),
      errors            : imm.List()
    };
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') { return; }
    let newState = {
      loading : false,
      errors  : res.get('errors', imm.List())
    };

    if (res.hasIn(['metaData', 'limit'])) {
      newState.pagedTestProfiles = res.get('data', imm.List());
    } else {
      newState.testProfiles = res.get('data', imm.List());
    }

    newState.count = res.get('count', 0);
    this.setState(newState);
  }

  loadingBegan() {
    this.setState({loading : true});
  }

  testProfileReceived(res) {
    this.setState({
      loading     : false,
      testProfile : res.get('data', imm.Map()).first(),
      errors      : res.get('errors', imm.List())
    });
  }

  saveBegan() {
    let newState = {saving : true};
    this.setState(newState);
  }

  saveComplete(res) {
    let newState = {
      saving      : false,
      saved       : res.get('errors') ? false : true,
      testProfile : res,
      errors      : res.get('errors', imm.List())
    };

    this.setState(newState);
  }

  deleteBegan() {
    this.setState({deleting: true});
  }

  deleteComplete(res) {
    this.setState({
      deleting : false,
      deleted  : res.get('errors') ? false : true,
      errors   : res.get('errors', imm.Map())
    });
  }

  reset(val) {
    this.setState({
      loading           : val === 'page',
      testProfiles      : imm.List(),
      pagedTestProfiles : imm.List(),
      count             : val === 'page' ? this.state.count : 0,
      saving            : false,
      saved             : false,
      deleting          : false,
      deleted           : false,
      testProfile       : imm.Map(),
      errors            : imm.List()
    });
  }
}
