import React from 'react';

import { executeCell, removeCell } from '../../actions';

class Toolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  removeCell() {
    this.context.dispatch(removeCell(this.props.id));
  }

  executeCell() {
    this.context.dispatch(executeCell(this.context.channels,
                                      this.props.id,
                                      this.props.cell.get('source')));
  }

  render() {
    return (
      <div className="cell_toolbar-mask">
        <div className="cell_toolbar">
          <button onClick={this.executeCell}>
            <i className="material-icons">play_arrow</i>
          </button>
          <button onClick={this.removeCell}>
            <i className="material-icons">delete</i>
          </button>
        </div>
      </div>
    );
  }
}

export default Toolbar;
