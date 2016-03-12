import React from 'react';

import ReactMarkdown from 'react-markdown';

import Editor from './editor';

export default class MarkdownCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.cell.get('source'),
    };
    this.openEditor = this.openEditor.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.cell.get('source'),
    });
  }

  keyDown(e) {
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    this.setState({ view: true });
  }

  openEditor() {
    this.setState({ view: false });
  }

  render() {
    return (
        (this.state && this.state.view) ?
          <div
            className="cell_markdown"
            onDoubleClick={this.openEditor}
          >
            <ReactMarkdown source={
              this.state.source ?
                this.state.source :
                '*Empty markdown cell, double click me to add content.*'}
            />
          </div> :
          <div onKeyDown={this.keyDown}>
            <Editor
              language="markdown"
              id={this.props.id}
              input={this.state.source}
            />
          </div>
    );
  }
}
