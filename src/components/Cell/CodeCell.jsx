import React from 'react';

import Editor from './Editor';
import Display from './Display';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    outputs: React.PropTypes.any,
    theme: React.PropTypes.string,
  };

  render() {
    return (
      <div>
        <Editor language={this.props.language}
                text={this.props.input} />
        <Display outputs={this.props.outputs} />
      </div>
    );
  }
}
