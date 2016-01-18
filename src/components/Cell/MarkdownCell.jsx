import React from 'react';

import ReactMarkdown from 'react-markdown';

import Editor from './Editor';
import { updateCell } from '../../actions';

export default class MarkdownCell extends React.Component {
  static displayName = 'MarkdownCell';

  static propTypes = {
    // Unlike the code cell, we default to language of markdown
    // and don't have outputs
    index: React.PropTypes.number,
    input: React.PropTypes.any,
    notebook: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.input,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.input,
    });
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
                    index={this.props.index}
                    input={this.state.source}
                    notebook={this.props.notebook}
                    onChange={
                      (text) => {
                        this.setState({
                          source: text,
                        });
                        updateCell(this.props.notebook, this.props.index, text);
                      }
                    }/>
          </div>
    );
  }
}
