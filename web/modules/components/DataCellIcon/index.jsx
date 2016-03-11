import React from 'react/addons';
import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import {Link} from 'react-router';
import * as icons from 'txl/icons/_Icons';
import {gridUnits as gu} from 'txl/styles/helpers';
import Tooltip from 'txl/_tooltips/CursorTooltipTarget';

@autobind
export default class DataCellIcon extends BaseComponent {

  constructor(props) {
    super(props);
  }

  render() {
    let Icon = icons[this.props.icon.name];
    let target = ( <Icon /> );
    if (this.props.icon.link) {
      target = (
        <Link
          to={this.props.icon.link.get('linkTo')}
          params={this.props.icon.link.toJS()}>
          <Icon />
        </Link>
      );
    }

    return (
      <Tooltip
        style={{height: gu(5), width: gu(6)}}
        message={this.props.icon.tooltip}>
        <li
          className={`row-icon-${this.props.icon.name}`}
          onClick={this.props.icon.onClick}>
          {target}
        </li>
      </Tooltip>
    );
  }
}
