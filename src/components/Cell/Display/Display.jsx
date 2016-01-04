import React from 'react';

import RichestMime from './RichestMime';

const streamStyle = {
  unicodeBidi: 'embed',
  fontFamily: 'monospace',
  whiteSpace: 'pre',
};

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
        return <span key={index} style={streamStyle}>{text}</span>;
      case 'stderr':
        return <span key={index} style={streamStyle}>{text}</span>;
      }
      // switch(output.get('name'))
      // Should differentiate between streams here
      // return <pre key={index}>{ output.get('text').join('') }</pre>;
    // These need implemented still
    case 'clear_output':
    case 'error':
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
