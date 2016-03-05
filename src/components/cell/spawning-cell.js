import React from 'react';

import DraggableCell from './draggable-cell';
import SpawnTool from './spawn-tool';

export default class SpawningCell extends React.Component {
  static displayName = 'SpawningCell';

  static propTypes = {
    id: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  state = {
    showTool: false,
    mouseOffset: 0,
  };

  render() {
    const spawnVisible = this.state.showTool;
    const spawnBefore = this.state.mouseOffset < 0.5;
    const spawnTool = <SpawnTool
      spawnBefore={spawnBefore}
      {...this.props} />;

    return (
      <div
        className='spawning-cell'
        onMouseMove={e=>this._handleMouseMove(e)}
        onMouseLeave={e=>this._handleMouseLeave(e)} >

        { spawnVisible && spawnBefore ? spawnTool : '' }
        <DraggableCell {...this.props} />
        { spawnVisible && !spawnBefore ? spawnTool : '' }
      </div>
    );
  }

  _handleMouseLeave() {
    this.setState({ showTool: false });
  }

  _handleMouseMove(mouseEvent) {
    const mouseOffset = this._getMouseOffset(mouseEvent);
    this.setState({ mouseOffset, showTool: true });
  }

  _getMouseOffset(mouseEvent) {
    const cell = this._getCell(mouseEvent.nativeEvent.target);
    const mouseY = mouseEvent.nativeEvent.clientY;
    const cellRect = cell.getBoundingClientRect();
    return (mouseY - cellRect.top) / (cellRect.bottom - cellRect.top);
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
