import {Store} from 'flummox';
import {Map, List} from 'immutable';

export default class GeoStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('geo');
    this.registerAsync(actionIds.getCountries, this.loadingBegan, this.resultsReceived);

    this.state = {
      loading : false,
      countries : List(),
    };
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loading: false});
    }

    let newState = {loading : false};
    newState.countries = List(res);
    this.setState(newState);
  }


  loadingBegan() {
    this.setState({loading : true});
  }

}
