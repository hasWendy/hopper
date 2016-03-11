var mysql = require('../lib/mysql/connection'),
  _ = require('lodash');

module.exports = function(router) {

  var manipulateDataSet = function(queryParams, dataSet) {
    var limit = Number(queryParams.limit) || 0;
    var page = Number(queryParams.page) || 1;
    var search = (queryParams.search || '').toLowerCase();
    var sort = queryParams.sort;
    var advertiser_ids = queryParams.advertiser_ids;

    var response = {};

    var data = _.clone(dataSet);

    if (_.isArray(advertiser_ids)) {
      data = _.filter(data, function(datum) {
        return _.contains(advertiser_ids, datum.id.toString());
      });
    } else {
      var advertiser_id = parseInt(queryParams.advertiser_ids, 10);
      if (!_.isNaN(advertiser_id)) {
        data = _.filter(data, {'id' : advertiser_id});
      }
    }

    try {
      sort = JSON.parse(sort);
    } catch(e) {
      sort = {};
    }

    if (_.size(sort)) {
      data = _.sortBy(data, sort.field);

      if (sort.direction === 'desc') {
        data.reverse();
      }
    }

    if (!_.isUndefined(search)) {
      data = _.filter(data, function(datum) {
        if (datum.name.toLowerCase().indexOf(search) > -1 ||
              datum.publisher_id === parseInt(search, 10) ||
              datum.id === parseInt(search, 10)) {
          return true;
        }
      });
    }

    if (limit !== 0) {
      response.data = data.slice((page - 1) * limit, page * limit);
    } else {
      response.data = data;
    }

    if (queryParams.includeCount === 'true') {
      response.count = data.length;
      return response;
    }

    return response.data;
  };

  router.get('/advertisers', function(req, res) {
    var ad_network_id = req.session.ad_network_id;

    if (!ad_network_id) {
      return res.status(401).json({});
    }

    res.json(manipulateDataSet(req.query, req.session.publisherAdvertisers));
  });


  router.get('/advertisers/attributionWindows', function(req, res) {
    var ad_network_id = req.session.ad_network_id;

    if (!ad_network_id) {
      return res.status(401).json({});
    }

    if (!_.isEmpty(req.session.publisherAdvertiserAttributionWindows)) {
      res.json(manipulateDataSet(req.query, req.session.publisherAdvertiserAttributionWindows));
      return;
    }

    var sql = [
      'SELECT',
        'publishers.id as publisher_id,',
        'advertisers.id AS id,',
        'advertisers.name AS name,',
        'preferences.value AS preference_value,',
        'preferences.ref_type AS preference_type,',
        'publishers.attribution_window_seconds_click_identifiers,',
        'publishers.attribution_window_seconds_click_fingerprint,',
        'publishers.attribution_window_seconds_tracking_id_session,',
        'publishers.attribution_window_seconds_referrer_session,',
        'publishers.attribution_window_seconds_impression_identifiers,',
        'publishers.attribution_window_seconds_impression_fingerprint,',
        'publishers.attribution_impression_view_percent,',
        'publishers.reengagement_window_seconds',
      'from publishers',
        'JOIN advertisers',
          'ON advertisers.account_id = publishers.account_id',
        'LEFT JOIN preferences',
          'ON ((preferences.ref_id = publishers.id AND preferences.ref_type = \'Publisher\')',
              'OR (preferences.ref_id = advertisers.id AND preferences.ref_type = \'Advertiser\'))',
            'and preferences.deleted IS NULL',
            'and preferences.name = \'mobile_app_identifiers_session_lifetime\'',
      'where publishers.ad_network_id = ?',
        'and publishers.deleted IS null;'
      ].join(' ');

    /*
     * Expecting to handle the following use cases:
     * 604800 => 604800
     * json_604800 => 604800
     * json_"604800" => 604800
     * json_null => null
     * json_"" => null
     */
    var jsonDecodeNumber = function(encodedNumber) {
      if (!encodedNumber) {
        return encodedNumber;
      }

      if (encodedNumber.indexOf('json_') === 0) {

        if (encodedNumber.indexOf('json_"') === 0) {
          encodedNumber = encodedNumber.slice(6, -1);
        } else {
          encodedNumber = encodedNumber.slice(5);
        }

        if (!encodedNumber.length || encodedNumber === 'null') {
          return null;
        }
      }

      var numericEncodedNumber = Number(encodedNumber);
      if (_.isNaN(numericEncodedNumber)) {
        return null;
      }

      return numericEncodedNumber;
    };


    mysql.query(sql, [ad_network_id], function(err, rows) {
      if (err) {
        return res.json(err);
      }

      var advertiserIds = _.pluck(req.session.publisherAdvertisers, 'id');

      var publishersMap = {};
      var preferencesMap = {};

      _.each(rows, function(row) {

        if (!_.contains(advertiserIds, row.id)) {
          return;
        }

        row.preference_value = jsonDecodeNumber(row.preference_value);

        // due to the nature of the SQL query above, we could have multiple rows for a single publisher,
        // if they have both a publisher preference and an advertiser preference set.
        // Setting to a map will provide a way to remove duplicates, and we'll save the preferences
        // in a differerent map and process them in a second pass
        if (!publishersMap[row.publisher_id]) {
          publishersMap[row.publisher_id] = row;
          preferencesMap[row.publisher_id] = {};
        }

        preferencesMap[row.publisher_id][row.preference_type] = row.preference_value;
      });

      // could have tried to do something like this in 1 pass, but avoiding additional complexity out of fear
      var toReturn = _.values(publishersMap);

      _.each(toReturn, function(row) {
        // reconcile Click ID Attribution window
        // use whatever is defined first in this chain: publisher, publisher preference, advertiser preference
        if (_.isNull(row.attribution_window_seconds_click_identifiers)) {
          if (!_.isNull(preferencesMap[row.publisher_id]['Publisher'])) {
            row.attribution_window_seconds_click_identifiers = preferencesMap[row.publisher_id]['Publisher'];
          } else if (!_.isNull(preferencesMap[row.publisher_id]['Advertiser'])) {
            row.attribution_window_seconds_click_identifiers = preferencesMap[row.publisher_id]['Advertiser'];
          }
        }

        delete row.preference_type;
        delete row.preference_value;
      });

      toReturn = _.sortBy(toReturn, function(advertiser) {
        return advertiser.name && advertiser.name.toLowerCase();
      });

      req.session.publisherAdvertiserAttributionWindows = toReturn;

      res.json(manipulateDataSet(req.query, toReturn));
    });

  });
};
