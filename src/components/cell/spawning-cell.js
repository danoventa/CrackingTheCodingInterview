import React from 'react';

import DraggableCell from './draggable-cell';

import { setSelected } from '../../actions';

export default class SpawningCell extends React.Component {
  static displayName = 'SpawningCell';

  static propTypes = {
    id: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  render() {
    return (
      <div className='spawning-cell'>
        <DraggableCell {...this.props}/>
      </div>
    );
  }

  _getCell(htmlElement) {
    if (!htmlElement) {
      return null;
    }

    if (htmlElement.classList.contains('spawning-cell')) {
      return htmlElement;
    }
    return this._getCell(htmlElement.parentElement);
  }
}
