import {Store} from 'flummox';
import {Map, List} from 'immutable';

export default class ExportStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('exports');
    this.registerAsync(actionIds.exportReportData, this.startExport, this.exportJobIDReceived);
    this.registerAsync(actionIds.checkExportStatus, this.startCheckingStatus, this.finishedCheckingStatus);

    this.state = {
      exporting       : '',
      downloadList    : List()
    };
  }

  startExport() {
    this.setState({exporting : true});
  }

  exportJobIDReceived(data) {
    let newDownloadListItem;
    let jobId = data.get('job_id');
    if (jobId) {
      newDownloadListItem = Map({
        jobId        : jobId,
        name         : data.get('name'),
        service      : data.get('service'),
        status       : 'pending',
        updateTime   : '',
        url          : ''
      });
    } else {
      newDownloadListItem = Map({
        jobId  : '',
        name   : 'Error exporting your report',
        status : 'failed',
        url    : ''
      });
    }

    this.setState({
      exporting    : false,
      downloadList : this.state.downloadList.push(newDownloadListItem)
    });
  }

  startCheckingStatus() {
    this.setState({
      exporting : ''
    });
  }

  finishedCheckingStatus(data) {
    let dl = this.state.downloadList;
    let jobId = data.get('job_id');

    if (jobId) {
      let target = dl.findIndex(item => { return item.jobId === jobId; });
      let status = data.has('status') ? data.get('status') : data.get('url') ? 'complete' : '';
      dl = dl.setIn([target, 'status'], status);
      // use timestamp to force the download status update
      dl = dl.setIn([target, 'updateTime'], Date.now());
      if (status === 'complete') {
        dl = dl.setIn([target, 'url'], data.get('url'));
      }
    }

    this.setState({
      downloadList : dl
    });
  }
}
