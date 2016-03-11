import {Store} from 'flummox';
import {List} from 'immutable';

export default class RankingsStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('rankings');
    this.registerAsync(actionIds.getRankingsResults, this.loadingBegan, this.resultsReceived);

    this.state = {
      loading  : false,
      overall  : List(),
      platform : List(),
      region   : List(),
      errors   : List()
    };
  }

  loadingBegan() {
    this.setState({loading : true});
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') {return;}
    let newState = {
      loading : false,
      errors  : res.get('errors', List())
    };

    let processOrdinal = function(list) {
      let result = list.map( val => {
        // check for number
        if (typeof val === 'number') {
          if (val === 0) {
            return '';
          }

          // assign ordinal number to the plain number
          let ordinal = ['th', 'st', 'nd', 'rd'];
          let v = val % 100;
          return val + (ordinal[(v - 20) % 10] || ordinal[v] || ordinal[0]);
        }

        // pass through for string
        return val;
      });

      return result;
    };

    newState.overall = List([
      processOrdinal(res.get('overall'))
    ]);

    newState.platform = List([
      processOrdinal(res.get('ios', List()).set('platform', 'iOS')),
      processOrdinal(res.get('android', List()).set('platform', 'Android'))
    ]);

    newState.region = List([
      processOrdinal(res.get('africa', List()).set('region', 'Africa')),
      processOrdinal(res.get('asia_pacific', List()).set('region', 'Asia Pacific')),
      processOrdinal(res.get('caribbean', List()).set('region', 'Caribbean')),
      processOrdinal(res.get('central_america', List()).set('region', 'Central America')),
      processOrdinal(res.get('central_asia', List()).set('region', 'Central Asia')),
      processOrdinal(res.get('eastern_europe', List()).set('region', 'Eastern Europe')),
      processOrdinal(res.get('middle_east', List()).set('region', 'Middle East')),
      processOrdinal(res.get('north_america', List()).set('region', 'North America')),
      processOrdinal(res.get('north_europe', List()).set('region', 'North Europe')),
      processOrdinal(res.get('south_america', List()).set('region', 'South America')),
      processOrdinal(res.get('south_asia', List()).set('region', 'South Asia')),
      processOrdinal(res.get('western_asia', List()).set('region', 'Western Asia')),
      processOrdinal(res.get('western_europe', List()).set('region', 'Western Europe'))
    ]);

    newState.count = res.get('count', 0);

    this.setState(newState);
  }
}
