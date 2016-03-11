
var _ = require('lodash');
var moment = require('moment');
var fs = require('fs');
var ejs = require('ejs');

// Precompile template - this makes the first load about 300ms faster.
var indexTemplate = ejs.compile(fs.readFileSync(require.resolve('../server_templates/index.ejs'), 'utf8'));


module.exports = function(router) {


  // 'debug' is one of expected parameters to ejs' render function; setting it to true
  // causes ejs template markup to be output to standard out. Those logs aren't helpful, and make it difficult to
  // trace api requests. That's why we have to have a separate
  // variable to check if we are in "debug" mode.
  router.all('/', function(req, res) {
    var templateParams = {
      endpoint      : global.conf.settings.javascriptEndpoint + '/v2/',
      localDev      : global.DEVELOPMENT,
      internal      : req.is_internal,
      ad_network_id : req.body.ad_network_id || req.session.ad_network_id,
      environment   : global.conf.settings.environment,
      session_token : req.session.session_token
    };

    res.type('html');

    // No need to stall, just go ahead and render that shiz.
    res.end(indexTemplate(templateParams));


  });

  router.get('/partners', function(req, res) {
    if (req.session.ad_network_id) {
      res.redirect('/');
      return;
    }

    req.api.get('partner/find', { fields: 'ad_network_id,name', limit: 0})
      .then(function(partnerData) {

        var templateParams = {
          debug         : false,
          localDev      : global.DEVELOPMENT,
          partners      : partnerData.data,
          loginEndpoint : global.conf.settings.loginEndpoint,
          errorMessage  : req.session.flashErrorMessage || '',
          invalid       : false
        };

        delete req.session.flashErrorMessage;

        res.render('wrong-context', templateParams);
      });
  });

  router.get('/invalid', function(req, res) {
    if (req.session.ad_network_id) {
      res.redirect('/');
      return;
    }

    var templateParams = {
      debug         : false,
      localDev      : global.DEVELOPMENT,
      loginEndpoint : global.conf.settings.loginEndpoint,
      errorMessage  : req.session.flashErrorMessage || '',
      invalid       : true,
      partners      : []
    };

    delete req.session.flashErrorMessage;

    res.render('wrong-context', templateParams);
  });

  router.get('/acceptTerms', function(req, res) {

    if (_.isDate(req.session.tos) || Date.parse(req.session.tos)) {
      res.redirect('/');
      return;
    }

    var templateParams = {
      debug         : false,
      localDev      : global.DEVELOPMENT,
      loginEndpoint : global.conf.settings.loginEndpoint,
      now           : new Date(),
      res           : res
    };

    delete req.session.flashErrorMessage;

    res.render('tos-agreement', templateParams);
  });

  router.get('/accepted', function(req, res) {

    if (_.isDate(req.session.tos) || Date.parse(req.session.tos)) {
      res.redirect('/');
      return;
    }

    req.api.get('account/agree_to_tos', { certification_authority: true, service_agreement: true})
      .then(function(response) {
        // just need session.tos to contain a date, never actually check what date it is.
        req.session.tos = new Date();
        res.redirect('/auth/login/' + req.session.session_token);
      }).catch(function() {
        res.redirect('/acceptTerms')
      });
  });

  router.get('/partnerTerms', function(req, res) {

    var templateParams = {
      debug         : false,
      localDev      : global.DEVELOPMENT,
      loginEndpoint : global.conf.settings.loginEndpoint
    };

    delete req.session.flashErrorMessage;

    res.render('partner-terms', templateParams);
  });

};
