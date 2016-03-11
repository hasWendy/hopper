const React = require('react');
const {connectToStores, autobind} = require('lib/decorators');
const imm = require('immutable');
const BaseComponent = require('lib/baseComponent');

require('./PrettyPrint.less');

const jsonPrint = {
  replacer: function(match, pIndent, pKey, pVal, pEnd) {
    let key = '<span class=json-key>';
    let val = '<span class=json-value>';
    let str = '<span class=json-string>';
    let r = pIndent || '';

    if (pKey)
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    if (pVal)
      r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
    return r + (pEnd || '');
  },

  prettyPrint: function(obj) {
    let jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
    return JSON.stringify(obj, null, 2)
      .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(jsonLine, jsonPrint.replacer);
  }
};


export default class PrettyPrint extends BaseComponent {
  render() {
    let {code} = this.props;
    code = typeof code === 'undefined' ? {} : code;
    code = code.toJS ? code.toJS() : code;

    let output = () => {
      return {
        __html: jsonPrint.prettyPrint(code)
      }
    };

    return <pre className='json-format'
                dangerouslySetInnerHTML={output()}></pre>
  }
}
