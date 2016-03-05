import React from 'react';

import ReactMarkdown from 'react-markdown';

import Editor from './editor';
import { updateCellSource } from '../../actions';

export default class MarkdownCell extends React.Component {
  static displayName = 'MarkdownCell';

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
      source: 'Edit me by double clicking',
    };
  }


  componentWillReceiveProps(nextProps) {
    var source = nextProps.cell.get('source');
    if (source) {
      this.setState({
        source: source,
      });
    }
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
          <div
            className='cell_markdown'
            onDoubleClick={() => this.setState({ view: false }) }>
            <ReactMarkdown source={this.state.source} />
          </div> :
          <div onKeyDown={this.keyDown.bind(this)}>
            <Editor language='markdown'
                    id={this.props.id}
                    input={this.state.source}
                    onChange={
                      (text) => {
                        this.setState({
                          source: text,
                        });
                        this.context.dispatch(updateCellSource(this.props.id, text));
                      }
                    }/>
          </div>
    );
  }
}
