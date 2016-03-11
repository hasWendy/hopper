import {Store} from 'flummox';
import {Map, List} from 'immutable';


export default class ReportDataStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('reportData');
    this.register(actionIds.reset, this.reset);
    this.register(actionIds.pageReset, this.pageReset);
    this.registerAsync(actionIds.getReportData, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.getSummaryData, this.loadingSummaryBegan, this.summaryReceived);

    this.state = {
      loading        : false,
      loadingSummary : false,
      exportJobId    : null,
      reportErrors   : List(),
      summaryErrors  : List(),
      summaryData : Map({
        data : List()
      }),
      reportData : Map({
        count : 0,
        data  : List()
      })
    };
  }

  loadingBegan() {
    this.setState({
      loading : true
    });
  }

  resultsReceived(data) {
    let newState = {
      loading      : false,
      reportData   : data,
      reportErrors : data.get('errors', List())
    };

    this.setState(newState);
  }

  loadingSummaryBegan() {
    this.setState({
      loadingSummary : true
    });
  }

  summaryReceived(data) {
    let newState = {
      loadingSummary : false,
      summaryData    : data,
      summaryErrors  : data.get('errors', List())
    };

    this.setState(newState);
  }

  reset() {
    this.setState({
      loading        : false,
      loadingSummary : false,
      exportJobId    : null,
      reportErrors   : List(),
      summaryErrors  : List(),
      summaryData : Map({
        data : List()
      }),
      reportData : Map({
        count : 0,
        data  : List()
      })
    });
  }

  pageReset() {
    this.setState({
      loading        : false,
      reportData     : Map({
        count : this.state.reportData.get('count'),
        data  : List()
      })
    });
  }

}
