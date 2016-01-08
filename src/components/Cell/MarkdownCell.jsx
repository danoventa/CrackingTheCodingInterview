import React from 'react';

import ReactMarkdown from 'react-markdown';

import Editor from './Editor';

export default class MarkdownCell extends React.Component {
  static displayName = 'MarkdownCell';

  static propTypes = {
    input: React.PropTypes.any,
    // Unlike the code cell, we default to language of markdown
    // and don't have outputs
    outputs: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.input,
    };
  }

  keyDown(e) {
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    this.setState({ view: true });
  }

  render() {
    return (
        (this.state && this.state.view) ?
          <div onDoubleClick={() => this.setState({ view: false }) }>
            <ReactMarkdown source={this.state.source} />
          </div> :
          <div onKeyDown={this.keyDown.bind(this)}>
            <Editor language='markdown'
                    text={this.state.source}
                    onChange={(text) => this.setState({
                      source: text,
                    }) }
                    />
          </div>
    );
  }
}
