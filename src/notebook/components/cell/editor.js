import React from 'react';

import CodeMirror from 'react-code-mirror';

import { updateCellSource } from '../../actions';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';

import { completions } from './jupyter-codemirror-completions';

export default class Editor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    theme: React.PropTypes.string,
    focused: React.PropTypes.bool,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static defaultProps = {
    language: 'python',
    lineNumbers: false,
    text: '',
    theme: 'composition',
    focused: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      source: this.props.input,
    };
    this._complete = this.props.getCompletions;
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    // On first load, if focused, set codemirror to focus
    if (this.props.focused) {
      this.refs.codemirror.editor.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.input,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.focused && prevProps.focused !== this.props.focused) {
      this.refs.codemirror.editor.focus();
    } else if (!this.props.focused && prevProps.focused !== this.props.focused) {
      this.refs.codemirror.editor.getInputField().blur();
    }
  }

  onChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    } else {
      this.setState({
        source: e.target.value,
      });
      this.context.dispatch(updateCellSource(this.props.id, e.target.value));
    }
  }
  render() {
    const extraKeys = {"Ctrl-Space": "autocomplete"}
    let cmp = (...args) => {return completions(this._complete, ...args);}
    cmp.async = true;

    return (
      <div className="cell_editor">
        <CodeMirror
          value={this.state.source}
          ref="codemirror"
          className="cell_cm"
          mode={this.props.language}
          textAreaClassName={['editor']}
          textAreaStyle={{
            minHeight: '10em',
            backgroundColor: 'red',
          }}
          lineNumbers={this.props.lineNumbers}
          theme={this.props.theme}
          onChange={this.onChange}
          extraKeys={extraKeys}
          hintOptions={{hint: cmp}}
        />
      </div>
    );
  }
}
