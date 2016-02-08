import React from 'react';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';

export default class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    cell: React.PropTypes.any,
    notebook: React.PropTypes.any,
    type: React.PropTypes.string,
  };

  render() {
    return (
      <div className='cell'>
        {
        this.props.type === 'markdown' ?
          <MarkdownCell {...this.props}/> :
          <CodeCell {...this.props}/>
        }
      </div>
    );
  }
}
