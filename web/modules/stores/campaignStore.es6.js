import {Store} from 'flummox';
import {Map, List} from 'immutable';


export default class PbStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('campaigns');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getSites, this.sitesLoadingBegan, this.sitesReceived);
    this.registerAsync(actionIds.getEvents, this.eventsLoadingBegan, this.eventsReceived);

    this.state = {
      loadingSites   : false,
      loadingEvents  : false,
      sites          : List(),
      events         : List()
    };
  }

  sitesReceived(res) {

    if (typeof res === 'undefined') {
      return this.setState({loadingSites: false});
    }

    this.setState({
      loadingSites : false,
      sites        : res
    });
  }

  eventsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingEvents: false});
    }

    this.setState({
      loadingEvents : false,
      events        : res
    });
  }

  sitesLoadingBegan() {
    this.setState({loadingSites : true});
  }

  eventsLoadingBegan() {
    this.setState({loadingEvents: true});
  }

  reset() {
    this.setState({
      events : List()
    });
  }
}
