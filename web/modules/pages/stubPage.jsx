import React from 'react';


export default React.createClass({

  render: function() {
    return <div>
      <h2>I am a page that does not have a file yet.</h2>
      <h4>As such, you're seeing the default stub page.</h4>
      <pre>this.props.params: {JSON.stringify(this.props.params, null, 2)}</pre>
    </div>
  }
})
