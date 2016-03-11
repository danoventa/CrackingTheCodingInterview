import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';

import Immutable from 'immutable';

import {
  executeCell,
} from '../../actions';

export default class CodeCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    id: React.PropTypes.string,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.keyDown = this.keyDown.bind(this);
  }

  keyDown(e) {
    if (e.key !== 'Enter') {
      return;
    }

    const shiftXORctrl = (e.shiftKey || e.ctrlKey) && !(e.shiftKey && e.ctrlKey);
    if (!shiftXORctrl) {
      return;
    }

    if (e.shiftKey) {
      // TODO: Remove this, as it should be created if at the end of document only
      // this.context.dispatch(createCellAfter('code', this.props.id));

      // should instead be
      // this.context.dispatch(nextCell(this.props.id));
    }

    this.context.dispatch(executeCell(this.props.id,
                                      this.props.cell.get('source')));
  }

  render() {
    return (
      <div className="code_cell">
        <div className="input_area" onKeyDown={this.keyDown}>
          <Inputs executionCount={this.props.cell.get('execution_count')} />
          <Editor
            id={this.props.id}
            input={this.props.cell.get('source')}
            language={this.props.language}
          />
        </div>
        <Display
          className="cell_display"
          outputs={this.props.cell.get('outputs')}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
        />
      </div>
    );
  }
}
