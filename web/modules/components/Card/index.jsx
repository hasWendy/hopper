/**
 * Card
 * Author: @hasErico
 */

const React = require('react/addons');
const BaseComponent = require('lib/baseComponent');
const classnames = require('classnames');
const {autobind} = require('lib/decorators');

require('./Card.less');

@autobind
export default class Card extends BaseComponent {
  render() {
    return (
      <div className={classnames('t-card', this.props.className)}>
        <div className='t-card-content'>
          {this.props.children}
        </div>
      </div>
    );
  }
}
