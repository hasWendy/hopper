import React from 'react';
import {Map} from 'immutable';
import Radium from 'radium';
import {autobind} from 'lib/decorators';
import BaseComponent from 'lib/baseComponent';
import TableSortSelector from './tableSortSelector';
import {gridUnits as gu} from 'txl/styles/helpers';

export default class TableHeader extends BaseComponent {
  constructor(...args) {
    super(...args);

    this.state = { isOpen : false };
  }

  render() {
    let {
      field,
      sort,
      appliedSort,
      applySort
    } = this.props;

    let styles = {
      display        : 'flex',
      justifyContent : 'space-between',
      padding        : `0 ${gu(2)}`
    };

    return (
      <div style={styles} key='header' onClick={() => {this.setState({isOpen : !this.state.isOpen})}}>
        <span style={{cursor: 'pointer'}}>{field}</span>
        {sort.get('type') && appliedSort && applySort &&
          <TableSortSelector
            appliedSort={appliedSort}
            applySort={applySort}
            sort={sort}
            open={this.state.isOpen} />
        }
      </div>
    );
  }
}
