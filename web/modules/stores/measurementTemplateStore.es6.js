import {Store} from 'flummox';
import imm from 'immutable';

export default class MeasurementTemplateStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('measurementTemplates');
    this.register(actionIds.reset, this.reset);
    this.registerAsync(actionIds.getTemplateById, this.loadingBegan, this.templateReceived);
    this.registerAsync(actionIds.getDefinition, this.defineBegan, this.defineReceived);
    this.registerAsync(actionIds.getMeasurementTemplates, this.loadingBegan, this.resultsReceived);
    this.registerAsync(actionIds.saveTemplate, this.saveBegan, this.saveComplete);
    this.registerAsync(actionIds.deleteTemplate, this.deleteBegan, this.deleteComplete);

    this.state = {
      loading                     : false,
      measurementTemplates        : imm.List(),
      pagedMeasurementTemplates   : imm.List(),
      count                       : 0,
      saving                      : false,
      saved                       : false,
      deleting                    : false,
      deleted                     : false,
      definition                  : imm.Map(),
      loadingDefinition           : false,
      template                    : imm.Map(),
      errors                      : imm.List()
    };
  }

  defineBegan() {
    this.setState({loadingDefinition: true});
  }

  defineReceived(res) {
    this.setState({loadingDefinition: false, definition: res});
  }

  resultsReceived(res) {
    if (typeof res === 'undefined') {
      this.setState({
        loading : false
      });
      return;
    };
    let newState = {
      loading : false,
      errors  : res.get('errors', imm.List())
    };

    if (res.hasIn(['metaData', 'limit'])) {
      newState.pagedMeasurementTemplates = res.get('data', imm.List());
    } else {
      newState.measurementTemplates = res.get('data', imm.List());
    }

    newState.count = res.get('count', 0);
    this.setState(newState);
  }

  loadingBegan() {
    this.setState({loading : true});
  }

  templateReceived(res) {
    this.setState({
      loading   : false,
      template  : res.get('data', imm.Map()).first(),
      errors    : res.get('errors', imm.List())
    });
  }

  saveBegan(res) {
    if (!imm.Map.isMap(res)) {
      res = imm.fromJS(res);
    }
    let newState = {saving : true, errors: imm.List()};
    if (res.has('actionArgs') && res.get('actionArgs').size) {
      let tpl = res.get('actionArgs').get(0);
      let tplProp = this.state.pagedMeasurementTemplates.size ? 'pagedMeasurementTemplates' : 'measurementTemplates';
      let templates = this.state[tplProp];

      if(templates.size) {
        templates = templates.update(
          templates.findIndex((item) => {
            return item.get('id') === tpl.get('id');
          }),
          (item) => {
            return item.set('status', tpl.get('status'));
          }
        );
        newState[tplProp] = templates;
      }
    }
    this.setState(newState);
  }

  saveComplete(res) {
    this.setState({
      saving   : false,
      saved    : res.get('errors') ? false : true,
      template : res,
      errors   : res.get('errors', imm.List())
    });
  }

  deleteBegan() {
    this.setState({deleting: true});
  }

  deleteComplete(res) {
    this.setState({
      deleting  : false,
      deleted   : res.get('errors') ? false : true,
      errors    : res.get('errors', imm.List())
    });
  }

  reset(val) {
    this.setState({
      loading                     : val === 'page',
      measurementTemplates        : imm.List(),
      pagedMeasurementTemplates   : imm.List(),
      count                       : val === 'page' ? this.state.count : 0,
      saving                      : false,
      saved                       : false,
      deleting                    : false,
      deleted                     : false,
      template                    : imm.Map(),
      errors                      : imm.List()
    });
  }
}
