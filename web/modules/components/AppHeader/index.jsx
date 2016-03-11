import React from 'react/addons';
import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import Header from 'txl/header/Header';
import {LAYER_2} from '../../../styles/layers';
import {combineStyles} from 'txl/styles/helpers';

@autobind
export default class AppHeader extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {

    let styles = {
      tHeader : {
        position : 'fixed',
        left     : '0',
        top      : '0',
        width    : '100vw',
      }
    };

    let hopper = "HOPPER - HasOffers Perspective into Product Event Report";
    let hopperMsg = '"Life was simple before World War II. After that, we had systems."  - Grace Hopper';

    return (
      <div style={combineStyles(styles.tHeader, LAYER_2)}>
        <Header
          ref='header'
          product='TMC'
          logo={{}}
          title={hopper}
          client={hopperMsg}>
        </Header>
      </div>
    );
  }
}
