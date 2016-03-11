import {Store} from 'flummox';
import {Map, List} from 'immutable';


export default class PbStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('postbacks');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getPostbacks, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.save, this.savingBegan, this.saveComplete);
    this.registerAsync(actionIds.getCompletePostback, this.loadingBegan, this.postbackReceived);
    this.registerAsync(actionIds.deletePostback, this.deleteBegan, this.deleteComplete);

    this.state = {
      loading          : false,
      pagedPostbacks   : List(),
      count            : 0,
      saving           : false,
      saved            : false,
      postback         : Map(),
      deleting         : false,
      deleted          : false,
      errors           : List()
    };
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') return;

    let newState = {
      loading        : false,
      pagedPostbacks : res.get('data', List()),
      count          : res.get('count', 0),
      errors         : res.get('errors', List())
    };

    this.setState(newState);
  }

  postbackReceived(res) {
    if (typeof res === 'undefined') return;

    this.setState({
      loading     : false,
      postback    : res,
      errors      : res.get('errors', List())
    });
  }

  loadingBegan() {
    this.setState({loading : true});
  }

  savingBegan() {
    this.setState({saving: true});
  }

  saveComplete(savedPostback) {
    this.setState({
      saving   : false,
      saved    : savedPostback.get('errors') ? false : true,
      postback : savedPostback,
      errors   : savedPostback.get('errors', List())
    });
  }

  reset(val) {
    this.setState({
      loading          : val === 'page',
      pagedPostbacks   : List(),
      count            : val === 'page' ? this.state.count : 0,
      saving           : false,
      saved            : false,
      postback         : Map(),
      deleting         : false,
      deleted          : false,
      errors           : List()
    });
  }

  deleteBegan() {
    this.setState({deleting: true});
  }

  deleteComplete(res) {
    this.setState({
      deleting : false,
      deleted  : res.get('errors') ? false : true,
      errors   : res.get('errors', List())
    });
  }
}
