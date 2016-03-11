const {Actions} = require('flummox');
const imm = require('immutable');


export default class NavActions extends Actions {

  pathChanged(newPath) {
    return newPath;
  }
}
