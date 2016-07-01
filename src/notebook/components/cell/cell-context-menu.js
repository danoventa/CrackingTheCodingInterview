import React from 'react';
import { ContextMenu, MenuItem, connect } from 'react-contextmenu';

import { clearCellOutput } from '../../actions';


class CellContextMenu extends React.Component {
  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor() {
    super();
    this.clearCellOutput = this.clearCellOutput.bind(this);
  }

  clearCellOutput(event, data) {
    this.context.store.dispatch(clearCellOutput(data.id));
  }

  render() {
    return (
      <ContextMenu identifier="cell-context-menu">
        <MenuItem onClick={this.clearCellOutput} data={{id: this.props.id}}>Clear Cell Output</MenuItem>
      </ContextMenu>
    );
  }
}

export default connect(CellContextMenu);
