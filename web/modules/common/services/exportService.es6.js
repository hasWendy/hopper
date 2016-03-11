const imm = require('immutable');
const MatApi = require('lib/api/matApi');
const CrudService = require('lib/crudService');

class ExportService extends CrudService {
  constructor() {
    super(MatApi);

    this.fields = imm.Map({
      'id' : 'equal'
    });

    this.baseEndpoint = 'publisher/stats';
  }

  exportQueue(params, reportName, service) {
    let exportPath = service === 'performance' ? 'export' : `${service}/findExportQueue`;
    return this.api.get({
      endpoint : `${this.baseEndpoint}/${exportPath}`
    }, this._handleParams(params).toJS()).then(data => {
      if (!imm.Iterable.isIterable(data)) {
        data = imm.Map({
          job_id : data
        });
      }
      return data.set('name', reportName).set('service', service);
    });
  }

  checkStatus(jobID, service) {
    let statusPath = service === 'performance' ? `${this.baseEndpoint}/status` : `export/download`;
    return this.api.get({
      endpoint: statusPath
    }, {job_id : jobID}).then(data => {
      return data.set('job_id', jobID);
    });
  }

  download(jobID) {
    return this.api.get({
      endpoint : `${this.baseEndpoint}/export/download`
    }, {job_id : jobID});
  }
}

module.exports = new ExportService();
