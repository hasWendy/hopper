import React from 'react';
import imm from 'immutable';
import BaseComponent from 'lib/baseComponent';
import Notifications from 'components/Notifications';

export default class Page extends BaseComponent {

  constructor(props) {
    super(props);
  }

  static get defaultProps() {
    return {
      pageType : 'fitted-page'
    };
  }

  _displayErrors(errors) {
    if (errors && errors.size) {
      return (
        <Notifications messages={errors} variant='alert' />
      );
    }
    return;
  }

  render() {
    return (
      <div className={this.props.pageType}>
        {this._displayErrors(this.props.errors)}
        {this.props.children}
      </div>
    );
  }

}
