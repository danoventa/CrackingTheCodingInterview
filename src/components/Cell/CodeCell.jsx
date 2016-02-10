import React from 'react';

import Inputs from './Inputs';

import Immutable from 'immutable';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

import { updateCellOutputs } from '../../actions';

import { createExecuteRequest } from '../../api/messaging';
import { msgSpecToNotebookFormat } from '../../api/prototype/output-reduction';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    cell: React.PropTypes.any,
    index: React.PropTypes.number,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
  };

  keyDown(e) {
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    const { iopub, shell } = this.context.channels;

    if(!iopub || !shell) {
      // TODO: handle attempt to execute when kernel not connected
      return;
    }

    const executeRequest = createExecuteRequest(this.props.cell.get('source'));

    shell.subscribe(() => {});

    iopub.childOf(executeRequest)
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error'])
         .map(msgSpecToNotebookFormat)
         .scan((outputs, output) => {
           return outputs.push(Immutable.fromJS(output));
         }, new Immutable.List())
         .subscribe(outputs => {
           this.context.dispatch(updateCellOutputs(this.props.index, outputs));
         });

    shell.next(executeRequest);

    // TODO: Manage subscriptions, trigger executionCount changes, more...
  }

  render() {
    return (
      <div className='code_cell'>
        <div className='input_area' onKeyDown={this.keyDown.bind(this)}>
          <Inputs executionCount={this.props.cell.get('execution_count')}/>
          <Editor
            index={this.props.index}
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
