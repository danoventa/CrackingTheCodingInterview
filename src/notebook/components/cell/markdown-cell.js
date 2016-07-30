import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';


import Editor from './editor';
import LatexRenderer from '../latex';

// import remark from 'remark';
// import reactRenderer from 'remark-react';
// const mdRender = remark().use(reactRenderer).process;

const CommonMark = require('commonmark');
const MarkdownRenderer = require('commonmark-react-renderer');

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender = (input) => renderer.render(parser.parse(input));

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
    store: React.PropTypes.object,
  };

  static defaultProps = {
    focused: false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
    this.updateRenderedElement();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.cell.get('source'),
    });
  }

  componentDidUpdate() {
    this.updateRenderedElement();
  }

  updateRenderedElement() {
    // On first load, if focused, focus rendered view
    if (this.state && this.state.view && this.props.focused) {
      this.refs.rendered.focus();
    }
  }

  /**
   * Handles when a keydown event occurs on the unrendered MD cell
   */
  editorKeyDown(e) {
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === 'Enter') {
      this.setState({ view: true });
    }
  }

  openEditor() {
    this.setState({ view: false });
  }

  /**
   * Handles when a keydown event occurs on the rendered MD cell
   */
  renderedKeyDown(e) {
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === 'Enter') {
      this.setState({ view: true });
      return false;
    }

    switch (e.key) {
      case 'ArrowUp':
        this.props.focusAbove();
        break;
      case 'ArrowDown':
        this.props.focusBelow();
        break;
      case 'Enter':
        this.openEditor();
        e.preventDefault();
        return false;
      default:
    }
    return true;
  }

  render() {
    return (
        (this.state && this.state.view) ?
          <div
            className="rendered"
            onDoubleClick={this.openEditor}
            onKeyDown={this.renderedKeyDown}
            ref="rendered"
            tabIndex="0"
          >
            <LatexRenderer>
              {mdRender(
                this.state.source ?
                  this.state.source :
                  '*Empty markdown cell, double click me to add content.*')
              }
            </LatexRenderer>
          </div> :
          <div onKeyDown={this.editorKeyDown}>
            <div className="input-container">
              <div className="prompt" />
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
          </div>
    );
  }
}
