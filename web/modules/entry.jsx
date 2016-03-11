// Most decorators require reflection - so lets just polyfil that.
// NOTE: DO NOT require the entire library. The object extensions slow react down a lot.
// This needs to be first in the pipeline.
import 'core-js/modules/es6.reflect';
import React from 'react';
import Router from 'lib/router';
import ga from 'react-ga';
import ENV from 'CONFIG';
import 'base_styles/main.less';

/*
  TODO:  Add in a promise polyfil for aging browsers. This is required for the new service layer.
 */


ga.initialize(ENV.GA_TRACKING_ID);
Router.run((Handler, state) => {
  ga.pageview(state.pathname);
  React.render(
    <Handler {...state} />,
    document.getElementById('appContent')
  );
});

window.__lc = window.__lc || {};
window.__lc.license = 1040387;

GoogleCharts = function() {
  var lc = document.createElement('script');
  lc.type = 'text/javascript';
  lc.src = 'https://www.google.com/jsapi';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(lc, s);
};

GoogleCharts();
