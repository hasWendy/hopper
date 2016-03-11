import React from 'react';
import classnames from 'classnames';
import DotsLoadingIndicator from 'txl/progress-indicators/DotsLoadingIndicator';
import LoadingIndicator from 'txl/progress-indicators/LoadingIndicator';
import {COLOR_ACCENT} from 'txl/styles/theme';
import {combineStyles} from 'txl/styles/helpers';
import {LAYER_2} from '../../../styles/layers';

function getLoader (props) {
  return (props.type === 'dots')
    ? <DotsLoadingIndicator/>
    : <LoadingIndicator size={props.size || 'large'} color={COLOR_ACCENT['500']}/>;
}

class LoadingState extends React.Component {

  render() {
    return (
      <div
        style={combineStyles(INDICATOR_STYLES.loader, LAYER_2, (!this.props.exporting && INDICATOR_STYLES.center), (this.props.loading && INDICATOR_STYLES.loading))}>
        {getLoader(this.props)}
      </div>
    )
  }
}

const INDICATOR_STYLES = {
  loader  : {
    background : 'rgba(255, 255, 255, 0.75)',
    opacity    : '0',
    position   : 'absolute',
    height     : '100%',
    width      : '100%',
    left       : 0,
    top        : 0,
    visibility : 'hidden',
    transition : 'opacity .25s, visibility .25s'
  },
  center  : {
    display        : 'flex',
    justifyContent : 'center',
    alignItems     : 'center'
  },
  loading : {
    opacity    : '1',
    visibility : 'visible'
  }
};

// TODO: Make store aware
export default LoadingState;
