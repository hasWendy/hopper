var builder = require('delphi-tools/build-webpack-config');
var production = process.argv.indexOf('-p') > -1 || process.env.NODE_ENV === 'production' || false;
var webpack = require('webpack');
var _ = require('lodash');

var externals = {CONFIG: 'CONFIG'};
var DEBUG_MODES = {
  'SAVED_REPORTS' : true
};

var entryPoints = {
  prod : './entry.jsx'
};


entryPoints.vendor =  [
  'react',
  'fixed-data-table',
  'lodash.memoize',
  'moment',
  'react-router',
  'immutable',
  'lodash',
  'flummox',
  'radium'
];

var plugins = [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(true),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': production ? '"production"' : '"dev"'
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    minChunks: Infinity
    // (with more entries, this ensures that no other module
    //  goes into the vendor chunk)
  })

];

if (production) {
  externals = _.assign(externals, {
    moment : 'moment',
    lodash  : '_'
  });

  entryPoints.vendor =  [
    'react',
    'fixed-data-table',
    'lodash.memoize',
    'flummox',
    'immutable',
    'react-router',
    'radium'
  ];
}

var config = {
  context : __dirname + '/web/modules',
  entry   : entryPoints,

  output : {
    path     : __dirname + '/web/',
    filename : '[name].bundled.js'
  },

  module : {
    loaders : [{
      test    : /\.js$/,
      loaders : ['babel-loader?stage=1'],
      exclude : /node_modules\/(?!(delphi|txl|fnServiceLayer|matstyle|tmc-components))/i
    }]
  },

  externals : externals,

  resolve : {
    extensions : ['', '.js', '.jsx', '.es6.js'],

    alias : {
      lib        : __dirname + '/web/modules/lib',
      stores     : __dirname + '/web/modules/stores',
      actions    : __dirname + '/web/modules/actions',
      pages      : __dirname + '/web/modules/pages',
      components : __dirname + '/web/modules/components',
      common     : __dirname + '/web/modules/common',
      services   : __dirname + '/web/modules/common/services',
      styles     : __dirname + '/web/styles',
      filters    : __dirname + '/web/modules/components/ReportSettings/lib/filters/mat',
      fields     : __dirname + '/web/modules/components/ReportSettings/lib/fields/mat'
    }
  },

  plugins: plugins,
  DEBUG_MODES: DEBUG_MODES
};

// want to save these settings, but not expose them in production.
// this is the solution, for now.
if (!production) {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin(DEBUG_MODES)
  ]);
}


if (production) {
  var debugDefinitions = {};
  for (var key in config.DEBUG_MODES) {
    debugDefinitions[key] = false;
  }

  config.plugins = config.plugins.concat(new webpack.DefinePlugin(debugDefinitions));
  console.log('Webpack running in production mode: build will be very slow');
}

module.exports = builder(config,
  {
    production   : production,
    hot          : false,
    babelOptions : 'optional=runtime'
  });
