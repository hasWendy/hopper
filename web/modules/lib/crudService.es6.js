const imm = require('immutable');
const _ = require('lodash');

const {Template} = require('fnServiceLayer/dist/utils');

// Defining templates outside the class so they regexes don't get needlessly recompiled
// for each class.
const likeTemplate = new Template('#{0} like \'%#{1}%\'');
const equalTemplate = new Template('#{0} = #{1}');

export default class CrudService {

  constructor(api) {
    this._definition = imm.Map();
    this._defaultFields = imm.Map();
    this._lastModified = null;
    this.fields = imm.Map();
    this.api = api;
  }

  get name() {
    return this._name;
  }

  set defaultFields(val) {
    this._defaultFields = val;
  }

  set fields(val) {
    if (this._defaultFields.size === 0) {
      this._defaultFields = val;
    }
    this._fields = val;
  }

  get fields() {
    return this._fields;
  }

  resetFields() {
    this._fields = this._defaultFields;
  }

  /**
   * Maps parameters into useable states.
   *  - params.search will be expanded into a full text search based on the `fields` member and appended to filter.
   *  - params.fields will default to the `fields` member if it is not defined.
   *  - params.limit will default to 0 if not defined.
   * @param params {Immutable.Map<string | mixed>}
   * @returns {Immutable.Map<string | mixed>}
   * @private
   */
  _handleParams(params) {

    if (params.get('search')) {
      let outFilter = [];
      let filterInt = parseInt(params.get('search'), 10);

      this.fields.forEach((queryType, fieldName) => {
        if (queryType === 'like') {
          outFilter.push(likeTemplate.parse([fieldName, params.get('search')]));
        } else if (queryType === 'equal' && !_.isNaN(filterInt)) {
          outFilter.push(equalTemplate.parse([fieldName, filterInt]));
        }
      });

      // Append full text search to filters if they are defined

      params = params.withMutations(map => {
        map
          .set('filter', (params.has('filter') ? params.get('filter') + ' AND ' : '') +  outFilter.join(' OR '))
          .delete('search');
      });
    }

    return params.withMutations(map => {
      return map
        .set('fields', params.get('fields', this.fields.keySeq().join(',')))
        .set('limit', params.get('limit', 0))
        .delete('includeCount');
    });
  }

  find(params) {
    if (!params) {
      params = imm.Map();
    }

    let dataCall = (cnt) => {
      return this.api
        .get({
          endpoint : `${this.baseEndpoint}/find`
        }, this._handleParams(params).toJS())
        .then((data) => {
          let result = imm.Map({
            data     : data,
            metaData : params
          });
          if (cnt) {
            result = result.set('count', cnt);
          }
          if (data.has('errors')) {
            result = result.set('errors', data.get('errors'));
          }
          return result;
        });
    };

    if (params.has('includeCount')) {
      return this.count(params).then((cnt) => {
        let count = imm.Map.isMap(cnt) ? cnt.get('data', 0) : cnt;
        return dataCall(count);
      });
    }

    return dataCall();
  }

  count(params) {
    // we are going to make the assumption that count is only called when coupled with find,
    // and if count times out, find will also timeout, so we only handle timeout from find
    return this.api.get({
      endpoint : `${this.baseEndpoint}/count`
    }, this._handleParams(params).toJS());
  }

  save(params) {
    return this.api.get({
      endpoint : `${this.baseEndpoint}/save`
    }, params.toJS()).then(data => {
      this._lastModified = data;
      return data;
    });
  }

  remove(id) {
    if (!id) {
      return;
    }

    return this.api.post({
      endpoint : `${this.baseEndpoint}/delete`
    }, {
      id : id
    });
  }

  define() {
    if (!this._definition.size) {
      return this.api.get({
        endpoint: `${this.baseEndpoint}/define`
      }).then(data => {
        return this._definition = data;
      });
    }
    return new Promise((resolve) => {
      return resolve(this._definition);
    });
  }
}
