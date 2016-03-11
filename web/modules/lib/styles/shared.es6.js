import {PACIFIC_STORM as color} from 'txl/styles/palettes';
import {gridUnits as gu} from 'txl/styles/helpers';

const STYLES = {
  '.t-input-free-form': {
    '.form': {
      padding       : 0,
      display       : 'flex',
      justifyContent: 'space-between',
      alignItems    : 'center',
      borderBottom  : `1px solid ${color['100']}`
    },
    '.input': {
      flex  : '1 1 auto',
      border: 'none'
    },
    '.icon-container': {
      flex       : '0 0 auto',
      marginRight: gu(1)
    },
    '.list-item-container': {
      maxHeight : gu(42),
      overflow  : 'auto'
    },
    '.list-item': {
      alignItems    : 'center',
      display       : 'flex',
      justifyContent: 'space-between',
      padding       : `0 ${gu(1)}`,
    },
    '.list-item-label': {
      padding: gu(1)
    }
  }
}

export default STYLES
