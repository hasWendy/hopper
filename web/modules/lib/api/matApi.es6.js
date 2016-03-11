/**
 * Configures and instantiates an API object for communication with the mobileapptracking api.
 *
 * This sets up several interceptors to handle parsing json, converting the result into an immutable structure
 * and restructing the result into a more consumable form.
 *
 * TODO:
 * Needs to have the flux store brought in so that we can appropriately send out request failure actions
 * Additionally, we'll need to bring in the logger
 */


let Api = require('fnServiceLayer/api');
let ENV = require('CONFIG');
let imm = require('immutable');

let interceptors = {};

interceptors.parseJson = function(res) {
  if (imm.Iterable.isIterable(res.body)) {
    return res;
  }

  try {
    res.body = imm.fromJS(JSON.parse(res.body));
  } catch(e) {
    console.warn('error in parsing matApi body', e, res.body);
  }

  return res;
};


interceptors.handleBadAccess = function(res, req) {
  let status = res.body ? res.body.get('status_code') : 500;

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


interceptors.attachSessionToken = function(conf, params, postBody) {
  params.session_token = ENV.SESSION_TOKEN;
  if (postBody) {
    postBody.session_token = ENV.SESSION_TOKEN;
  }
};


// Leaving MatApi on the window for now for debugging purposes.
// TODO: Remove this from the window.
module.exports = window.matApi = new Api({
  template: ENV.BASE_ENDPOINT + '#{endpoint}.json?#{params}',

  requestInterceptors: [
    interceptors.attachSessionToken
  ],

  responseInterceptors: [
    interceptors.parseJson,
    interceptors.handleBadAccess,
    interceptors.parseDataAndErrors
  ]
});
