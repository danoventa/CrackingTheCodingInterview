import React from 'react';

import RichestMime from './RichestMime';

import ConsoleText from './ConsoleText';

export default class Display extends React.Component {
  static displayName = 'Display';

  static propTypes = {
    outputs: React.PropTypes.any,
  };

  transform(output, index) {
    const outputType = output.get('output_type');
    switch(outputType) {
    case 'execute_result':
      // We can defer to display data here, the cell number will be handled
      // separately. For reference, it is output.get('execution_count')
      // The execution_count belongs in the component above if
      // this is a code cell
    case 'display_data':
      const bundle = output.get('data');
      return <RichestMime key={index} bundle={bundle} />;
    case 'stream':
      // TODO: Multi-line string cleanup earlier on
      let text = output.get('text');
      if (typeof text !== 'string') {
        text = text.join('');
      }
      switch(output.get('name')) {
      case 'stdout':
        return <ConsoleText key={index} text={text} />;
      case 'stderr':
        return <ConsoleText key={index} text={text} />;
      }
    case 'error':
      const traceback = output.get('traceback');
      if (!traceback) {
        return <ConsoleText key={index} text={`${output.get('ename')}: ${output.get('evalue')}`} />;
      }
      return <ConsoleText key={index} text={traceback.join('\n')} />;
    case 'clear_output':
      return (
        <div key={index}>
          <p style={{ color: 'red' }}>Output type '{outputType}' not implemented yet</p>
          <pre style={{ color: 'red' }}>{JSON.stringify(output)}</pre>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
      {
        this.props.outputs ? this.props.outputs.map(this.transform.bind(this)) : null
      }
      </div>
    );
  }
}
