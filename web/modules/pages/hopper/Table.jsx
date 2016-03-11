import React, {Component} from 'react';
import brands from './brands.js';

class Table extends React.Component {
  renderItems() {
    let output = [];
    let {items} = this.props;
    for(var key in items) {
      // let name = '';
      // console.log(brands['data']);
      // for (var key in brands['data']) {
      //   console.log(key);
      // }
      let topBrand = brands['data'].map((brandData) => {
        return brandData['id'] === items[key][1];
        // if (brand['id'] === items[key][1]) {
        //   console.log(brand);
        //
        //   name = brand['network_name'];
        // }
      });

      // console.log(name);
      output.push(
        <tr key={key}>
          <td>{items[key][0]}</td>
          <td>{topBrand['network_name']}</td>
          <td>{items[key][2]}</td>
        </tr>
      )
    }
    return output;
  }

  render() {
    let tableTitle = this.props.isProfit ? 'Profit' : 'Total Events';

    return (
      <table>
        <thead><tr><td>Top Performers by Total Events</td></tr></thead>
        <tbody>{this.renderItems()}</tbody>
      </table>
    )
  }
}

export default Table;
