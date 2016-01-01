import React from 'react';

export default class Editor extends React.Component {
  static displayName = 'Editor';

  static propTypes = {
    language: React.PropTypes.string,
    text: React.PropTypes.any,
  };

  render() {
    return (
      <pre>
        {this.props.text}
      </pre>
    );
  }
}
