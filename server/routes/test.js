var mysql = require('../lib/mysql/connection');

module.exports = function(router) {

  router.use('/test/health', function(req, res) {
    var healthcheckFailureTimeout;
    var resHasEnded = false;
    var end = function(message) {
      if (!resHasEnded) {
        resHasEnded = true;
        clearTimeout(healthcheckFailureTimeout);
        res.end(message);
      }
    }

    try {
      healthcheckFailureTimeout = setTimeout(function() {
        end('There was a generic timeout failure.');
      }, 5000);

      global.memcached.set('healthcheck', true, 5000, function(err, p) {
        if (err) {
          return end('Failed to write memcached');
        }
        mysql.query('SELECT Count(1) from publishers limit 1;', function(err, rows) {
          if (err) {
            return end('MySql failed to query properly.');
          }
          end('STELLAR');
        });
      });
    } catch (e) {
      end('There was an error in the healthcheck: ' + e.message);
    }
  });
};
