import React from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import { executeCell } from '../../epics/execute';

import {
  removeCell,
  toggleStickyCell,
  clearCellOutput,
  changeOutputVisibility,
  changeInputVisibility,
  changeCellType,
} from '../../actions';

const mapStateToProps = (state) => ({
  channels: state.app.channels,
});

export class DumbToolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    channels: React.PropTypes.object,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearCellOutput = this.clearCellOutput.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  toggleStickyCell() {
    this.context.store.dispatch(toggleStickyCell(this.props.id));
  }

  removeCell() {
    this.context.store.dispatch(removeCell(this.props.id));
  }

  executeCell() {
    this.context.store.dispatch(executeCell(
                                      this.props.id,
                                      this.props.cell.get('source')));
  }

  clearCellOutput() {
    this.refs.dropdown.hide();
    this.context.store.dispatch(clearCellOutput(this.props.id));
  }

  changeInputVisibility() {
    this.refs.dropdown.hide();
    this.context.store.dispatch(changeInputVisibility(this.props.id));
  }

  changeOutputVisibility() {
    this.refs.dropdown.hide();
    this.context.store.dispatch(changeOutputVisibility(this.props.id));
  }

  changeCellType() {
    this.refs.dropdown.hide();
    const to = this.props.type === 'markdown' ? 'code' : 'markdown';
    this.context.store.dispatch(changeCellType(this.props.id, to));
  }

  render() {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask" ref="mask">
        <div className="cell-toolbar">
          {showPlay &&
            <span>
              <button onClick={this.executeCell} className="executeButton" >
                <span className="octicon octicon-triangle-right" />
              </button>
            </span>}
          <button onClick={this.removeCell}>
            <span className="octicon octicon-trashcan" />
          </button>
          <button onClick={this.toggleStickyCell}>
            <span className="octicon octicon-pin" />
          </button>
          <Dropdown ref="dropdown">
            <DropdownTrigger>
              <button>
                <span className="octicon octicon-chevron-down" />
              </button>
            </DropdownTrigger>
            <DropdownContent ref="DropdownContent">
              <ul>
                <li onClick={this.clearCellOutput}>
                  <a>Clear Cell Output</a>
                </li>
                <li onClick={this.changeInputVisibility}>
                  <a>Toggle Input Visibility</a>
                </li>
                <li onClick={this.changeOutputVisibility}>
                  <a>Toggle Output Visibility</a>
                </li>
                <li onClick={this.changeCellType}>
                  <a>
                  Convert to {this.props.type === 'markdown' ? 'Code' : 'Markdown'} Cell
                  </a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DumbToolbar);
