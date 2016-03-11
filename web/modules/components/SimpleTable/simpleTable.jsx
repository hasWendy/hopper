/**
 * Full wrapper for table that includes paging controls.
 */

import React from 'react';
import imm from 'immutable';
import memoize from 'lodash.memoize';

import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import {FittedTable, Column} from 'delphi/fitted-table';
import LoadingIndicator from 'components/loadingIndicator/loadingStateComponent';
import {COLOR_NEUTRAL} from 'txl/styles/theme';

import './SimpleTable.less';

let defaultTemplate = function(field) {
  /*
    Since JS doesn't allow for named arguments and I only need the 3rd argument in this list, the first two name
    are preceeded with the _$ pattern to denote they are unused.
    TODO: Update style guide to reflect how to handle unused positional arguments.
   */
  return function(_$, _$2, row) {
    let fieldSplit = field.split('.');
    // check for empty value 
    if (row.getIn(fieldSplit)) {
      return (<span>{row.getIn(fieldSplit)}</span>);
    } else {
      return (<span style={STYLES.nodata}>No Data</span>);
    }
  };
};


@autobind
export default class SimpleTable extends BaseComponent {

  static get defaultProps() {
    return {
      data            : imm.List(),
      totalCount      : 0,
      fields          : imm.Map(),
      fieldTemplates  : imm.Map()
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      maxHeight         : 1000,
      maxPageMenuHeight : this.props.totalCount.length * this.props.menuItemHeight
    };
  }

  render() {
    let {
      fields,
      fieldTemplates
    } = this.props;

    let getRowAtIndex = memoize((index) => {
      return this.props.data.get(index);
    });

    let Columns = fields.map((field, key) => {
      let fieldName = field.get('field');
      return (
        <Column
          width={field.get('size')}
          flexGrow={field.get('flex')}
          fixed={field.get('fixed')}
          label={field.get('name')}
          cellRenderer={fieldTemplates.get(fieldName, defaultTemplate(fieldName))}
          dataKey={fieldName}
          key={key}
          align={field.get('align')}/>
      );
    }).toJS();

    return (
      <div className='table-wrapper-simple'>
        <div className='table-content-simple'>
          <LoadingIndicator
            size={'medium'}
            loading={this.props.loading}  />
          <FittedTable
            rowGetter={getRowAtIndex}
            rowsCount={Math.min(this.props.data.count(), 100)}
            rowHeight={this.props.rowHeight || 35}
            maxHeight={(Math.min(this.props.data.count(), 100) * (this.props.rowHeight || 35)) + (this.props.headerHeight || 35) + 20}
            headerHeight={this.props.headerHeight || 35}>
            {Columns}
          </FittedTable>
        </div>
      </div>
    );
  }
}

const STYLES = {
  nodata: {
    color : COLOR_NEUTRAL['200']
  }
};
