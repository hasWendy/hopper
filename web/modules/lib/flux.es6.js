let {Flux} = require('flummox');

class Application extends Flux {

  constructor() {
    super();

    // this.createActions('advertisers', require('actions/advertiserActions'));
    // this.createStore('advertisers', require('stores/advertiserStore'), this);
  }
}

export default new Application();
