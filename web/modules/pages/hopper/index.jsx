import React from 'react';
import {Chart} from 'react-google-charts';
import imm from 'immutable';
import $ from 'jquery';
import Table from 'components/Table';
import Page from 'pages/Page';
import moment from 'moment';

export default class Hopper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isProfit   : false,
      mapData    : [],
      graphData  : [],
      chartData  : []
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.getData('counts/countries');
      this.getData('days');
      this.getData('counts/topbrands');
    });

    this.chartTimer = setInterval(() => {
      clearTimeout(this.timeout);
      this.setState({
        isProfit :  !this.state.isProfit
      }, () => {
        this.getData('days');
      });
    }, 300000);

    this.mapTimer = setInterval(() => {
      if (this.state.isProfit) {
        this.getData('profit/countries');
        this.getData('profit/topbrands');
      } else {
        this.getData('counts/countries');
        this.getData('counts/topbrands');
      }
    }, 60000);
  }

  getData(query) {
    $.get('http://dh-hillaryp01-dev.sea3.office.priv:8080/' + query, (results) => {
      this._handleData(query, results);
    });
  }

  _handleData(query, results) {
    if (query === 'days') {
      let graphData = [];
      for (var key in results.days) {
        let data = [];
        if (this.state.isProfit) {
          console.log(results.days[key]['payout_cents'] * 100);
          data = [moment(key).toDate(), (results.days[key]['payout_cents'] * 100), (results.days[key]['profit_cents'] * 100), (results.days[key]['revenue_cents'] * 100)];
        } else {
          data = [moment(key).toDate(), results.days[key]['clicks'], results.days[key]['conversions'], results.days[key]['impressions']];
        }
        graphData.push(data);
      }

      this.setState({ graphData });
    } else if (query.includes('topbrands')) {
      let chartData = imm.Map();
      for (var i = 0; i < results.top_25_brands.length; i++) {
        let id = results.top_25_brands[i].id;
        let brand = imm.Map({
          rank: i+1,
          id: id,
          data: results.top_25_brands[i].count
        });
        chartData = chartData.set(id.toString(), brand);
      }

      this.setState({ chartData });
    } else if (query.includes('countries')) {
      let mapData = [];
      for (var key in results.countries) {
        if (key !== '**' && key != '--') {
          mapData.push([key, results.countries[key]]);
        }
      }

      this.setState({ mapData });
    }
  }

  render() {
    let STYLES = {
      table: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
      }
    };

    var options = {
      hAxis: {title: 'Days'},
      vAxis: {
        title: this.state.isProfit ? 'Total (USD)' : 'Total (Count)'
        // viewWindowMode: 'explicit',
        // viewWindow: {
        //   min: 0
        // }
      },
      backgroundColor : {
        fill : '#F5F6F7',
        opacity : 0
      },
      legend: 'top',
      format: {

      }
    };

    var graphColumns = [
      {
        label : 'Day',
        type  : 'date'
      },
      {
        label : this.state.isProfit ? 'Payout' : 'Clicks',
        type  : 'number'
      },
      {
        label : this.state.isProfit ? 'Profit' : 'Conversions',
        type  : 'number'
      },
      {
        label : this.state.isProfit ? 'Revenue' : 'Impressions',
        type  : 'number'
    }];

    var mapColumns = [
      {
        label : 'Countries',
        type  : 'string'
      },
      {
        label : this.state.isProfit ? 'Payout' : 'Events',
        type  : 'number'
      }
    ];

    var mapOptions = {
      colorAxis : {
        minValue  : 0,
        colors    : ['#D4EDFF', '#001C3D']
      },
      backgroundColor : {
        fill : '#F5F6F7',
        opacity : 0
      }
    };

    return (
      <Page>
        <div style={STYLES.table}>
          <div style={{flex: '0.65', border: '0px solid black', display: 'flex', flexDirection: 'column', borderBottom: '1px solid black'}}>
            <h3 style={{margin: '10px'}}>Today's Top Performers by {this.state.isProfit ? 'Profit' : 'Events'}</h3>
            <Table
              items={this.state.chartData}
              isProfit={this.state.isProfit} />
          </div>
          <div style={{display: 'flex', flex: '1', flexDirection: 'column', marginLeft: 10}}>
            <div style={{flex: '1'}}>
              <h3 style={{margin: '10px'}}>Today's {this.state.isProfit ? 'Profits' : 'Events'} Around the World</h3>
              <Chart
                chartType='GeoChart'
                rows={this.state.mapData}
                columns={mapColumns}
                options={mapOptions}
                graph_id='geo_chart'
                width={'100%'}
                legend_toggle={true} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{margin: '10px'}}>Last 30 Days - {this.state.isProfit ? 'Finance Report' : 'Events Report'}</h3>
              <Chart
                chartType='LineChart'
                rows={this.state.graphData}
                columns={graphColumns}
                options={options}
                graph_id='LineChart'
                width={'100%'}
                legend_toggle={true} />
            </div>
          </div>
        </div>
      </Page>
    );
  }

}
