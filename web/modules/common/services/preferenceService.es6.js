const matApi = require('lib/api/matApi');
const imm = require('immutable');
const lscache = require('lscache');

var hasLocalStorage = function() {
  if (!window.localStorage) {
    alert('localStorage is not supported by your browser.');
    return false;
  }
  return true;
};

class Service {

  read(key) {
    if(!hasLocalStorage()) {
      return Promise.resolve();
    }

    if (lscache.get(key)) {
      return Promise.resolve(imm.fromJS(lscache.get(key)));
    }

    let promise = matApi.get({endpoint : 'account/users/data/find'}, {});

    return promise.then(data => {
      data.forEach(item => {
        try {
          if (item) {
            lscache.set(item.get('data_key'), imm.fromJS(JSON.parse(item.get('data_value'))));
          }
        } catch (e) {
          console.log('error reading preference', e);
        }
      });
      if (key) {
        return imm.fromJS(lscache.get(key) || []);
      }
      return lscache;
    });
  }

  save(key, value) {
    if(!hasLocalStorage()) {
      return;
    }

    let currentValue = imm.fromJS(lscache.get(key));
    if (imm.is(currentValue, value)) {
      return currentValue;
    }

    lscache.set(key, value);

    matApi.get({endpoint : 'account/users/data/save'},
      {
        data_key: key,

        // primative values do not have a toJS method in immutablejs.  This catches that case and just stores the
        // primative.
        data_value : value && value.toJS ? JSON.stringify(value.toJS()) : JSON.stringify(value)
      }
    );

    return value;
  }
}

module.exports = new Service();
