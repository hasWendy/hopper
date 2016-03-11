import {Store} from 'flummox';
import imm from 'immutable';

export default class NavStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('navigation');
    this.register(actionIds.pathChanged, this.onPathChanged);

    this.state = {
      path : imm.List()
    };
  }

  onPathChanged(newPath) {
    if(!imm.List.isList(newPath)) {
      newPath = imm.List(newPath);
    }

    // only update if different breadcrumb
    if(!imm.is(this.state.path, newPath)) {
      this.setState({ path : newPath });
    }
  }

}
