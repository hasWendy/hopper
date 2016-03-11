/**
 * DefinitionList
 *
 * Author: @hasErico
 *
 * PropTypes
 *   map          : Map<string:object> : Map of key:value pairs to display, or List of Maps with keys: key, value
 *   itemTemplate : cellTemplate render function, must return .t-definition-list-item > .child + .child
 */

const React = require('react');
const imm = require('immutable');
const {autobind} = require('lib/decorators');
const BaseComponent = require('lib/baseComponent');
const classnames = require('classnames');

require('./DefinitionList.less');

@autobind
export default class DefinitionList extends BaseComponent {
  constructor(props) {
    super(props);
  }

  // a provided itemTemplate renderer should match this style
  defaultTemplate(key, value) {
    return (
      <div className="t-definition-list-item" style={this.props.style} key={key}>
        <div className="child">{key}</div>
        <div className="child">{value}</div>
      </div>
    )
  }

  renderList() {
    // for each item, call template render function
    if(imm.Map.isMap(this.props.map)) {
      return this.props.map.map((value, key) => {
        if(this.props.itemTemplate) {
          return this.props.itemTemplate(key, value);
        }

        return this.defaultTemplate(key, value);
      });
    } else if(imm.List.isList(this.props.map)) {
      return this.props.map.map((map) => {
        if(this.props.itemTemplate) {
          return this.props.itemTemplate(map.get('key'), map.get('value'));
        }

        return this.defaultTemplate(map.get('key'), map.get('value'));
      });
    }
  }

  render() {
    return (
      <div className={classnames('t-definition-list', this.props.className)}>
        {this.renderList()}
      </div>
    )
  }
}
