import React from 'react';

import Editor from './Editor';
import OutputArea from './OutputArea';

export default class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    outputs: React.PropTypes.any,
  };

  render() {
    return (
      <div style={{
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingBottom: '10px',
      }}>
        <Editor text={this.props.input} language={this.props.language} ref='editor' />
        <OutputArea ref='output-area' outputs={this.props.outputs} />
      </div>
    );
  }
}
