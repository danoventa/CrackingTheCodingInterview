import React from 'react';
import { ContextMenu, MenuItem, connect } from 'react-contextmenu';

import { clearCellOutput, changeType } from '../../actions';


class CellContextMenu extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    type: React.PropTypes.string,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor() {
    super();
    this.clearCellOutput = this.clearCellOutput.bind(this);
    this.changeType = this.changeType.bind(this);
  }

  clearCellOutput(event, data) {
    this.context.store.dispatch(clearCellOutput(data.id));
  }

  changeType(event, data) {
    const to = data.type === 'markdown' ? 'code' : 'markdown';
    this.context.store.dispatch(changeType(data.id, to));
  }

  render() {
    return (
      <ContextMenu identifier="cell-context-menu">
        <MenuItem
          onClick={this.clearCellOutput}
          data={{ id: this.props.id }}
        >
          Clear Cell Output
        </MenuItem>
        <MenuItem
          onClick={this.changeType}
          data={{ id: this.props.id, type: this.props.type }}
        >
            Convert to {this.props.type === 'markdown' ? 'Code' : 'Markdown'} Cell
        </MenuItem>
      </ContextMenu>
    );
  }
}

export default connect(CellContextMenu);
