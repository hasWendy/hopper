var moment = require('moment');
var _ = require('lodash');

// how long to keep the partner in the cache since last log in
var PARTNER_CACHE_TTL = 3 * 24 * 60 * 60; // 3 days
// how long the API caches actives advertisers on their end
var API_STATS_CACHE_DURATION = 24 * 60 * 60; // 1 day
var MAX_MEMCACHE_TTL = 2592000;
var PARTNERS_METADATA_KEY = 'partner_metadata_';

var emptyFunction = function() {};


var getPartnerCacheKey = function(partnerId) {
  return PARTNERS_METADATA_KEY + partnerId;
};


var determineNewExpirationTimestamp = function() {
  return moment().add(API_STATS_CACHE_DURATION, 'seconds');
};


var userLoggedIn = function(partnerId) {
  var cacheKey = getPartnerCacheKey(partnerId);
  global.memcached.get(cacheKey, function(err, data) {

    // either use data or create a new expiration date
    var cachedData = data || { 'apiCacheExpiration' : determineNewExpirationTimestamp() };
    // update this lastLoggedIn every time
    cachedData.lastLoggedIn = moment();

    // obligatory callback function, but we don't need to do anything
    global.memcached.set(
      cacheKey,
      cachedData,
      PARTNER_CACHE_TTL,
      emptyFunction
    );

    // this could be made safer by using gets and cas > get and set
    // this can also totally be done asynchronously
    global.memcached.get(getPartnerCacheKey(), function(err, data) {
      if (!data) {
        global.memcached.set(getPartnerCacheKey(), partnerId.toString(), MAX_MEMCACHE_TTL, emptyFunction);
        return;
      }

      // avoid duplicates
      if (!_.contains(data.toString().split('_'), partnerId.toString())) {
        // this seems like it could produce some race conditions if two separate servers
        // are trying to set simultaneously
        global.memcached.set(getPartnerCacheKey(), data + '_' + partnerId, MAX_MEMCACHE_TTL, emptyFunction);
      }

    });

  });
};


module.exports = {
  'PARTNER_CACHE_TTL'               : PARTNER_CACHE_TTL,
  'MAX_MEMCACHE_TTL'                : MAX_MEMCACHE_TTL,
  'getPartnerCacheKey'              : getPartnerCacheKey,
  'determineNewExpirationTimestamp' : determineNewExpirationTimestamp,
  'userLoggedIn'                    : userLoggedIn
};