var mysql = require('../lib/mysql/connection');
var _ = require('lodash');

module.exports = function(router) {

  // EVERYTHING IN THIS ROUTE IS TEMPORARY SHOULD BE REMOVED WHEN FOLLOWING ARE RESOLVED:
  // https://jira.hasoffers.com/browse/MAN-216
  // https://jira.hasoffers.com/browse/MAN-217

  var getSingleItem = function(template_id, res) {
    mysql.query('SELECT * FROM ad_network_preferences WHERE id = ? LIMIT 1', [template_id], function(err, data) {
      res.json(data[0]);
    });
  };

  var settableParams = [
    'preference',
    'display',
    'description',
    'code',
    'status',
    'mobile_app_type',
    'options',
    'ad_network_postback_id'
  ];

  router.post('/ad_network_preferences/save', function(req, res) {

    var replacements = [];
    var template_id = req.body.id;
    var timeNow = new Date();
    var params = {
      'ad_network_id' : req.session.ad_network_id,
      'modified'      : timeNow
    };

    _.each(settableParams, function(val) {
      if (!_.isUndefined(req.body[val])) {
        params[val] = req.body[val];
      }
    });

    if (!template_id) {
      sql = 'INSERT INTO ad_network_preferences SET ?';
      params.created = timeNow;
      replacements = [params];
    } else {
      sql = 'UPDATE ad_network_preferences SET ? where id = ? limit 1';
      replacements = [params, template_id];
    }

    var query = mysql.query(sql, replacements, function(err, data) {
      if (err) {
        return res.json(err);
      }
      getSingleItem(template_id || data.insertId, res);
    });
  });
};
