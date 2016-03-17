/**
 * Entry point for mat partner interface front end.
 * run:
 *   node server.js
 * Command Line Options run:
 *   node server.js --help
 *
 */


var http = require('http');
var express = require('express');
var path = require('path');
var objectUtils = require('./objectUtils');
var commander = require('commander');
var Q = require('q');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var compression = require('compression');
var winston = require('winston');
var _ = require('lodash');

// This plugin is designed to work with connect - so I'm just filling the object down to the store level as it
// expects.
// var MemcachedStore = require('connect-memcached')({session : {Store : expressSession.Store}});
// var apiMiddleware = require('./lib/api');

commander
  .option('-c, --config_path [config_path]',
    'Absolute path to the application config file [/var/has/hopper/conf/config.json]',
    '/var/has/hopper/conf/config.json')
  .option('-i, --ip_path [ip_path]',
    'Absolute path to the internal_ip configs [/var/has/ho_ips.json]',
    '/var/has/ho_ips.json')
  .option('-p, --port [port]', 'The port to run the server on. [8080]', 8080)
  .option('--dev', 'Run the application in development mode. (Overrides the environment flag)')
  .option('--logtoconsole', 'Do not write logs to file, write to STDIN instead.')
  .parse(process.argv);

var DEV = global.DEVELOPMENT = commander.dev || (process.env.NODE_ENV === 'dev');

global.conf = {};
// conf = require(commander.config_path);

// This is used to determine which firebase buckets we should use.
// var envMap = {
//   'production': 'prod',
//   'beta'      : 'prod',
//   'staging'   : 'stage'
// };

conf.loginEndpoint = "https://localhost:8080/#/hopper";


// conf.environment = envMap[conf.environment] || 'dev';
//
// if (DEV || conf.environment === 'dev') {
//   conf.loginEndpoint =
//     conf.loginEndpoint ||
//     "https://localhost:8080/#/hopper";
// }

// conf.ips = require(commander.ip_path);

objectUtils.deepFreezeObject(conf);
global.conf = conf;
initializeServer();


// function setupWinstonLogging() {
//   winston.remove(winston.transports.Console);
//   if (global.DEVELOPMENT || commander.logtoconsole) {
//     winston.add(winston.transports.Console, {colorize : true});
//   } else {
//     var transportOptions = {
//       'filename' : conf.logLocation || '/var/has/hopper/log/partners_generic.log',
//       'maxsize'  : conf.maxLogSize || 25000,
//       'maxFiles' : conf.maxLogFiles || 2
//     }
//     winston.add(winston.transports.File, transportOptions);
//   }
//
//   global.winston = winston;
// }

function initializeServer() {
  var app = module.exports = express();
  var router = require('./router')(path.join(__dirname, 'routes/'));

  // app.use(function(req, res, next) {
  //   var hostHeader = req.headers.host || '';
  //   var hostname = hostHeader.split(':')[0] || '';
  //
  //   if (hostname.indexOf('mobileapptracking.com') !== -1) {
  //     var protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  //     var port = (hostHeader.split(':')[1] - 0) || undefined;
  //     var newHost = hostname.indexOf('stage') !== -1 ? 'partners.stage.tune.com' : 'partners.tune.com';
  //     var newUrl = protocol + '://' + newHost + (port ? ':' + port : '') + req.url;
  //
  //     res.writeHead(301, {
  //       Location: newUrl
  //     });
  //     res.end();
  //   }
  //   next();
  // });

  // setupWinstonLogging();

  var session_key = conf.session_secret;

  // var store = new MemcachedStore({hosts : conf.cache, prefix : 'mat_pub'});
  // global.memcached = store.client;


  if (!global.DEVELOPMENT) {
    // No need to compress things in dev mode.
    app.use(require('http-static-gzip-regexp')(/(\.js|delphi\.css)$/))
       .use(compression())
       .enable('etag');
  }

  // app.enable('trust proxy')
  //    .set('views', __dirname + '/server_templates')
  //    .set('view engine', 'ejs');

  if (global.DEVELOPMENT) {
    var webpack = require('webpack');
    var webpackOptions = require('../webpack.config');
    var compiler = webpack(webpackOptions);
    var webpackMiddleware = require('webpack-dev-middleware');
    app.use(webpackMiddleware(compiler, {publicPath: '/web/'}));
  }

  app.use('/web', express.static(path.join(__dirname, '../web/')));
  app.use(cookieParser())
    .use(expressSession({
      secret            : 'secrets',
      key               : 'sid',
      // store             : store,
      resave            : false,
      saveUninitialized : true
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ 'extended' : true }));

  // app.use(function checkIsInternal(req, res, next) {
  //     if (global.DEVELOPMENT) {
  //       req.is_internal = true;
  //       return next();
  //     }
  //
  //     var ip = String(req.ip);
  //
  //     var whiteList = conf.ips.exact || [];
  //     var partialList = conf.ips.partial || [];
  //     req.is_internal = false;
  //
  //     if (_.contains(whiteList, ip)) {
  //       req.is_internal = true;
  //       return next();
  //     }
  //
  //     _.each(partialList, function(p) {
  //       if (ip.indexOf(p) === 0) {
  //         req.is_internal = true;
  //         return false;
  //       }
  //     });
  //     next();
  //   })
  //   .use(apiMiddleware(conf.iproxyEndpoint || conf.javascriptEndpoint, 'v2', conf.apiKey));

  // Dev routes may do things that the other routes do not. so we need to include them higher in the stack.
  // if (global.DEVELOPMENT) {
  //   require('./dev_tools/dev_login')(router);
  // }


  app.use(function(req, res, next) {
    var oldJsonResponseFunction = res.json.bind(res);
    //Overriding the Express.js res.json to send log data in addition to the result.
    res.json = function(obj){
        var resultWithLog = {
          result: obj,
          // requests: req.api.requestLog
        };

        oldJsonResponseFunction(resultWithLog);
    };
    next();
  });
  app.use(router);



  http.createServer(app).listen(commander.port, function() {
    console.log('app running on port', commander.port);
  });
}
