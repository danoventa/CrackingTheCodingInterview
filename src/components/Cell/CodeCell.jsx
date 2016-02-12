import React from 'react';

import Inputs from './Inputs';

import Immutable from 'immutable';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

import {
  updateCellOutputs,
  updateCellExecutionCount,
} from '../../actions';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../../api/messaging';

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
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    const { iopub, shell } = this.context.channels;

    if(!iopub || !shell) {
      // TODO: handle attempt to execute when kernel not connected
      return;
    }

    const executeRequest = createExecuteRequest(this.props.cell.get('source'));

    // Limitation of the Subject implementation in enchannel
    // we must shell.subscribe in order to shell.next
    shell.subscribe(() => {});

    // Set the current outputs to an empty list
    this.context.dispatch(updateCellOutputs(this.props.id, new Immutable.List()));

    const childMessages = iopub.childOf(executeRequest)
                               .publish()
                               .refCount();

    childMessages.ofMessageType(['execute_input'])
                 .pluck('content', 'execution_count')
                 .first()
                 .subscribe((ct) => {
                   this.context.dispatch(updateCellExecutionCount(this.props.id, ct));
                 });

    // Handle all the nbformattable messages
    childMessages
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error'])
         .map(msgSpecToNotebookFormat)
         // Iteratively reduce on the outputs
         .scan((outputs, output) => {
           return outputs.push(Immutable.fromJS(output));
         }, new Immutable.List())
         // Update the outputs with each change
         .subscribe(outputs => {
           this.context.dispatch(updateCellOutputs(this.props.id, outputs));
         });

    shell.next(executeRequest);

    // TODO: Manage subscriptions
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
