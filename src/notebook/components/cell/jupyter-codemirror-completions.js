import {CodeMirror} from 'codemirror';
import anyword from 'codemirror/addon/hint/anyword-hint';


export function completions(complete, editor, callback, options) {
      var cursor = editor.getCursor()
      var c = complete(editor.getValue(), cursor.ch)
      c.then(function(res){
          callback({list:res.matches, from:{line:cursor.line, ch:res.cursor_start}, to:{line:cursor.line, ch:res.cursor_end}})
      })
}

completions.async = true
