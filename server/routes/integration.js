var mysql = require('../lib/mysql/connection');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment-timezone');

module.exports = function(router) {

  var parameters = [
    'status',
    'name',
    'contact_name',
    'contact_email',
    'os_type',
    'type',
    'partner_type',
    'category',
    'ad_formats',
    'signup_url',
    'thumbnail_url',
    'instructions_url',
    'description',
    'attribution_impression_view_percent',
    'attribution_window_seconds_click_fingerprint',
    'attribution_window_seconds_click_identifiers',
    'attribution_window_seconds_impression_fingerprint',
    'attribution_window_seconds_impression_identifiers',
    'attribution_window_seconds_referrer_session',
    'attribution_window_seconds_tracking_id_session',
    'reengagement_window_seconds',
    'certified_partner'
  ];

  var renamingMap = {
    'os_type'  : 'platforms',
    'type'     : 'types',
    'category' : 'pricings'
  };

  router.get('/integration', function(req, res) {

    var sql = 'select ' + parameters.join(',') + ' from ad_networks where id = ?';

    mysql.query(sql, [req.session.ad_network_id], function(err, rows) {
      if (err) {
        return res.json(err);
      }

      // renaming DB keys to more sensible keys in the app
      _.each(rows, function(row) {
        _.each(renamingMap, function(appKey, dbKey) {
          row[appKey] = row[dbKey];
          delete row[dbKey];
        });
      });

      res.json(rows);
    });
  });

  router.post('/integration', function(req, res) {

    // renaming app keys back to their respective DB keys
    _.each(renamingMap, function(appKey, dbKey) {
      req.body[dbKey] = req.body[appKey];
    });

    var postData = [];

    _.each(parameters, function(param) {
      if (!_.isUndefined(req.body[param])) {
        postData.push(' ' + param + ' = ' + mysql.escape(req.body[param]));
      }
    });

    // right now, only supporting an update - no insert as there's not currently a create interface exposed
    var sql = 'update ad_networks set ' + postData.join(',') + ' where id = ?';

    mysql.query(sql, [req.session.ad_network_id], function(err) {
      if (err) {
        return res.json({ 'error' : err});
      }
      return res.json(200, { 'success' : true });
    });
  });

  router.get('/integration/rankings', function(req, res) {

    var rankingsKeys = [
      'overall',
      'android',
      'ios',
      'north_america',
      'caribbean',
      'central_america',
      'south_america',
      'eastern_europe',
      'north_europe',
      'western_europe',
      'middle_east',
      'asia_pacific',
      'central_asia',
      'south_asia',
      'western_asia',
      'africa'
    ];

    var rankingsFilters = [
      '',
      'platform="android"',
      'platform="ios"',
      'geo_id=8',
      'geo_id=3',
      'geo_id=4',
      'geo_id=10',
      'geo_id=6',
      'geo_id=9',
      'geo_id=13',
      'geo_id=7',
      'geo_id=2',
      'geo_id=5',
      'geo_id=11',
      'geo_id=12',
      'geo_id=1'
    ];

    if (req.is_internal && req.query.clear) {
      _.each(rankingsFilters, function(filter) {
        global.memcached.del('/advertiser/ad_networks/stats/find.jsonp?filter=' + (filter || 'overall'), function(){});
      });
      res.json({});
      return;
    }


    var getRanking = function(filter) {

      var cacheKey = '/advertiser/ad_networks/stats/find.jsonp?filter=' + (filter || 'overall');

      // We want to cache results until the next 6am EST
      var determineCacheDuration = function() {
        var now = moment().tz('America/New_York');
        var nextSixAm = moment().tz('America/New_York').hour(6).minutes(0).seconds(0);

        if (now.hours() >= 6) {
          nextSixAm.add('d', 1);
        }

        var diff = nextSixAm.diff(now, 'seconds');
        return diff;
      };

      var getRankingViaApi = function() {
        var params = {
          'limit'   : 0,
          'fields'  : 'ad_network_id,name,adoption,clicks,installs,cpi,rpi30,rpi60,rpi90,ir'.split(','),
          'api_key' : 'demoadv'
        };
        if (filter) {
          params.filter = filter;
        }

        return req.api.get('advertiser/ad_networks/stats/find', params, true)
          .then(function(data) {
            data = data.data;

            // obligatory callback function, but we don't need to do anything
            global.memcached.set(cacheKey, data, determineCacheDuration(), function() {});

            return data;
          });
      };

      var deferred = Q.defer();

      global.memcached.get(cacheKey, function (err, data) {
        if (data) {
          deferred.resolve(data);
        } else {
          getRankingViaApi()
            .then(function(data) {
              deferred.resolve(data);
            });
        }
      });

      return deferred.promise;
    };

    Q.spread(_.map(rankingsFilters, getRanking), function() {

      var resolvedPromises = Array.prototype.slice.call(arguments);

      var adNetworkRankings = _.map(resolvedPromises, function(resolvedPromise) {
        return _.find(resolvedPromise, { ad_network_id : req.session.ad_network_id });
      });

      res.json(_.zipObject(rankingsKeys, adNetworkRankings));
    });

  });
};
