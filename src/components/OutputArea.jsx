import React from 'react';

import {
  richestMimetype,
  transforms,
} from 'transformime-react';

export default class OutputArea extends React.Component {
  static displayName = 'OutputArea';

  static propTypes = {
    outputs: React.PropTypes.any,
  };

  transform(output, index) {
    const outputType = output.get('output_type');
    if(outputType === 'execute_result') {
      const bundle = output.get('data');

      const mimetype = richestMimetype(bundle);
      const Transform = transforms.get(mimetype);

      return Transform ? <Transform key={index} data={bundle.get(mimetype)} /> : null;
    }
    else if (outputType === 'stream') {
      return <pre key={index}>{ output.get('text').join('') }</pre>;
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
