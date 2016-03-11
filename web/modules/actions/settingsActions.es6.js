import {Actions} from 'flummox';
import settingsService from 'services/settingsService';
import imm from 'immutable';

export default class SettingsActions extends Actions {

  getSettings() {
    try {
      return settingsService.read();
    } catch (e) {
      console.error('error in action', e);
    }
  }

  saveSettings(settings) {
    return settingsService.save(settings);
  }

}
