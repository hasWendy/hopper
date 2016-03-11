import {Store} from 'flummox';
import {Map, List} from 'immutable';

export default class AdvertiserStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('advertisers');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getAdvertiserResults, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.getPinnedAdvertisers, this.loadingPinnedBegan, this.pinnedReceived);
    this.registerAsync(actionIds.setPinnedAdvertisers, this.setPinnedBegan, this.pinnedReceived);
    this.registerAsync(actionIds.getPinnedAdvertiserResults, this.loadingBegan, this.resultsReceived);

    this.state = {
      loading          : false,
      advertisers      : List(),
      pagedAdvertisers : List(),
      count            : 0,
      pinned           : List(),
      loadingPinned    : false,
      errors           : List(),
      pinnedErrors     : List()
    };
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') return;
    let newState = {
      loading : false,
      errors  : res.get('errors', List())
    };

    if (res.hasIn(['metaData', 'limit'])) {
      newState.pagedAdvertisers = res.get('data', List());
    } else {
      newState.advertisers = res.get('data', List());
    }

    if (res.hasIn(['metaData', 'advertiser_ids'])) {
      newState.pinned = List(res.getIn(['metaData', 'advertiser_ids']));
      newState.loadingPinned = false;
    }

    newState.count = res.get('count', 0);
    this.setState(newState);
  }


  loadingBegan() {
    this.setState({loading : true});
  }

  setPinnedBegan() {
    this.setState({loading : true});
  }

  pinnedReceived(res) {
    let newState = {
      loading       : false,
      loadingPinned : false,
      pinned        : List.isList(res) ? res : List(),
      pinnedErrors  : res.get('errors', List())
    };

    this.setState(newState);
  }

  loadingPinnedBegan() {
    this.setState({loadingPinned : true});
  }

  reset(val) {
    this.setState({
      loading          : val === 'page',
      advertisers      : List(),
      pagedAdvertisers : List(),
      count            : val === 'page' ? this.state.count : 0,
      pinned           : List(),
      loadingPinned    : false,
      errors           : List(),
      pinnedErrors     : List()
    });
  }
}
