import {Store} from 'flummox';
import imm from 'immutable';

export default class PbStore extends Store {

  constructor(flux) {
    super();

    const actionIds = flux.getActionIds('postbackTemplates');
    this.registerAsync(actionIds.getDefinition, this.definitionLoadingBegan, this.definitionResultsReceived);

    this.registerAsync(actionIds.getTemplates, this.templatesLoadingBegan, this.templatesResultsReceived);

    this.registerAsync(actionIds.getTemplateById, this.templateLoadingBegan, this.templateResultsReceived);
    this.registerAsync(actionIds.saveTemplate, this.templateToggleStatusBegan, this.templateToggleStatusComplete);
    this.registerAsync(actionIds.saveTemplateWithPreferences, this.templateWithPrefsSaveBegan, this.templateWithPrefsSaveComplete);
    this.registerAsync(actionIds.deleteTemplate, this.templateDeleteBegan, this.templateDeleteComplete);

    this.registerAsync(actionIds.getTemplatePreferences, this.preferencesLoadingBegan, this.preferencesResultsReceived);
    this.registerAsync(actionIds.saveTemplatePreferences, this.preferencesSaveBegan, this.preferencesSaveComplete);
    this.registerAsync(actionIds.deleteTemplatePreferences, this.preferencesDeleteBegan, this.preferencesDeleteComplete);

    this.register(actionIds.resetTemplate, this.resetTemplate);
    this.register(actionIds.resetPreferences, this.resetPreferences);
    this.register(actionIds.reset, this.reset);

    this.registerAsync(actionIds.getPostbackPreferences, this.preferencesLoadingBegan, this.globalPreferencesResultsReceived);
    this.registerAsync(actionIds.getPostbackPreference, this.preferencesLoadingBegan, this.globalPreferencesResultsReceived);
    this.registerAsync(actionIds.savePostbackPreference, this.preferencesSaveBegan, this.globalPreferenceSaveComplete);
    this.registerAsync(actionIds.deletePostbackPreference, this.preferencesDeleteBegan, this.preferenceDeleteComplete);

    this.state = {
      // definition
      loadingDefinition   : false,
      definition          : imm.Map(),

      // templates
      loadingTemplates    : false,
      templates           : imm.List(),
      pagedTemplates      : imm.List(),
      templateCount       : 0,

      // template
      loadingTemplate     : false,
      savingTemplate      : false,
      deletingTemplate    : false,
      savedTemplate       : false,
      deletedTemplate     : false,
      template            : imm.Map(),

      // template preferences
      loadingPreferences  : false,
      savingPreferences   : false,
      deletingPreferences : false,
      savedPreferences    : false,
      deletedPreferences  : false,
      preferences         : imm.List(),
      preferencesCount    : 0,

      // global preferences
      globalPreferences      : imm.List(),
      globalPreferencesCount : 0,

      // errors
      errors              : imm.List(),
      preferencesErrors   : imm.List()
    };
  }

  // definition
  definitionLoadingBegan() {
    this.setState({loadingDefinition : true})
  }
  definitionResultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingDefinition: false});
    }

    let newState = {
      loadingDefinition : false,
      definition        : res
    };

    this.setState(newState);
  }

  // templates
  templatesLoadingBegan() {
    this.setState({loadingTemplates : true});
  }
  templatesResultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingTemplates: false});
    }

    let newState = {
      loadingTemplates : false,
      errors           : res.get('errors', imm.List())
    };

    if (res.hasIn(['metaData', 'limit'])) {
      newState.pagedTemplates = res.get('data', imm.List());
    } else {
      newState.templates = res.get('data', imm.List());
    }

    newState.templateCount = res.get('count', 0);
    this.setState(newState);
  }

  // template
  templateLoadingBegan() {
    this.setState({loadingTemplate : true});
  }
  templateResultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingTemplate: false});
    }

    let newState = {
      loadingTemplate : false,
      template        : res,
      errors          : res.get('errors', imm.List())
    };

    this.setState(newState);
  }
  templateToggleStatusBegan(res) {
    if (!imm.Map.isMap(res)) {
      res = imm.fromJS(res);
    }
    let newState = {};

    if (res.has('actionArgs') && res.get('actionArgs').size) {
      let tpl = res.get('actionArgs').get(0);
      let tplProp = this.state.pagedTemplates.size ? 'pagedTemplates' : 'templates';
      let templates = this.state[tplProp];

      if (templates.size) {
        templates = templates.update(
          templates.findIndex((item) => {
            return item.get('id') === tpl.get('id');
          }),
          (item) => {
            return item.set('all_sites', tpl.get('all_sites'));
          }
        );
        newState[tplProp] = templates;
      }
      this.setState(newState);
    }
  }
  templateToggleStatusComplete(res) {
    this.setState({
      template : res,
      errors   : res.get('errors', imm.List())
    });
  }
  templateWithPrefsSaveBegan() {
    this.setState({
      savingTemplate    : true,
      savingPreferences : true
    });
  }
  templateWithPrefsSaveComplete(res) {
    this.setState({
      savingTemplate    : false,
      savingPreferences : false,
      savedTemplate     : res.get('errors') ? false : true,
      savedPreferences  : res.get('errors') ? false : true,
      template          : res,
      errors            : res.get('errors', imm.List())
    });
  }
  templateDeleteBegan() {
    this.setState({
      deletingTemplate : true
    })
  }
  templateDeleteComplete(res) {
    this.setState({
      deletingTemplate : false,
      deletedTemplate  : res,
      errors           : res.get('errors', imm.List())
    });
  }

  // template preferences
  preferencesLoadingBegan() {
    this.setState({loadingPreferences : true});
  }
  preferencesResultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingPreferences: false});
    }

    this.setState({
      preferences         : res.get('data', imm.List()),
      loadingPreferences  : false,
      preferencesCount    : res.get('count', 0),
      preferencesErrors   : res.get('errors', imm.List())
    });
  }
  preferencesSaveBegan() {
    this.setState({savingPreferences : true});
  }
  preferencesSaveComplete(res) {
    this.setState({
      savingPreferences : false,
      savedPreferences  : res.get('errors') ? false : true,
      preferences       : res,
      preferencesErrors : res.get('errors', imm.List())
    })
  }
  preferencesDeleteBegan() {
    this.setState({deletingPreferences : true});
  }
  preferencesDeleteComplete(res) {
    // set .deletedPreferences to res?
  }
  // when we want an update after deleting a single preference
  preferenceDeleteComplete(res) {
    let deletedPref = this.state.preferences.findIndex(item => {
      return item.get('id') === res.get('id');
    });

    let preferences = this.state.preferences;
    let data = res.get('data', imm.List());

    this.setState({
      deletingPreferences : false,
      deletedPreferences  : data.get('errors') ? false : true,
      preferences         : data.get('errors') ? preferences : preferences.delete(deletedPref),
      preferencesErrors   : data.get('errors', imm.List())
    });
  }

  globalPreferencesResultsReceived(res) {
    if (typeof res === 'undefined') {
      return this.setState({loadingPreferences: false});
    }

    this.setState({
      globalPreferences      : res.get('data', imm.List()),
      loadingPreferences     : false,
      globalPreferencesCount : res.get('count', 0),
      preferencesErrors      : res.get('errors', imm.List())
    });
  }
  globalPreferenceSaveComplete(res) {
    this.setState({
      savingPreferences : false,
      savedPreferences  : res.get('errors') ? false : true,
      globalPreferences : res,
      preferencesErrors : res.get('errors', imm.List())
    })
  }

  resetTemplate() {
    this.setState({
      loadingTemplate     : false,
      savingTemplate      : false,
      deletingTemplate    : false,
      savedTemplate       : false,
      deletedTemplate     : false,
      template            : imm.Map()
    })
  }

  resetPreferences() {
    this.setState({
      loadingPreferences  : false,
      savingPreferences   : false,
      deletingPreferences : false,
      savedPreferences    : false,
      deletedPreferences  : false,
      preferences         : imm.List(),
      preferencesCount    : 0
    })
  }

  reset(val) {
    this.setState({
      // templates
      loadingTemplates    : val === 'page',
      templates           : imm.List(),
      pagedTemplates      : imm.List(),
      templateCount       : val === 'page' ? this.state.templateCount : 0,

      // template
      loadingTemplate     : val === 'page',
      savingTemplate      : false,
      deletingTemplate    : false,
      savedTemplate       : false,
      deletedTemplate     : false,
      template            : imm.Map(),

      // template preferences
      loadingPreferences  : val === 'page',
      savingPreferences   : false,
      deletingPreferences : false,
      savedPreferences    : false,
      deletedPreferences  : false,
      preferences         : imm.List(),
      preferencesCount    : val === 'page' ? this.state.preferencesCount : 0,

      // global preferences
      globalPreferences      : imm.List(),
      globalPreferencesCount : val === 'page' ? this.state.globalPreferencesCount : 0,

      // errors
      errors              : imm.List(),
      preferencesErrors   : imm.List()
    });
  }
}
