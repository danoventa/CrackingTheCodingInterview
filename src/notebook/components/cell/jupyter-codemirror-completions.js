import {CodeMirror} from 'codemirror'


export function completions(editor, complete){
      var cursor = editor.getCursor()
      var c = complete(editor.getValue(), cursor.ch)
      console.info(c)
      //debugger;
      //c.subscribe(console.warn)
      c.then(function(res){console.log('here we go', res);
        editor.showHint(
            {list:res.matches, from:{line:cursor.line, ch:res.cursor_start}, to:{line:cursor.line, ch:res.cursor_end}}
        )
      })
}
