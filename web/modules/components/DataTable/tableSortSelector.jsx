import React from 'react';
import Immutable, {Map, List} from 'immutable';
import classnames from 'classnames';
import SortArrowsIcon from 'txl/icons/icons/SortArrows';
import Radium from 'radium';

import {autobind} from 'lib/decorators';
import BaseComponent from 'lib/baseComponent';
import Flyout from 'components/Flyout/Flyout';
import {COLOR_NEUTRAL} from 'txl/styles/theme';


const SORT_SELECTOR_LINKS = {
  alpha : {
    asc  : <span>Sort A To Z</span>,
    desc : <span>Sort Z To A</span>
  },
  num : {
    asc  : <span>Sort Low To High</span>,
    desc : <span>Sort High To Low</span>
  },
  date : {
    asc  : <span>Sort Old To New</span>,
    desc : <span>Sort New To Old</span>
  }
};

export default class TableSortSelector extends BaseComponent {

  render() {
    if (!this.props.sort || !this.props.sort.has('field')) {
      return null;
    }

    let {sort, appliedSort} = this.props;

    let sortDirection = appliedSort.get('field') !== sort.get('field') ?
      false :
      appliedSort.get('direction');

    let sortType = sort.get('type');

    let classes = {
      'sort-selector' : true,
      'sorted'        : !!sortDirection,
      'sort-asc'      : sortDirection === 'asc',
      'sort-desc'     : sortDirection === 'desc'
    };

    let sortItems = SORT_SELECTOR_LINKS[sortType];
    let sortArgs = Immutable.fromJS({field: sort.get('field'), direction: 'asc'});

    return (
      <span className={classnames(classes)}>
        <Flyout
          align='right'
          target={<SortArrowsIcon color={COLOR_NEUTRAL['800c']} />}
          open={this.props.open}>
          <ul>
            <li onClick={() => this.props.applySort(sortArgs)}>{sortItems.asc}</li>
            <li onClick={() => this.props.applySort(sortArgs.set('direction', 'desc'))}>{sortItems.desc}</li>
          </ul>
        </Flyout>
      </span>
    );
  }
}
