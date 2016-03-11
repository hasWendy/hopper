const connectToStores = require('flummox/connect');

export default function connect(...args) {
  return function(target) {
    return connectToStores(target, ...args);
  }
}
