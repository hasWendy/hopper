var Q = require('q');
var moment = require('moment');
var _ = require('lodash');
var cacheHelpers = require('./../lib/cacheHelpers');

var partnersToRemove = [];

// we can refresh the API cache by making the publisher/advertisers/find call
// for each partner, we have to create a new session_token and map it to that partner's context
var makeApiCall = function(req, partnerId) {
  return req.api.post('session/authenticate/api_key', {api_keys : req.api.api_key}, true)
    .then(function(data) {
      req.api.session_token = data.data;
      return req.api.get('session/context/set_current', { id : partnerId, type : 'ad_network' });
    })
    .then(function() {
      return req.api.post('publisher/advertisers/find', {fields : 'id,name', limit: 0});
    })
    .catch(function() {
      console.log('authenticate/api_key or session/context/set_current errors!', arguments);
    });
};

var refreshCacheForPartner = function(req, partnerId) {
  var deferred = Q.defer();

  global.memcached.get(cacheHelpers.getPartnerCacheKey(partnerId), function(err, data) {
    if (!data) {
      // cache key expired - remove from partner_metadata_ list
      partnersToRemove.push(partnerId);
      return deferred.reject('Cache Key wasn\'t found for ' + partnerId);
    }

    var now = new Date();
    if (moment(data.apiCacheExpiration).valueOf() > now.valueOf()) {
      return deferred.reject('Cache didn\'t need reloading for ' + partnerId);
    }

    // need to refresh the API cache by making an API call scoped to this partnerId
    // afterwards, if success, extend data.apiCacheExpiration
    makeApiCall(req, partnerId).then(function() {
      global.memcached.set(
        cacheHelpers.getPartnerCacheKey(partnerId),
        {
          'apiCacheExpiration' : cacheHelpers.determineNewExpirationTimestamp(),
          'lastLoggedIn'       : data.lastLoggedIn
        },
        // don't extend TTL - the only thing that extends TTL is logging in
        moment(data.lastLoggedIn).add('seconds', cacheHelpers.PARTNER_CACHE_TTL).diff(moment(), 'seconds'),
        function() {
          deferred.resolve();
        }
      );
    }, deferred.resolve);
  });

return deferred.promise;
};


module.exports = function(router) {

  // cron job can hit this as frequently or infrequently as it likes
  router.get('/cacheRefresh', function(req, res) {
    global.memcached.get(cacheHelpers.getPartnerCacheKey(), function(err, data) {
      if (err) {
        return res.status(500).json({});
      }

      if (data) {
        partnersToRemove = [];
        var refreshPromises = _.map(data.split('_'), function(partnerId) {
          return refreshCacheForPartner(req, partnerId);
        });

        // the following needs to run asynchronously
        Q.allSettled(refreshPromises).then(function() {
          if (!_.isEmpty(partnersToRemove)) {
            var activePartners = _.difference(data.split('_'), partnersToRemove).join('_');
            global.memcached.set(
              cacheHelpers.getPartnerCacheKey(),
              activePartners,
              cacheHelpers.MAX_MEMCACHE_TTL,
              function() {}
            );
          }
        });
      }

      return res.status(200).json({});
    });
  });


  if (global.DEVELOPMENT) {

    router.get('/cacheDump/:partnerId?', function(req, res) {
      var key = 'partner_metadata_' + (req.params.partnerId || '');
      global.memcached.get(key, function(err, data) {
        res.json(data || err);
      });
    });

  }

};
