import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';

import Immutable from 'immutable';

import {
  executeCell,
} from '../../actions';

const CodeCell = (props, context) => {
  function keyDown(e) {
    if (e.key !== 'Enter') {
      return;
    }

    const shiftXORctrl = (e.shiftKey || e.ctrlKey) && !(e.shiftKey && e.ctrlKey);
    if (!shiftXORctrl) {
      return;
    }

    if (e.shiftKey) {
      // TODO: Remove this, as it should be created if at the end of document only
      // this.context.dispatch(createCellAfter('code', props.id));

      // should instead be
      // this.context.dispatch(nextCell(props.id));
    }

    context.dispatch(executeCell(context.channels,
                                 props.id,
                                 props.cell.get('source')));
  }

  return (
    <div className="code_cell">
      <div className="input_area" onKeyDown={keyDown}>
        <Inputs executionCount={props.cell.get('execution_count')} />
        <Editor
          id={props.id}
          input={props.cell.get('source')}
          language={props.language}
        />
      </div>
      <Display
        className="cell_display"
        outputs={props.cell.get('outputs')}
        displayOrder={props.displayOrder}
        transforms={props.transforms}
      />
    </div>
  );
};

CodeCell.propTypes = {
  cell: React.PropTypes.any,
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  id: React.PropTypes.string,
  language: React.PropTypes.string,
  theme: React.PropTypes.string,
  transforms: React.PropTypes.instanceOf(Immutable.Map),
};

CodeCell.contextTypes = {
  channels: React.PropTypes.object,
  dispatch: React.PropTypes.func,
};

export default CodeCell;
