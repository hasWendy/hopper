import {Store} from 'flummox';
import imm from 'immutable';

export default class SettingsStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('settings');
    this.registerAsync(actionIds.getSettings, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.saveSettings, this.saveBegan, this.saveComplete);

    this.state = {
      loading  : false,
      saving   : false,
      saved    : false,
      settings : imm.List(),
      errors   : imm.List()
    };
  }

  loadingBegan() {
    this.setState({ loading : true });
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') return;

    this.setState({
      loading  : false,
      settings : res.first(),
      errors   : res.get('errors', imm.List())
    });
  }

  saveBegan(res) {
    this.setState({
      saving : true,
      saved  : false
    });
  }

  saveComplete(res) {
    this.setState({
      saving   : false,
      saved    : res.get('errors') ? false : true,
      settings : res
    });
  }

}
