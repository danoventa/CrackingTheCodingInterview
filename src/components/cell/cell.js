import React from 'react';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
  };

  state = {
    showToolbar: false,
  };

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    return (
      <div
        className='cell'
        onMouseEnter={() => this.setState({ showToolbar: true })}
        onMouseLeave={() => this.setState({ showToolbar: false })}>
        {
          this.state.showToolbar && <Toolbar {...this.props}/>
        }
        {
        type === 'markdown' ?
          <MarkdownCell {...this.props}/> :
          <CodeCell {...this.props}/>
        }
      </div>
    );
  }
}

export default Cell;
