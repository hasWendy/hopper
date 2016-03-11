import {Store} from 'flummox';
import {Map, List} from 'immutable';

export default class AttributionStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('attributions');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getAttributions, this.loadingBegan, this.resultsReceived)

    this.state = {
      loading           : false,
      pagedAttributions : List(),
      count             : 0,
      errors            : List()
    };
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') return;

    this.setState({
      loading           : false,
      pagedAttributions : res.getIn(['result', 'data'], List()),
      count             : res.getIn(['result', 'count']),
      errors            : res.get('errors', List())
    });
  }

  loadingBegan() {
    this.setState({ loading : true });
  }

  reset(val) {
    this.setState({
      loading           : val === 'page',
      pagedAttributions : List(),
      errors            : List(),
      count             : val === 'page' ? this.state.count : 0
    });
  }
}
