let Api = require('fnServiceLayer/api');
let imm = require('immutable');
let ENV = require('CONFIG');

let interceptors = {};

interceptors.parseJson = function(res) {
  if (imm.Iterable.isIterable(res.body)) {
    return res;
  }

  try {
    res.body = imm.fromJS(JSON.parse(res.body));
  } catch(e) {
    console.warn('error in parsing selfApi body', e, res.body);
  }

  return res;
};


interceptors.handleBadAccess = function(res) {
  let status = res.statusCode;

  switch (status) {
    case 400:
      break;
    case 401:
      if (ENV.DEBUG) {
        return window.location.href = '/dev_login';
      }
      return window.location.href = '/auth/logout?' + Math.round(Math.random() + 1000);

    case 403:
      return window.location.href = '/partners';
    case 500:
      // if there is no error information, add it
      if (!(res.body.has('errors') || res.body.has('error'))) {
        res.body = res.body.set('errors', imm.List([
          imm.Map({
            message : 'Internal Server Error'
          })
        ]));
      }
  }

  return res;
};


interceptors.parseDataAndErrors = function(res) {
  if (res.body.has('data') && res.body.get('data')) {
    res.body = res.body.get('data');
    return res;
  }

  if (res.body.has('errors') || res.body.has('error')) {
    console.error('errors happened!', res.body.toJS());
    res.body = imm.Map({
      errors : res.body.get('errors') || imm.List([res.body.get('error')])
    });
    return res;
  }

  return res;
};


let SelfApi = new Api({
  template: '/#{endpoint}?#{params}',

  responseInterceptors: [
    interceptors.parseJson,
    interceptors.handleBadAccess,
    interceptors.parseDataAndErrors
  ]
});


module.exports = SelfApi;
