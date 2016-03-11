 var mysql = require('../lib/mysql/connection');
var _ = require('lodash');

module.exports = function(router) {

  // EVERYTHING IN THIS ROUTE IS TEMPORARY SHOULD BE REMOVED WHEN FOLLOWING ARE RESOLVED: 
  // https://jira.hasoffers.com/browse/MAN-232
  // https://jira.hasoffers.com/browse/MAN-233

   var settableParams = [
    'name',
    'description',
    'all_sites',
    'os_type',
    'event_type',
    'http_method',
    'result_should_contain',
    'result_should_not_contain',
    'url',
    'status'
  ];

  var getSingleItem = function(template_id, res) {
    mysql.query('SELECT * FROM ad_network_postbacks WHERE id = ? LIMIT 1', [template_id], function(err, data) {
      res.json(data[0]);
    });
  };

  var savePostback = function(req, res, del) {

    var replacements = [];
    var template_id = req.body.id;
    var timeNow = new Date();
    var params = {
      'modified' : timeNow
    };

    if (del === true) {
      //handle delete
      params.deleted = timeNow
    } else {

      // handle save
      params.ad_network_id = req.session.ad_network_id;
      _.each(settableParams, function(val) {
        if (req.body && req.body[val]) {
          params[val] = req.body[val];
        }
      });
    }

    if (!template_id) {
      sql = 'INSERT INTO ad_network_postbacks SET ?';
      params.created = timeNow;
      replacements = [params];
    } else {
      sql = 'UPDATE ad_network_postbacks SET ? where id = ? limit 1';
      replacements = [params, template_id];
    }

    var query = mysql.query(sql, replacements, function(err, data) {
      if (err) {
        return res.json(err);
      }
      getSingleItem(template_id || data.insertId, res);
    });
  };

  router.post('/ad_network_postbacks/save', savePostback);
  router.post('/ad_network_postbacks/delete', function(req, res) {
    savePostback(req, res, true);
  });
};