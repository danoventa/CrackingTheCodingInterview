import React from 'react';

import { Transformime } from 'transformime';
import {
  consoleTextTransform,
  TracebackTransform,
  markdownTransform,
  LaTeXTransform,
  scriptTransform,
  PDFTransform,
} from 'transformime-jupyter-transformers';

export default class OutputArea extends React.Component {
  static displayName = 'OutputArea';

  static propTypes = {
    outputs: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.transformer = new Transformime();
    this.transformer.transformers.push(scriptTransform);
    this.transformer.transformers.push(consoleTextTransform);
    this.transformer.transformers.push(TracebackTransform);
    this.transformer.transformers.push(markdownTransform);
    this.transformer.transformers.push(LaTeXTransform);
    this.transformer.transformers.push(PDFTransform);

    this.state = {
      elements: [],
    };
  }

  componentWillMount() {
    this.transform();
  }

  componentWillReceiveProps() {
    this.transform();
  }

  transform() {
    const promises = this.props.outputs.map((output, index) => {
      const mimeBundle = this.makeMimeBundle(output);
      return this.transformer.transformRichest(mimeBundle, document);
    })
  }

  // Temporary until I bring in all the transformime and JDA handling
  cleanOutput(output, index) {
    const mimeBundle = this.makeMimeBundle(output);
    this.transformer.transformRichest(mimeBundle, document)
                    .then(mime => mime.el.outerHTML);

    const outputType = output.get('output_type');
    if(outputType === 'execute_result') {
      return <pre key={index}>{ output.getIn(['data', 'text/plain']) }</pre>;
    }
    else if (outputType === 'stream') {
      return <pre key={index}>{ output.get('text').join('') }</pre>;
    }
  }

  transformMimeBundle(props) {
    if (props.data.get('outputs')) {
      const promises = props.data.get('outputs').toJS().map(output => {
        let mimeBundle = this.makeMimeBundle(output);
        if (mimeBundle) {
          return this.transformer.transformRichest(mimeBundle, document).then(mime => mime.el.outerHTML);
        } else return;
      });
      Promise.all(promises).then(outputs => {
        this.setState({outputs});
      });
    }
  }

  makeMimeBundle(msg) {
    let bundle = {};
    switch (msg.get('output_type')) {
    case 'execute_result':
    case 'display_data':
      bundle = msg.get('data').toJS();
      break;
    case 'stream':
      bundle = { 'text/plain': msg.get('text').join('') };
      break;
    case 'error':
      bundle = {
        'jupyter/traceback': msg.toJS(),
      };
      break;
    default:
      console.warn('Unrecognized output type: ' + msg.get('output_type'));
      bundle = {
        'text/plain': 'Unrecognized output type' + JSON.stringify(msg.toJS()),
      };
    }
    return bundle;
  }

  render() {
    return (
      <div>{ this.state.elements }</div>
    );
  }
}
