import { remote } from 'electron';

import home from 'home-dir';
import path from 'path';

import Rx from 'rxjs/Rx';


const HOME = home();
const { getCurrentWindow } = remote;

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
export function tildify(p) {
  if (!p) {
    return '';
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0 ? s.replace(HOME + path.sep, `~${path.sep}`) : s).slice(0, -1);
}

export function initNativeHandlers(store) {
  Rx.Observable.from(store)
    .map(state => {
      const modified = state.app.get('modified');
      const executionState = state.app.get('executionState');
      const filename = tildify(state.metadata.get('filename')) || 'Untitled';
      const displayName = state.document
        .getIn(['notebook', 'metadata', 'kernelspec', 'display_name'], '...');

      return {
        title: `${filename} - ${displayName} - ${executionState} ${modified ? '*' : ''}`,
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
