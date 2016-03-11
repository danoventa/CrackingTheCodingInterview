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

  constructor() {
    super();
    this.createCodeCell = this.createCell.bind(this, 'code');
    this.createTextCell = this.createCell.bind(this, 'markdown');
    this.createCell = this.createCell.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  createCell(type) {
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

  render() {
    return (
      <div className="creator-tool">
        <button onClick={this.createTextCell} title="create text cell">
          <i className="material-icons">art_track</i>
        </button>
        <span className="creator-label">Add cell</span>
        <button onClick={this.createCodeCell} title="create code cell">
          <i className="material-icons">code</i>
        </button>
      </div>
    );
  }

}
