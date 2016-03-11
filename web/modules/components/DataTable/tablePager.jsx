import React from 'react';
import classnames from 'classnames';
import BaseComponent from 'lib/baseComponent';
import {autobind} from 'lib/decorators';
import Select from 'react-select';
import IconButton from 'txl/buttons/IconButton';
import {ArrowLeft, ArrowRight} from 'txl/icons/_Icons';
import {gridUnits as gu} from 'txl/styles/helpers';

@autobind
export default class PagingController extends BaseComponent {

  constructor(props) {
    super(props);

    this.state = {
      page      : 1,
      pageCount : 1
    };
  }

  static get defaultProps() {
    return {
      page            : 1,
      count           : null,
      pageSize        : 10,
      pageSizeOptions : [10, 25, 50],
      onUpdate        : function() {}
    };
  }

  componentWillReceiveProps(nextProps) {
    let newState = {};
    if (nextProps.count !== null) {
      newState.pageCount = Math.ceil(nextProps.count / nextProps.pageSize);
    }
    newState.page = newState.pageCount === 0 ? 0 : nextProps.page;
    this.setState(newState);
  }

  performUpdate(params) {
    let payload = {
      page     : params.page || this.props.page,
      pageSize : params.pageSize || this.props.pageSize
    };

    this.props.onUpdate(payload);
  }

  changePage(amount) {
    this.setState({
      page : this.props.page + amount
    }, () => {
      this.performUpdate({page : this.state.page});
    });
  }

  handleInput(evt) {
    this.setState({
      page : evt.target.value
    });
  }

  handleSubmit(evt) {
    evt.preventDefault();
    let determinePage = () => {
      let page = parseInt(this.state.page, 10);
      if (page < 1 || isNaN(page)) {
        return 1;
      }
      if (this.state.pageCount && page > this.state.pageCount) {
        return this.state.pageCount;
      }
      return page;
    };

    this.setState({
      page : determinePage()
    }, () => {
      this.performUpdate({page : this.state.page});
    });
  }

  updatePageSize(size) {
    this.setState({
      page : 1
    }, () => {
      this.performUpdate({page : 1, pageSize : parseInt(size, 10)});
    });
  }


  render() {
    let {pageSize, page, pageSizeOptions} = this.props;

    let optionsList = pageSizeOptions.map((option) => { return {value : String(option), label : 'View ' + option}; });
    let pageSizeSelector = (
      <div style={{width: gu(20)}} >
        <Select
          options={optionsList}
          value={String(pageSize)}
          clearable={false}
          searchable={false}
          onChange={(e) => {this.updatePageSize(e)}} />
      </div>
    );
    let classes = classnames({
      'table-page-size-selector'  : true,
      'select-menu-up'            : this.props.pagerMenuUp
    });

    let getCurrentPage = () => {
      let currentPage = () => {
        if (this.props.count) {
          return (
            <input value={this.state.page} onChange={this.handleInput} />
          );
        }
        return (
          <span style={{paddingLeft: gu(1)}}>{this.props.page}</span>
        );
      };

      let showPageCount = () => <span> of {this.state.pageCount}</span>;

      return (
        <span>Page {currentPage()}{!!this.props.count && showPageCount()}</span>
      );
    };

    return (
      <div>
        <div className={classes}>
          {pageSizeSelector}
        </div>
        <div className="table-page-selector">
          <form onSubmit={this.handleSubmit}>
            {getCurrentPage()}
          </form>
          <IconButton
            icon={ArrowLeft}
            variant='muted'
            size='large'
            onClick={this.changePage.bind(this, -1)}
            disabled={page === 1} />
          <IconButton
            icon={ArrowRight}
            variant='muted'
            size='large'
            _style={{marginLeft: gu(2)}}
            onClick={this.changePage.bind(this, 1)}
            disabled={page === this.state.pageCount} />
        </div>
      </div>
    );
  }
}
