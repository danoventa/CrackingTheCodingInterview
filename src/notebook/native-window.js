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

export function setTitleFromAttributes(attributes) {
  const filename = tildify(attributes.fullpath);
  const { executionState } = attributes;

  const win = getCurrentWindow();
  // TODO: Investigate if setRepresentedFilename() is a no-op on non-OS X
  if (filename && win.setRepresentedFilename) {
    win.setRepresentedFilename(attributes.fullpath);
    win.setDocumentEdited(attributes.modified);
  }
  const title = `${filename} - ${executionState}`;
  win.setTitle(title);
}

export function initNativeHandlers(store) {
  const state$ = Rx.Observable.from(store);

  const modified$ = state$
    .map(state => state.document.get('notebook'))
    .scan((prev, notebook) => ({
      modified: prev.notebook === notebook,
      notebook,
    }), {})
    .pluck('modified');

  const fullpath$ = state$
    .map(state => state.metadata.get('filename') || 'Untitled');

  const executionState$ = state$
    .map(state => state.app.get('executionState'))
    .debounceTime(200);

  Rx.Observable
    .combineLatest(
      modified$,
      fullpath$,
      executionState$,
      (modified, fullpath, executionState) => ({ modified, fullpath, executionState })
    )
    .distinctUntilChanged()
    .switchMap(i => Rx.Observable.of(i))
    .subscribe(setTitleFromAttributes, (err) => console.error(err));
}
