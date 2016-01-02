import React from 'react';

export default class OutputArea extends React.Component {
  static displayName = 'OutputArea';

  static propTypes = {
    outputs: React.PropTypes.any,
  };

  // Temporary until I bring in all the transformime and JDA handling
  cleanOutput(output, index) {
    const outputType = output.get('output_type');
    if(outputType === 'execute_result') {
      return <pre key={index}>{ output.getIn(['data', 'text/plain']) }</pre>;
    }
    else if (outputType === 'stream') {
      return <pre key={index}>{ output.get('text').join('') }</pre>;
    }
  }

  render() {
    return (
      <div>
      {
        this.props.outputs.map(this.cleanOutput)
      }
      </div>
    );
  }
}
