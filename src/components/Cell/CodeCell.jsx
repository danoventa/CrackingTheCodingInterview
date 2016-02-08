import React from 'react';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    cell: React.PropTypes.any,
    index: React.PropTypes.number,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
  };

  render() {
    return (
      <div>
        <Editor
          index={this.props.index}
          input={this.props.cell.get('source')}
          language={this.props.language}
        />
        <Display className='cell_display'
                 outputs={this.props.cell.get('outputs')}
        />
      </div>
    );
  }
}
