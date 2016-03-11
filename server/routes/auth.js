var Q = require('q');
var md5 = require('MD5');
var _ = require('lodash');
var cacheHelpers = require('./../lib/cacheHelpers');


module.exports = function(router) {

  var setupSession = function(req, res, returnAsJson) {

    var actionHandlers = {};

    if (returnAsJson) {
        actionHandlers.invalid = function() { res.status(403).json({}); };
        actionHandlers.partners = function() { res.status(403).json({}); };
        actionHandlers.success = function() { res.status(200).json({}); };
      } else {
        actionHandlers.invalid = function() { res.redirect('/invalid'); };
        actionHandlers.partners = function() { res.redirect('/partners'); };
        actionHandlers.success = function() { res.redirect('/'); };
      }

    req.session.session_token = req.api.session_token || req.session.session_token;
    if(!req.session.session_token) {
      req.session.flashErrorMessage = 'Session token was not provided.';
      actionHandlers.invalid();
    }

    var logApiError = function(response) {
      global.winston.log('something failed when gathering login data via API', arguments);
      req.session.flashErrorMessage = (_.first(response.errors) || {}).message;
      actionHandlers.invalid();
    };


    var sessionPromise = req.api.get('session/authenticate/get_session_data', {});

    sessionPromise.then(function(data) {
      if(data.errors) {
        logApiError(data);
      }
      return data;
    });

    // only if we are a partner can we make a publisher/advertisers/find without it failing
    var accountPromise = req.api.get('partner/get_current', {fields : 'id,name'})
      .then(function(accountData) {
        accountData = accountData || {};
        if (_.isEmpty(accountData.data)) {
          return accountData.data || {};
        }

        global.winston.log('AccountData was not empty', accountData);
        return req.api.get('publisher/advertisers/find', {fields : 'id,name', limit: 0})
          .then(function(publisherAdvertisers) {

            accountData.data.publisherAdvertisers = publisherAdvertisers.data;
            console.log('status');
            return accountData;
          }, function(error) {
            logApiError(error);
          });
      }, function(error) {
        logApiError(error);
      });


    var check = Q.all([accountPromise, sessionPromise]);

    check.spread(function(accountData, sessionData) {

      // check to ensure user is an ad_network
      console.log('sessionData', sessionData, accountData);
      try {
      if (!sessionData.data.user || (sessionData.data.context && sessionData.data.context.type !== 'ad_network')) {
        if (_.isEmpty(sessionData.data.user)) {
          // if no userData.data, the error message was probably:
          // "The session_token for this request is not valid. Please Re-authenticate"
          req.session.flashErrorMessage = (_.first(sessionData.errors) || {}).message;
          console.log('routing to invalid')
          actionHandlers.invalid();
        } else {
          console.log('trying to save the session before routing to partners')
          req.session.save(function() {
            console.log('save completed, going to partners');
            // if they are not in an ad_network context, try to show them some ad networks they could log in as
            actionHandlers.partners();
          });

        }
        console.log('made it to this awful thing at the end for some reason');
        return;
      }} catch(e) {
        console.log('hey!', e);
      }

      // make sure ad_network accepts terms of service.
      // if user is coming from an agency context, skip this check.
      console.log('tos check!');
      if (!sessionData.data.tos_agreement_date && !sessionData.data.came_from_agency) {
        req.session.tos = null;
        res.redirect('/acceptTerms');
        console.log('should be redirected to TOS');
        return;
      }


      var publisherAdvertisers = _.sortBy(accountData.data.publisherAdvertisers, function(advertiser) {
        return advertiser.name && advertiser.name.toLowerCase();
      });

      _.extend(req.session, {
        'user'                 : sessionData.data.user,
        'publisherAdvertisers' : publisherAdvertisers,
        // This is a temp fix until they update the get_current call to return the ad_network info.
        'publisher_name'       : accountData.data && accountData.data.name,
        'publisher_id'         : accountData.data && accountData.data.id,
        'ad_network_id'        : sessionData.data.context.id,
        'internal_token'       : sessionData.data.api_key
      });

      console.log('user stuff happening');
      req.session.user.gravatar_hash = md5(sessionData.data.user.email);

      cacheHelpers.userLoggedIn(sessionData.data.context.id);

      actionHandlers.success();

    }, function(error) {
      logApiError(error);
    });
  };

  // Really only expecting GET and POST
  // GET used in dev_login
  // POST used from login portal
  router.all('/auth/login/:session_token?', function(req, res) {
    // TODO This is not ideal, as we basically need to remember every session variable we have and make
    // sure it is in this array. Can't do req.session.destroy() because we want to use req.session
    // immediately afterwards.
    var clearSessionKeys = [
      'user',
      'session_token',
      'publisher_id',
      'publisher_name',
      'ad_network_id',
      'internal_token',
      'publisherAdvertiserAttributionWindows',
      'checkSessionTime'
    ];

    _.each(clearSessionKeys, function(k) {
      req.session[k] = null;
    });

    var session_token = req.params.session_token || req.body.session_token || req.query.session_token;

    if (!session_token) {
      req.session.flashErrorMessage = 'The session_token for this request is not valid. Please Re-authenticate';
      res.redirect('/invalid');
      return;
    }

    req.session.user_request_id = md5(session_token + (Math.random() * 100000));
    req.api.session_token = session_token;

    setupSession(req, res);
  });

  router.post('/auth/setupPartner', function(req, res) {
    var adNetworkId = req.body.ad_network_id;
    if (!adNetworkId) {
      return res.status(403).json({});
    }

    if (req.session.ad_network_id) {
      return res.redirect('/');
    }

    var contextParams = {
      'id'   : adNetworkId,
      'type' : 'ad_network'
    };

    var handleFailure = function(response) {
      req.session.flashErrorMessage = (_.first(response.errors) || {}).message;
      res.status(403).json({});
    };

    req.api.get('session/context/set_current', contextParams)
      .then(function(responseData) {
        if (_.isEmpty(responseData.errors)) {
          return setupSession(req, res);
        }

        handleFailure(responseData);
      }, handleFailure);
  });

  router.get('/auth/session', function(req, res) {

    var safeSession = _.pick(req.session, [
      'user',
      'session_token',
      'publisher_id',
      'publisher_name',
      'ad_network_id',
      'internal_token'
    ]);
    safeSession.environment = global.conf.settings.environment;
    res.status(req.session.session_token ? 200 : 401).json(safeSession);
  });


  router.get('/auth/logout', function(req, res) {

    if (!req.session.session_token) {
      return req.session.destroy(function() {
        res.redirect('/auth/redirect/');
      });
    }

    req.api.post('session/authenticate/logout')
      .then(function() {
        req.session.destroy(function() {
          res.redirect('/auth/redirect/?logout=1');
        });
      }, function() {
        res.redirect('/auth/redirect/?logout=1');
      });
  });

  // this route is meant to be landed on and will actually redirect back to the MAT
  // advertiser app so that we don't have to expose conf.settings on the client side
  router.get('/auth/redirect', function(req, res) {

    var loginUrl = global.conf.settings.loginEndpoint;

    if (req.query.logout) {
      // Expected loginEndpoint looks like login.mobileapptracking.com/?redirectUrl=...
      // In an envrionment such as dev, it could potentially be in a different format
      if (loginUrl.indexOf('com/?') === -1) {
        // Fallback case to add logout=1 to login url if not standard url
        var connectorCharacter = loginUrl.indexOf('?') > -1 ? '&' : '?';
        loginUrl = loginUrl + connectorCharacter + 'logout=1';
      } else {
        loginUrl = loginUrl.replace('com/?', 'com/logout/?');
      }

    }
    console.log('made it to login page, login url is', loginUrl);
    res.redirect(302, loginUrl);
  });

};
