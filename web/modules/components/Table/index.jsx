import React, {Component} from 'react';
import SelfApi from 'lib/api/selfApi';
import numeral from 'numeral';

export default class Table extends React.Component {
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
            let data = this.props.isProfit ? numeral((thing.get('data') / 100)).format('$0,0.00') : numeral(thing.get('data')).format('0,0');

            return (
              <div key={key} style={{borderLeft: '1px solid black', borderRight: '1px solid black', ...rowStyle}}>
                <div style={{flex: '0 0 10%', textAlign: 'center'}}>{thing.get('rank')}</div>
                <div style={{flex: '1 0 auto', textAlign: 'center'}}>{
                  brands.find(item => {
                    return item.get('id') === thing.get('id');
                  }).get('network_name')
                }</div>
              <div style={{flex: '0 0 15%', textAlign: 'center'}}>{data}</div>
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
    return (
      <div style={{display: 'flex', flexDirection: 'column', flex: '1 0 auto'}}>
        <div style={{flex: '1', display: 'flex', flexDirection: 'column'}}>
          <div style={{backgroundColor: '#37455b', color: '#ffffff', ...rowStyle}}>
            <div style={{flex: '0 0 10%', textAlign: 'center'}}>Rank</div>
            <div>Network</div>
            <div style={{flex: '0 0 15%', textAlign: 'center'}}>{this.props.isProfit ? 'Total Profits' : 'Total Events'}</div>
          </div>
          {this.state.renderedItems}
        </div>
      </div>
    )
  }
}

let rowStyle = {display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: '1'};
