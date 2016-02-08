import React from 'react';

export default class Inputs extends React.Component {
  static displayName = 'Inputs';

  static propTypes = {
    index: React.PropTypes.any
  };

  render() {
    return (
      <div className="cell_inputs">
        [{this.props.index}]
      </div>
    );
  }
}
