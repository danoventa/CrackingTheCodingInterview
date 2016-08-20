import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import { executeCell } from '../../epics/execute';

import {
  removeCell,
  toggleStickyCell,
  clearCellOutput,
  splitCell,
  changeOutputVisibility,
} from '../../actions';

const mapStateToProps = (state) => ({
  channels: state.app.channels,
  notificationSystem: state.app.notificationSystem,
  kernelConnected: state.app.channels &&
    !(state.app.executionState === 'starting' ||
      state.app.executionState === 'not connected'),
});

export class Toolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    channels: React.PropTypes.object,
    id: React.PropTypes.string,
    kernelConnected: React.PropTypes.bool,
    notificationSystem: React.PropTypes.any,
    type: React.PropTypes.string,
    setHoverState: React.PropTypes.func,
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
    this.splitCell = this.splitCell.bind(this);
    this.setHoverState = this.setHoverState.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
  }

  componentWillMount() {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.setHoverState, false);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.setHoverState);
  }

  setHoverState(mouseEvent) {
    if (this.refs.mask) {
      const mask = ReactDOM.findDOMNode(this.refs.mask);
      if (mask) {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        const regionRect = mask.getBoundingClientRect();
        const hover = (regionRect.left < x && x < regionRect.right) &&
                     (regionRect.top < y && y < regionRect.bottom);
        this.props.setHoverState(hover);
      }
    }
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
                                      this.props.cell.get('source'),
                                      this.props.kernelConnected,
                                      this.props.notificationSystem));
  }

  clearCellOutput() {
    this.context.store.dispatch(clearCellOutput(this.props.id));
  }

  splitCell() {
    this.context.store.dispatch(splitCell(this.props.id, 0));
  }

  changeOutputVisibility() {
    this.context.store.dispatch(changeOutputVisibility(this.props.id));
  }

  render() {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask" ref="mask">
        <div className="cell-toolbar">
          {showPlay &&
            <span>
              <button onClick={this.executeCell}>
                <span className="octicon octicon-triangle-right" />
              </button>
            </span>}
          <button onClick={this.removeCell}>
            <span className="octicon octicon-trashcan" />
          </button>
          <button onClick={this.splitCell}>
            <span className="octicon octicon-unfold" />
          </button>
          <button onClick={this.toggleStickyCell}>
            <span className="octicon octicon-pin" />
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Toolbar);
