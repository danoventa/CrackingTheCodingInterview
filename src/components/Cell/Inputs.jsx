import React from 'react';

export default class Inputs extends React.Component {
  static displayName = 'Inputs';

  static propTypes = {
    executionCount: React.PropTypes.number,
  };

  render() {
    return (
      <div className='cell_inputs'>
        [{ !this.props.executionCount ? ' ' : this.props.executionCount }]
      </div>
    );
  }
}
