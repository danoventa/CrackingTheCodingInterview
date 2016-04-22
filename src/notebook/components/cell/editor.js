import React from 'react';

import CodeMirror from 'react-code-mirror';

import { updateCellSource } from '../../actions';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';

export default class Editor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    input: React.PropTypes.any,
    getCompletions: React.PropTypes.any,
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
    this.onChange = this.onChange.bind(this);

    this.hint = this.completions.bind(this);
    this.hint.async = true;
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

  completions(editor, callback) {
    const cursor = editor.getCursor();
    this.props.getCompletions(editor.getValue(), cursor.ch).then(results => callback({
      list: results.matches,
      from: {
        line: cursor.line,
        ch: results.cursor_start,
      },
      to: {
        line: cursor.line,
        ch: results.cursor_end,
      },
    }));
  }

  render() {
    const extraKeys = { 'Ctrl-Space': 'autocomplete' };
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
          hintOptions={{ hint: this.hint }}
        />
      </div>
    );
  }
}
