import React from 'react';

import Cell from './Cell';

export default class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    cells: React.PropTypes.any,
    language: React.PropTypes.string,
  };

  componentWillMount() {
    const lang = this.props.language;
    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require('codemirror/mode/' + lang + '/' + lang);
    // Assume markdown should be required
    require('codemirror/mode/markdown/markdown');
  }

  render() {
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref='cells'>
      {
        this.props.cells.map((cell, index) => {
          return <Cell input={cell.get('source')}
                       language={this.props.language}
                       outputs={cell.get('outputs')}
                       type={cell.get('cell_type')}
                       key={index}
                       />;
        })
      }
      </div>
    );
  }
}
