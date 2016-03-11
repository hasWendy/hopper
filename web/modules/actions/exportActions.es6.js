const exportsService = require('services/exportService');
const {Actions} = require('flummox');

export default class ExportActions extends Actions {

  exportReportData(options) {
    let q = options.get('params');
    let reportName = options.get('name');
    let service = options.get('service');
    return exportsService.exportQueue(q, reportName, service);
  }

  checkExportStatus(jobId, service) {
    return exportsService.checkStatus(jobId, service);
  }
}
