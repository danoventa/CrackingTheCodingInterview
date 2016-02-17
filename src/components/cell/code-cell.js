import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';

import {
  executeCell,
  createCellAfterActive,
} from '../../actions';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
  };

  keyDown(e) {
    if (!e.shiftKey || !e.ctrlKey || e.key !== 'Enter') {
      return;
    }

    if (e.shiftKey) {
      this.context.dispatch(createCellAfterActive('code'));
    }

    this.context.dispatch(executeCell(this.props.id,
                                      this.props.cell.get('source')));
  }

  render() {
    return (
      <div className='code_cell'>
        <div className='input_area' onKeyDown={this.keyDown.bind(this)}>
          <Inputs executionCount={this.props.cell.get('execution_count')}/>
          <Editor
            id={this.props.id}
            input={this.props.cell.get('source')}
            language={this.props.language}
          />
        </div>
        <Display className='cell_display'
                 outputs={this.props.cell.get('outputs')}
        />
      </div>
    );
  }
}
