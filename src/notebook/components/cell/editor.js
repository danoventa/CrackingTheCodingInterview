import React from 'react';

import CodeMirror from 'react-codemirror';

const Rx = require('@reactivex/rxjs');

import { updateCellSource } from '../../actions';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';

// Hint picker
const pick = (cm, handle) => handle.pick();

export default class Editor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    input: React.PropTypes.any,
    getCompletions: React.PropTypes.any,
    language: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    lineWrapping: React.PropTypes.bool,
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
      this.refs.codemirror.focus();
    }

    function formChangeObject(cm, change) {
      return {
        cm,
        change,
      };
    }

    const inputEvents = Rx.Observable.fromEvent(this.refs.codemirror.getCodeMirror(),
      'change', formChangeObject)
      .filter(x => x.change.origin === '+input');

    // TODO: The subscription created here needs to be cleaned up when the cell
    //       is deleted
    inputEvents
      .debounceTime(20)
      // Pass through changes that aren't newlines
      .filter(event => event.change.text.length === 1 ||
                       event.change.text.length === 2 &&
                       !(event.change.text[0] === '' && event.change.text[1] === '')
      )
      // Pass through only partial tokens that are composed of words
      .filter(event => {
        const editor = event.cm;
        const tokenRange = editor.findWordAt(editor.getCursor());
        const token = editor.getRange(tokenRange.anchor, tokenRange.head);
        return /(\w|\.)/.test(token);
      })
      .subscribe(event => {
        if (!event.cm.state.completionActive) {
          event.cm.execCommand('autocomplete');
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.input,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.focused && prevProps.focused !== this.props.focused) {
      this.refs.codemirror.focus();
    } else if (!this.props.focused && prevProps.focused !== this.props.focused) {
      const cm = this.refs.codemirror.getCodeMirror();
      cm.getInputField().blur();
    }
  }

  onChange(text) {
    if (this.props.onChange) {
      this.props.onChange(text);
    } else {
      this.setState({
        source: text,
      });
      this.context.dispatch(updateCellSource(this.props.id, text));
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
    const options = {
      mode: this.props.language,
      lineNumbers: this.props.lineNumbers,
      lineWrapping: this.props.lineWrapping,
      theme: this.props.theme,
      autofocus: false,
      hintOptions: {
        hint: this.hint,
        completeSingle: false, // In automatic autocomplete mode we don't want override
        extraKeys: {
          Right: pick,
        },
      },
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
      },
    };
    return (
      <div className="cell_editor">
        <CodeMirror
          value={this.state.source}
          ref="codemirror"
          className="cell_cm"
          options={options}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
