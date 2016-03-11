import {Actions} from 'flummox';
import templateService from 'services/postbackTemplateService';
import pbPreferenceService from 'services/adNetworkPreferencesService';
import imm from 'immutable';

export default class PostbackTemplateActions extends Actions {

  getDefinition() {
    return templateService.define();
  }

  getTemplates(params) {
    return templateService.find(params);
  }

  getTemplateById(id) {
    return templateService.find(imm.Map({
      filter: `id=${id}`
    })).then((templateData) => {
      if (templateData.get('errors')) {
        return templateData;
      }
      let template = templateData.get('data').first();

      return pbPreferenceService.find(imm.Map({
        filter: `ad_network_postback_id=${template.get('id')}`
      })).then((prefsData) => {
        return template.set('preferences', prefsData.get('data', imm.fromJS([{
          preference  : 'postback',
          status      : 'active'
        }])));
      });
    });
  }

  saveTemplate(tpl) {
    return templateService.save(tpl.delete('created').delete('modified'));
  }

  saveTemplateWithPreferences(tpl) {
    let promises = imm.List();

    return templateService
      .save(tpl.delete('created').delete('modified').delete('preferences'))
      .then((savedTemplate) => {
        if (savedTemplate.get('errors')) {
          return savedTemplate;
        }
        promises = promises.merge(tpl.get('preferences')
          .filter((item) => {
            // filter out empty, unsaved items
            return item.has('id') || !!item.get('code');
          })
          .map((item, index) => {
            // delete items flagged as deleted, and also empty items already saved
            if (item.get('status') === 'deleted' || !item.get('code') && !item.get('name')) {
              return this.deleteTemplatePreferences(item.get('id'));
            }

            return this.saveTemplatePreferences(
              item
                .set('mobile_app_type', savedTemplate.get('os_type'))
                .set('ad_network_postback_id', Number(savedTemplate.get('id')))
            );
          })
        );

        return Promise.all(promises.toArray()).then((results) => {
          if (results.size && results.first().get('errors')) {
            return results.first();
          }

          return savedTemplate
            .set('preferences', imm.fromJS(results)
            .filter((item) => {
              // filter out null responses from api
              return item || false;
            }));
        });
      });
  }

  deleteTemplate(id) {
    return templateService.remove(String(id));
  }

  getTemplatePreferences(id) {
    return pbPreferenceService.find(imm.Map({
      filter: `ad_network_postback_id=${id}`
    }));
  }

  saveTemplatePreferences(tpl) {
    // reshape mobile_app_type field because MAT Api is case sensitive,
    // though it allows other fields with these keys to be of any case..
    let str = tpl.get('mobile_app_type');
    switch(str) {
      case 'iOS':
      case 'ios':
        tpl = tpl.set('mobile_app_type', 'iOS');
        break;
      default:
        tpl = tpl.set('mobile_app_type', `${str.charAt(0).toUpperCase()}${str.slice(1)}`);
        break;
    }
    return pbPreferenceService.save(tpl);
  }

  deleteTemplatePreferences(params) {
    return pbPreferenceService.remove(params);
  }

  getPostbackPreferences(params) {
    let baseParams = imm.fromJS({
      fields : [
        'id',
        'display',
        'code',
        'status',
        'options',
        'description',
        'ad_network_postback_id',
        'mobile_app_type'
      ],
      filter : 'preference="postback" and ad_network_postback_id is null and status="active"'
    });

    return pbPreferenceService.find(baseParams.merge(params));
  }

  getPostbackPreference(id) {
    return pbPreferenceService.find(imm.Map({
      'fields' : [
        'id',
        'display',
        'code',
        'status',
        'options',
        'description',
        'ad_network_postback_id',
        'mobile_app_type'
      ],
      'filter' : `id=${id} and ad_network_postback_id is null`,
      'limit'  : 1
    }));
  }

  savePostbackPreference(params) {
    let preference = params.set('preference', 'postback');
    let options = preference.get('options');
    if (options) {
      preference = preference.set('options', options.replace(/[\s]*,[\s/]*/g, ','));
    }
    return pbPreferenceService.save(preference);
  }

  deletePostbackPreference(id) {
    return pbPreferenceService.remove(id).then((data) => {
      return imm.Map({
        id   : id,
        data : data
      });
    });
  }

  reset(val) {
    // You must return a value from actions or else they do not trigger the dispatch.
    return val;
  }

  resetTemplate(val) {
    return val;
  }

  resetPreferences(val) {
    return val;
  }

}
