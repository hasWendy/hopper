import React from 'react';
import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import NoticeOutline from 'txl/icons/icons/NoticeOutline';
import {gridUnits as gu, combineStyles} from 'txl/styles/helpers';
import {COLOR_NEUTRAL, COLOR_ACCENT, COLOR_ERROR, COLOR_WARNING} from 'txl/styles/theme';


@autobind
export default class Notifications extends BaseComponent {

  static get propTypes() {
    return {
      variant  : React.PropTypes.oneOf(['alert', 'information', 'status', 'warning']),
      messages : React.PropTypes.any
    };
  }

  _displayMessages() {
    return (
      <ul>
        {this.props.messages.map(msg => {
          return (
            <li>{msg.get('message', '')}</li>
          );
        })}
      </ul>
    )
  }

  render() {
    let styles = {
      container : {
        color        : COLOR_NEUTRAL['800c'],
        display      : 'flex',
        flexShrink   : 0,
        marginBottom : gu(4),
        padding      : `${gu(2)} ${gu(4)}`
      },
      alert : {
        backgroundColor : COLOR_ERROR['400']
      },
      information : {
        backgroundColor : COLOR_ACCENT['500']
      },
      status : {
        backgroundColor : COLOR_NEUTRAL['700']
      },
      warning : {
        backgroundColor : COLOR_WARNING['500']
      }
    }
    return (
      <div style={combineStyles(styles.container, styles[this.props.variant])}>
        <div style={{padding : '6px'}}>
          <NoticeOutline color={COLOR_NEUTRAL['800c']} />
        </div>
        <div style={{marginLeft : gu(2)}}>
          {this._displayMessages()}
        </div>
      </div>
    );
  }
}