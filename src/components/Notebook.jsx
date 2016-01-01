import React from 'react';

import Cell from './Cell';

export default class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    cells: React.PropTypes.any,
    language: React.PropTypes.string,
  };

  render() {
    return (
      <div ref='cells'>
      {
        this.props.cells.map((cell, index) => {
          return <Cell input={cell.source}
                       language={this.props.language}
                       outputs={cell.outputs}
                       key={index}
                       />;
        })
      }
      </div>
    );
  }
}
