import React from 'react/addons';
import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import classnames from 'classnames';
import {Map} from 'immutable';
import {Link} from 'react-router';
import DataCellIcon from 'components/DataCellIcon';
import {COLOR_NEUTRAL} from 'txl/styles/theme';
import {TRUNCATE} from 'txl/styles/helpers';

@autobind
export default class DataCell extends BaseComponent {

  constructor(props) {
    super(props);
  }

  displayData() {
    let dataStyle = {
      ...TRUNCATE,
      color : this.props.data === 'None' ? COLOR_NEUTRAL['200'] : COLOR_NEUTRAL['800']
    };

    if (Map.isMap(this.props.link) && this.props.link.has('linkTo') && this.props.link.has('id')) {
      return (
        <Link style={{...TRUNCATE}} to={this.props.link.get('linkTo')} params={{id : this.props.link.get('id')}}>{this.props.data}</Link>
      );
    } else {
      return (
        <span id={this.props.cellId} style={dataStyle}>{this.props.data}</span>
      );
    }
  }

  displayIcons() {
    return (
      <div className="row-icons">
        <ul>
          {this.props.icons.map(
            (icon, index) =>
              <DataCellIcon
                key={index}
                icon={icon} />
          )}
        </ul>
      </div>
    );
  }

  render() {
    let classes = classnames('data-cell-tpl', {'is-pinned' : this.props.isPinned});
    return (
      <div className={classes} style={{width: this.props.width || '100%'}}>
        {this.displayData()}
        {this.props.icons && this.displayIcons()}
      </div>
    );
  }
}
