import React from 'react';

import CodeMirror from 'react-code-mirror';

import { updateCell } from '../../actions';

export default class Editor extends React.Component {
  static displayName = 'Editor';

  static propTypes = {
    index: React.PropTypes.number,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    notebook: React.PropTypes.object,
    onChange: React.PropTypes.func,
    theme: React.PropTypes.string,
  };

  static defaultProps = {
    language: 'python',
    lineNumbers: false,
    text: '',
    theme: 'composition',
  };

  constructor(props) {
    super(props);
    this.state = {
      source: this.props.input,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.input,
    });
  }

  render() {
    return (
      <CodeMirror value={this.state.source}
                  mode={this.props.language}
                  textAreaClassName={['editor']}
                  textAreaStyle={{
                    minHeight: '10em',
                  }}
                  lineNumbers={this.props.lineNumbers}
                  theme={this.props.theme}
                  onChange={
                    (e) => {
                      if (this.props.onChange) {
                        this.props.onChange(e.target.value);
                      } else {
                        this.setState({
                          source: e.target.value,
                        });
                        updateCell(this.props.notebook, this.props.index, e.target.value);
                      }
                    }
                  }/>
    );
  }
}
