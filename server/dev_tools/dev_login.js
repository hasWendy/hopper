module.exports = function(router) {


  router.get('/dev_login', function(req, res) {
    res.redirect('/setCurrent/ad_network/110');
  });


  router.get('/setCurrent/:contextType?/:id?/:noRedirect?', function(req, res) {

    var setContext = function(id, type) {
      var contextParams = {
        'id'   : id,
        'type' : type
      };

      req.api.get('session/context/set_current', contextParams).then(function() {

        if (req.params.noRedirect) {
          res.redirect('/getCurrent/' + req.api.session_token);
          return;
        }

        res.redirect('/auth/login/' + req.api.session_token);
      });
    }

    var id = req.params.id || process.env.MATPI_PUBLISHER_ID;
    var type = req.params.contextType || 'publisher';

    req.api.post('session/authenticate/api_key', {api_keys : req.api.api_key}, true).then(function(data) {
      req.api.session_token = data.data;

      setContext(id, type);
    }).catch(function() {
      console.log('authenticate/api_key or session/context/set_current errors!', arguments);
    });
  });


  router.get('/getCurrent/:sessionToken?', function(req, res) {
    req.api.session_token = req.params.sessionToken;

    var endpoint = !req.params.sessionToken ? 'session/environment/get_current' : 'session/context/get_current';

    req.api.post(endpoint, {}, !req.params.sessionToken).then(function(body) {
      res.json(body);
    });
  });


  router.get('/clear', function(req, res) {
    req.session.destroy();
    res.redirect('/getCurrent');
  });
};
