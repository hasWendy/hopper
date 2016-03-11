/**
 * Full wrapper for table that includes paging controls.
 */

import React from 'react';
import imm from 'immutable';
import memoize from 'lodash.memoize';

import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import {FittedTable, Column} from 'delphi/fitted-table';
import TableHeader from './tableHeader';
import Pager from './tablePager';
import LoadingIndicator from 'components/loadingIndicator/loadingStateComponent';

import './DataTable.less';

let defaultTemplate = function(field) {
  /*
    Since JS doesn't allow for named arguments and I only need the 3rd argument in this list, the first two name
    are preceeded with the _$ pattern to denote they are unused.
    TODO: Update style guide to reflect how to handle unused positional arguments.
   */
  return function(_$, _$2, row) {
    const identifierTypes = [{
      field : 'google_aid',
      name  : 'Google AID'
    }, {
      field : 'ios_ifa',
      name  : 'iOS IFA'
    }, {
      field : 'windows_aid',
      name  : 'Windows AID'
    }];

    if (field === 'identifier_type' || field === 'identifier') {
      let display = '';

      identifierTypes.forEach((type) => {
        let code = row.get(type.field);
        if (code !== null && code.length > 0) {
          if (field === 'identifier') {
            display = code;
            return (<span>{code}</span>);
          } else if (field === 'identifier_type') {
            display = type.name;
          }
        }
      });

      return (<span>{display}</span>);
    }

    let fieldSplit = field.split('.');
    return (<span>{row.getIn(fieldSplit)}</span>);
  };
};


@autobind
export default class DataTable extends BaseComponent {

  static get defaultProps() {
    return {
      data            : imm.List(),
      totalCount      : 0,
      pageSize        : 25,
      page            : 1,
      fields          : imm.Map(),
      fieldTemplates  : imm.Map(),
      onPagingChanged : function() {},
      menuItemHeight  : 50,
      pageSizeOptions : [10, 25, 50, 100]
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      loading           : true,
      maxHeight         : 1000,
      maxPageMenuHeight : this.props.pageSizeOptions.length * this.props.menuItemHeight,
      scrollToRow       : 0,
      pagerMenuUp       : false
    };
  }

  componentDidMount() {
    if (window.addEventListener) {
      window.addEventListener('resize', _.throttle(this.calcMaxHeight, 250), false);
    } else if (window.attachEvent) {
      window.attachEvent('onresize', _.throttle(this.calcMaxHeight, 250));
    } else {
      window.onresize = this.calcMaxHeight;
    }

    this.calcMaxHeight();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.setState({scrollToRow: 0});
    }

    if (nextProps.loading !== this.state.loading) {
      this.setState({loading: nextProps.loading});
    }

    this.calcMaxHeight();
  }

  componentWillUnmount() {
    if (window.removeEventListener) {
      window.removeEventListener('resize', _.throttle(this.calcMaxHeight, 250), false);
    } else if (window.removeEvent) {
      window.removeEvent('onresize', _.throttle(this.calcMaxHeight, 250), false);
    } else {
      window.onresize = null;
    }

    this.getFlux().getActions(this.props.store).reset('');
  }

  calcMaxHeight() {
    let maxHeight = window.innerHeight;
    let tableWrapper = React.findDOMNode(this.refs.tableWrapper);
    let tableFooter = React.findDOMNode(this.refs.tableFooter);
    if (tableWrapper && tableFooter) {
      maxHeight = window.innerHeight - tableWrapper.offsetTop - tableFooter.clientHeight;
    }
    this.setState({
      maxHeight : maxHeight
    }, function() {
      let menuSpace = tableWrapper.clientHeight - (tableFooter.offsetTop + tableFooter.clientHeight);
      this.setState({
        pagerMenuUp : menuSpace < this.state.maxPageMenuHeight ? true : false
      });
    });
  }

  headerTemplate(tableData) {
    let sort = imm.Map();
    if (this.props.data.size > 1) {
      sort = imm.Map({
        field : tableData.get('field'),
        type  : tableData.get('sort')
      });
    }

    let {appliedSort, onSortChanged} = this.props;

    return function(label) {
      return (
        <TableHeader
          field={label}
          appliedSort={appliedSort}
          applySort={onSortChanged}
          sort={sort} />
      );
    };
  }

  render() {
    let {
      fields,
      fieldTemplates,
      page,
      pageSize,
      totalCount,
      data
    } = this.props;

    let getRowAtIndex = memoize((index) => {
      return this.props.data.get(index);
    });

    let Columns = this.props.columns || fields.map((field, key) => {
      let fieldName = field.get('field');
      return (
        <Column
          width={field.get('size')}
          flexGrow={field.get('flex')}
          fixed={field.get('fixed')}
          label={field.get('name')}
          cellRenderer={fieldTemplates.get(fieldName, defaultTemplate(fieldName))}
          headerRenderer={this.headerTemplate(field)}
          dataKey={fieldName}
          key={key}
          align={field.get('align')}/>
      );
    });

    let tableClass = ( this.props.loading ) ? 'table-content loading' : 'table-content';

    return (
      <div ref='tableWrapper' className='table-wrapper'>
        <div className={tableClass}>
          <LoadingIndicator loading={this.state.loading} />
          <FittedTable
            ref='tableContent'
            rowGetter={getRowAtIndex}
            rowsCount={Math.min(data.count(), pageSize)}
            rowHeight={this.props.rowHeight || 35}
            headerHeight={this.props.headerHeight || 35}
            maxHeight={this.state.maxHeight}>
            {Columns}
          </FittedTable>
        </div>

        <div ref='tableFooter' className='table-footer'>
          <Pager
            onUpdate={this.props.onPagingChanged}
            page={page}
            count={totalCount}
            pageSize={pageSize}
            pagerMenuUp={this.state.pagerMenuUp}
            pageSizeOptions={this.props.pageSizeOptions}/>
        </div>
      </div>
    );
  }
}
