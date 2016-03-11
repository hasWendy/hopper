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
        output = brands
          .map((item, key) => {
            return items.get(item.get('id').toString());
          })
          .sort((itemA, itemB) => {
            return itemA.get('rank') < itemB.get('rank') ? -1 : 1;
          })
          .map((thing, key) => {
            return (
              <tr key={key}>
                <td>{thing.get('rank')}</td>
                <td>{
                  brands.find(item => {
                    return item.get('id') ===thing.get('id');
                  }).get('network_name')
                }</td>
                <td>{thing.get('data')}</td>
              </tr>
            );
          });

        this.setState({renderedItems: output});
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
