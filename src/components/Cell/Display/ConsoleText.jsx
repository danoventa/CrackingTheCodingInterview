import React from 'react';

import Convert from 'ansi-to-html';

const convert = new Convert({
  escapeXML: true,
  newLine: true,
});

function console(text) {
  return convert.toHtml(text);
}

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
