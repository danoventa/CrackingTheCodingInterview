import React from 'react';

import Cell from './Cell';

export default class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    channels: React.PropTypes.any,
    notebook: React.PropTypes.any,
    onCellChange: React.PropTypes.func,
    selected: React.PropTypes.array,
  };

  static childContextTypes = {
    channels: React.PropTypes.object,
  };

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentWillMount() {
    require('codemirror/mode/markdown/markdown');

    const lang = this.props.notebook.getIn(['metadata', 'language_info', 'name']);
    if (!lang) {
      return;
    }
    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require('codemirror/mode/' + lang + '/' + lang);
    // Assume markdown should be required
  }

  render() {
    const cellMap = this.props.notebook.get('cellMap');
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref='cells'>

      {
        cellOrder.map(id => {
          const selected = this.props.selected.indexOf(id) !== -1;
          return <Cell cell={cellMap.get(id)}
                       language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
                       id={id}
                       key={id}
                       isSelected={selected}
                       onTextChange={text => {
                         const newCell = cellMap.get(id).set('source', text);
                         this.props.onCellChange(id, newCell);
                       }
                       }
                       />;
        })
      }
      </div>
    );
  }
}
