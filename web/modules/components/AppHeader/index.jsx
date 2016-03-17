import React from 'react/addons';
import Header from 'txl/header/Header';
import moment from 'moment';

export default class AppHeader extends React.Component {
  constructor(props) {
    super(props);

    this.date = moment().format('LL');
  }

  render() {

    let styles = {
      tHeader : {
        position : 'fixed',
        left     : '0',
        top      : '0',
        width    : '100vw',
      }
    };

    let hopper = "HOPPER - HasOffers Perspective into Product Event Report | " + this.date;
    let hopperMsg = '"Life was simple before World War II. After that, we had systems."  - Grace Hopper';

    return (
      <div style={styles.tHeader}>
        <Header
          ref='header'
          product='TMC'
          logo={{}}
          title={hopper}
          client={hopperMsg}>
        </Header>
      </div>
    );
  }
}
