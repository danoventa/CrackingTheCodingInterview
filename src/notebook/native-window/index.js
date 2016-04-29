import { getCurrentWindow } from 'remote';
import home from 'home-dir';
import path from 'path'

const HOME = home();

function _tildify(home, p) {
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(home) === 0 ? s.replace(home + path.sep, '~' + path.sep) : s).slice(0, -1);
}

function tildify(path) {
  if(!path){
    return ''
  }
  return _tildify(HOME, path)
}

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return {
        title: `${tildify(filename) || 'Untitled'} - ${executionState}`,
        path: filename,
      };
    })
    .distinctUntilChanged()
    .debounceTime(200)
    .subscribe(res => {
      const win = getCurrentWindow();
      // TODO: Investigate if setRepresentedFilename() is a no-op on non-OS X
      if (res.path && win.setRepresentedFilename) {
        // TODO: this needs to be the full path to the file
        win.setRepresentedFilename(res.path);
      }
      win.setTitle(res.title);
    });
}
