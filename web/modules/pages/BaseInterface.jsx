import React from 'react';
import flux from 'lib/flux';
import {RouteHandler} from 'react-router';
import FluxComponent from 'flummox/component';

import 'base_styles/main.less';
import 'styles/site.less';

import Page from 'delphi/chrome/Page';
import ContentWrapper from 'delphi/chrome/ContentWrapper';
import Viewport from 'delphi/chrome/Viewport';
import AppHeader from 'components/AppHeader';
import {gridUnits as gu} from 'txl/styles/helpers';
import {COLOR_NEUTRAL} from 'txl/styles/theme';

export default class NavigationParent extends React.Component {
  render() {
    let styles = {
      backgroundColor : COLOR_NEUTRAL['100'],
      margin          : `0 0 ${gu(4)}`
    };

    return (
      <Page>
        <FluxComponent flux={flux}>
          <AppHeader />
        </FluxComponent>
        <ContentWrapper collapsed={false}>
          <Viewport>
            <div className='t-viewport-content'>
              <FluxComponent flux={flux}>
                <RouteHandler />
              </FluxComponent>
            </div>
          </Viewport>
        </ContentWrapper>
      </Page>
    )
  }
}
