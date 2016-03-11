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
              <div key={key} style={rowStyle}>
                <div style={{flex: '0 0 10%', textAlign: 'center'}}>{thing.get('rank')}</div>
                <div style={{flex: '1 0 auto', textAlign: 'center'}}>{
                  brands.find(item => {
                    return item.get('id') === thing.get('id');
                  }).get('network_name')
                }</div>
                <div style={{flex: '0 0 15%', textAlign: 'center'}}>{thing.get('data')}</div>
              </div>
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
      <div style={{display: 'flex', flexDirection: 'column', flex: '1 0 auto'}}>
        <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
          <div style={{backgroundColor: '#37455b', color: '#ffffff', ...rowStyle}}>
            <div style={{flex: '0 0 10%', textAlign: 'center'}}>Rank</div>
            <div>Network</div>
            <div style={{flex: '0 0 15%', textAlign: 'center'}}>{this.props.isProfit ? 'Profit (USD)' : 'Count'}</div>
          </div>
          {this.state.renderedItems}
        </div>
      </div>
    )
  }
}

let rowStyle = {display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: '1'};

export default Table;
