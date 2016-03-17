import React from 'react';
import imm from 'immutable';

export default class Page extends React.Component {

  constructor(props) {
    super(props);
  }

  static get defaultProps() {
    return {
      pageType : 'fitted-page'
    };
  }

  render() {
    return (
      <div className={this.props.pageType}>
        {this.props.children}
      </div>
    );
  }

}
