import React from 'react';

import remark from 'remark';
import reactRenderer from 'remark-react';

import Editor from './editor';

const markdownRenderer = remark().use(reactRenderer);

export default class MarkdownCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    theme: React.PropTypes.string,
    focusAbove: React.PropTypes.func,
    focusBelow: React.PropTypes.func,
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
            className="cell_markdown rendered"
            onDoubleClick={this.openEditor}
          >
            {markdownRenderer.process(
              this.state.source ?
                this.state.source :
                '*Empty markdown cell, double click me to add content.*')
            }
          </div> :
          <div onKeyDown={this.keyDown} className="cell_markdown unrendered">
            <Editor
              language="markdown"
              id={this.props.id}
              lineWrapping
              input={this.state.source}
              theme={this.props.theme}
              focusAbove={this.props.focusAbove}
              focusBelow={this.props.focusBelow}
            />
          </div>
    );
  }
}
