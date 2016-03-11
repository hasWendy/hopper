const Immutable = require('immutable');
const React = require('react');
const {autobind} = require('lib/decorators');

const is = Immutable.is.bind(Immutable);

function shallowEqualImmutable(objA, objB) {
  if (objA === objB || is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  let keysA = Object.keys(objA);
  let keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  let bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  for (let i = 0; i < keysA.length; i++)  {
    if (!bHasOwnProperty(keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]]))  return false;
  }
  return true;
}

@autobind
export default class BaseComponent extends React.Component {

  static get contextTypes() {
    return {
      router : React.PropTypes.func,
      flux   : React.PropTypes.any
    };
  }


  getFlux() {
    return this.props.flux || this.context.flux;
  }

  // @TODO - remove all setTimeout wraps on setBreadcrumb
  // https://jira.corp.tune.com/browse/TPC-90
  setBreadcrumb(path) {
    setTimeout(() => {
      this.getFlux().getActions('navigation').pathChanged(path);
    });
  }


  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }
}
