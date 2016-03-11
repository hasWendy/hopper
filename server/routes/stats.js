var _ = require('lodash');
var Q = require('q');

module.exports = function(router) {

  router.get('/stats/find', function(req, res) {

    var handleError = function(errorMsg) {
      if (errorMsg === 'timeout') {
        return res.status(408).json({ 'timeout' : true });
      }
      res.status(200).json({ 'errors' : [{ 'message' : errorMsg }] });
    };

    var metadata = {};

    try {
      metadata = JSON.parse(req.query.metadata);
    } catch(e) {
      return handleError('Could not parse query metadata');
    }

    var makeApiCall = function(endpoint, params) {
      return req.api.get(endpoint, params)
        .then(function(response) {
          // in case of timeout, response is an empty object
          if (!response.status_code) {
            throw new Error('timeout');
          }

          if (!_.isEmpty(response.errors)) {
            throw new Error(_.first(response.errors).message);
          }
          return response.data;
        });
    }

    var countCall = makeApiCall('publisher/stats/count', metadata);
    var findCall = makeApiCall('publisher/stats/find', metadata);

    Q.all([findCall, countCall]).spread(
      function(findData, countData) {
        res.status(200).json({
          'data'  : findData,
          'count' : countData
        });
      },
      function(erroredResponse) {
        // when you throw new Error, it has a name and a message - we want that message
        handleError(_.isObject(erroredResponse) ? erroredResponse.message : 'API call itself actually failed');
      }
    );
  });

};
