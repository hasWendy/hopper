import React, {Component} from 'react';
import SelfApi from 'lib/api/selfApi';

class Table extends React.Component {
  constructor() {
    super();
    this.state = {
      renderedItems: {}
    }
  }
  getData(ids) {
    return SelfApi.post({'endpoint': 'brands'}, ids);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items.size) {
      this.renderItems();
    }
  }

  renderItems() {
    let output = [];
    let {items} = this.props;
    let ids = items.map(item => {
      return item.get('id');
    });

    if (ids.size) {
      this.getData({ids: ids}).then((data) => {
        // data is an Immutable.js object
        let brands = data.get('result');
        output = brands.map((item, key) => {
          let brandStats = items.get(item.get('id').toString());

          return (
            <tr key={key}>
              <td>{brandStats.get('rank')}</td>
              <td>{item.get('network_name')}</td>
              <td>{brandStats.get('data')}</td>
            </tr>
          );
        });

        this.setState({renderedItems: output}, () => {
          console.log(this.state.renderedItems);
        });
      }).catch((err) => {
        console.log('err:', err);
      });
    }
  }

  render() {
    let tableTitle = this.props.isProfit ? 'Profit' : 'Total Events';

    return (
      <table>
        <thead><tr><td>Top Performers by Total Events</td></tr></thead>
        <tbody>{this.state.renderedItems}</tbody>
      </table>
    )
  }
}

export default Table;
