import React from 'react';

class Notebook extends React.Component {
  static propTypes = {
    kernelConnected: React.PropTypes.bool,
  };
  constructor() {
    super();
  }

  render() {
    return
      <div className="status-bar">
        <p>
          
        </p>
      </div>
  }
}
