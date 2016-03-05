import React from 'react';

import CellCreatorButtons from './cell-creator-buttons';

export default class CellCreator extends React.Component {
  static displayName = 'CellCreator';

  static propTypes = {
    above: React.PropTypes.bool,
    id: React.PropTypes.string,
  };

  state = {
    show: false,
  };

  render() {
    return (
      <div className='creator-hover-mask'>
        <div
          className='creator-hover-region'
          onMouseEnter={() => this.setState({ show: true }) }
          onMouseLeave={() => this.setState({ show: false }) }>

          {this.state.show || this.props.id === null ? (<CellCreatorButtons {...this.props} />) : ''}
        </div>
      </div>);
  }
}
