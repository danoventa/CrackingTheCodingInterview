import React from 'react';

import { createCellAfter, createCellBefore, createCellAppend } from '../../actions';

export default class CellCreatorButtons extends React.Component {
  static propTypes = {
    above: React.PropTypes.bool,
    id: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  render() {
    return (
      <div className='creator-tool'>
        <button onClick={this._createTextCell.bind(this)} title="create text cell">
          <i className='material-icons'>art_track</i>
        </button>
        <span className='creator-label'>Add cell</span>
        <button onClick={this._createCodeCell.bind(this)} title="create code cell">
          <i className='material-icons'>code</i>
        </button>
      </div>
    );
  }

  _createCodeCell() {
    this._createCell('code');
  }

  _createTextCell() {
    this._createCell('markdown');
  }

  _createCell(type) {
    if (!this.props.id) {
      this.context.dispatch(createCellAppend(type));
      return;
    }

    if (this.props.above) {
      this.context.dispatch(createCellBefore(type, this.props.id));
    } else {
      this.context.dispatch(createCellAfter(type, this.props.id));
    }
  }
}
