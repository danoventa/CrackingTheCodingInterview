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
    focused: React.PropTypes.bool,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static defaultProps = {
    focused: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.cell.get('source'),
    };
    this.openEditor = this.openEditor.bind(this);
    this.editorKeyDown = this.editorKeyDown.bind(this);
    this.renderedKeyDown = this.renderedKeyDown.bind(this);
  }

  componentDidMount() {
    // On first load, if focused, focus rendered view
    if (this.state && this.state.view && this.props.focused) {
      this.refs.rendered.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.cell.get('source'),
    });
  }

  componentDidUpdate(prevProps) {
    if (this.state && this.state.view && this.props.focused &&
      prevProps.focused !== this.props.focused) {
      this.refs.rendered.focus();
    }
  }

  editorKeyDown(e) {
    if (!(e.shiftKey && e.key === 'Enter')) {
      return;
    }
    this.setState({ view: true });
  }

  openEditor() {
    this.setState({ view: false });
  }

  renderedKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
        this.props.focusAbove();
        break;
      case 'ArrowDown':
        this.props.focusBelow();
        break;
      case 'Enter':
        this.openEditor();
        break;
      default:
    }
  }

  render() {
    return (
        (this.state && this.state.view) ?
          <div
            className="cell_markdown rendered"
            onDoubleClick={this.openEditor}
            onKeyDown={this.renderedKeyDown}
            ref="rendered"
            tabIndex="0"
          >
            {markdownRenderer.process(
              this.state.source ?
                this.state.source :
                '*Empty markdown cell, double click me to add content.*')
            }
          </div> :
          <div onKeyDown={this.editorKeyDown} className="cell_markdown unrendered">
            <Editor
              language="markdown"
              id={this.props.id}
              lineWrapping
              input={this.state.source}
              theme={this.props.theme}
              focusAbove={this.props.focusAbove}
              focusBelow={this.props.focusBelow}
              focused={this.props.focused}
            />
          </div>
    );
  }
}
