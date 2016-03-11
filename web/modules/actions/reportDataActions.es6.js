const {Actions} = require('flummox');

export default class ReportDataActions extends Actions {

  getReportData(options) {
    let serviceName = options.get('service');
    const service = require(`services/${serviceName}ReportService`);
    let q = options.get('params');

    return service.find(q);
  }

  getSummaryData(options) {
    let serviceName = options.get('service');
    const service = require(`services/${serviceName}ReportService`);
    let q = options.get('params');
    q = q.delete('group').delete('includeCount');

    return service.find(q);
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  pageReset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }
}
