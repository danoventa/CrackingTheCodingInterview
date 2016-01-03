import React from 'react';

import Editor from './Editor';
import Display from './Display';

export default class MarkdownCell extends React.Component {
  static displayName = 'MarkdownCell';

  static propTypes = {
    input: React.PropTypes.any,
    // Unlike the code cell, we default to language of markdown
    // and don't have outputs
    outputs: React.PropTypes.any,
  };

  render() {
    return (
      <div>
        <Editor language='markdown'
                text={this.props.input}
                />
      </div>
    );
  }
}
