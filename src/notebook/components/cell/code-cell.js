import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';

import Immutable from 'immutable';

const CodeCell = (props) => (
  <div className="code_cell">
    <div className="input_area">
      <Inputs executionCount={props.cell.get('execution_count')} />
      <Editor
        id={props.id}
        input={props.cell.get('source')}
        language={props.language}
        focused={props.id === props.focusedCell}
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

CodeCell.propTypes = {
  cell: React.PropTypes.any,
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  id: React.PropTypes.string,
  language: React.PropTypes.string,
  theme: React.PropTypes.string,
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  focusedCell: React.PropTypes.string,
};

export default CodeCell;
