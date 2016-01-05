import React from 'react';

const console = require('./console');

const streamStyle = {
  unicodeBidi: 'embed',
  fontFamily: 'monospace',
  whiteSpace: 'pre',
};

export default class ConsoleText extends React.Component {
  static displayName = 'ConsoleText'

  static propTypes = {
    text: React.PropTypes.string.isRequired,
  }

  render() {
    return <span style={streamStyle}
      dangerouslySetInnerHTML={{ //eslint-disable-line
        __html: console(this.props.text),
      }}/>;
  }
}
