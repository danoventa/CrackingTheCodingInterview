import React from 'react';

import CodeMirror from 'react-code-mirror';

import Inputs from './Inputs';

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

  static contextTypes = {
    dispatch: React.PropTypes.func,
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
      <div className="cell_editor">
        <Inputs {...this.props}/>
        <CodeMirror value={this.state.source}
                    className="cell_cm"
                    mode={this.props.language}
                    textAreaClassName={['editor']}
                    textAreaStyle={{
                      minHeight: '10em',
                      backgroundColor: 'red'
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
                          this.context.dispatch(updateCell(this.props.notebook, this.props.index, e.target.value));
                        }
                      }
                    }/>
      </div>
    );
  }
}
