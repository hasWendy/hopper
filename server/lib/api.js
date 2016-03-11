var request = require('request');
var Q = require('q');
var _ = require('lodash');
var winston = require('winston');
var querystring = require("querystring");


/**
 * An object for encapsulating logic needed for interacting with the management api.
 * @param options
 * @constructor
 */
function ApiRequest(options) {
  this.api_key = options.api_key;
  this.session_token = options.session_token;
  this.url = options.base_endpoint + '/' + options.version + '/';
  this.is_internal = (typeof options.is_internal != 'undefined') ? options.is_internal : false;
  this.requestLog = [];
}


/**
 * Generates a callback for use with the request module.
 *
 * @private
 * @param startTime
 * @param deferred
 * @returns {Function}
 */
ApiRequest.prototype.requestProcessor = function(startTime, deferred, url, params, use_api_token) {

  if (use_api_token && !params.api_key) {
    params.api_key = this.api_key;
  } else if (!use_api_token) {
    params.session_token = this.session_token;
  }

  return function(err, response, body) {

    //console.log('request completed', url, body);
    var endTime = new Date();
    var logData = {
          elapsedTime: (endTime - startTime) + "ms",
          timestamp: startTime
        };


    logData.request = this.cleanseRequest(url, params, body);
    this.requestLog.push(logData);

    if (err) {
      //TODO: Handle hard errors (not status codes) do some stuff here;
      deferred.resolve(response, body);
      return;
    }

    // TODO: handle bad request and bad auth errors. 400 && 403 errors
    deferred.resolve(JSON.parse(body || '{}'));
  }.bind(this);
};

/**
 * Makes a post request to the specified api target. Includes the params object as the request body.
 *
 * @param endpoint
 * @param params
 * @param use_api_token
 * @returns {promise|Promise.promise|exports.promise|Q.promise}
 */
ApiRequest.prototype.post = function(endpoint, params, use_api_token) {
  if (!params) {
    params = {};
  }
  if (use_api_token) {
    params.api_key = this.api_key;
  } else {
    params.session_token = this.session_token;
  }
  var url = this.url + endpoint + '.json';
  var dfd = Q.defer();
  var start = new Date();
  winston.info(url, params);
  request.post({url: url, rejectUnauthorized : false, form : params}, this.requestProcessor(start, dfd, url, params, use_api_token));

  return dfd.promise;
};

/**
 * Makes a post request to the specified api target. Includes the params object as a serialized k/v querystring.
 * @param endpoint
 * @param params
 * @param use_api_token
 * @returns {promise|Promise.promise|exports.promise|Q.promise}
 */
ApiRequest.prototype.get = function(endpoint, params, use_api_token) {
  if (use_api_token && !params.api_key) {
    params.api_key = this.api_key;
  } else if (!use_api_token) {
    params.session_token = this.session_token;
  }

  var url = this.url + endpoint + '.json';
  var dfd = Q.defer();
  var start = new Date();
  winston.info(url, params);
  request.get({url: url, rejectUnauthorized : false, qs : params}, this.requestProcessor(start, dfd, url, params, use_api_token));
  return dfd.promise;
};


/**
* Removes sensitive data before logging and returns a pastable URL for debugging
* @param params
* @returns {Object}
*/
ApiRequest.prototype.cleanseRequest = function(url, params, body){
  var bodyJSON = {};

  try {
    bodyJSON = JSON.parse(body);
  }
  catch(e){
    console.log("Malformed body", url, body);
  }

  if (!this.is_internal){
    params = _.omit(params,'api_key');
    params = _.omit(params,'api_keys');
    params = _.omit(params,'auth_key');

    if (_.isObject(bodyJSON)){
        bodyJSON = _.omit(bodyJSON,'api_key');
        bodyJSON = _.omit(bodyJSON,'api_keys');
        bodyJSON = _.omit(bodyJSON,'auth_key');
    }
  }
  else{
    params = _.omit(params,'password');
    params = _.omit(params,'auth_key');

    if (_.isObject(bodyJSON)){
        bodyJSON = _.omit(bodyJSON,'password');
        bodyJSON = _.omit(bodyJSON,'auth_key');
    }
  }

  return {
    effectiveUrl: url + '?' + querystring.stringify(params),
    postBody: bodyJSON
  }

}


module.exports = function(base_endpoint, version, api_key) {
  return function(req, res, next) {
    var options = {
      api_key       : api_key,
      base_endpoint : base_endpoint,
      version       : version,
      session_token : req.session.session_token,
      is_internal   : req.is_internal
    };

    req.api = new ApiRequest(options);

    next();
  }
};
