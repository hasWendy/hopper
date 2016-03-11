import  {
  Route,
  DefaultRoute,
  NotFoundRoute,
  Redirect
} from 'react-router';

import React from 'react';
import BaseInterface from 'pages/BaseInterface';

module.exports = (
  <Route handler={BaseInterface} path='/'>
    <Redirect from='/' to='hopper' />

    <Route
      name='hopper'
      path='/hopper'
      handler={require('pages/hopper/index')}></Route>
  </Route>
);
