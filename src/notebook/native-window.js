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

export function selectTitleAttributes(state) {
  return {
    modified: state.app.get('modified'),
    executionState: state.app.get('executionState'),
    filename: state.metadata.get('filename') || 'Untitled',
    displayName: state.document.getIn([
      'notebook', 'metadata', 'kernelspec', 'display_name'], '...'),
  };
}

export function setTitleFromAttributes(attributes) {
  const filename = tildify(attributes.filename);
  const { modified, executionState, displayName } = attributes;

  const title = `${filename} - ${displayName} - ${executionState}`;

  const win = getCurrentWindow();
  // TODO: Investigate if setRepresentedFilename() is a no-op on non-OS X
  if (filename && win.setRepresentedFilename) {
    // TODO: this needs to be the full path to the file
    win.setRepresentedFilename(filename);
  }
  if (win.setDocumentEdited) {
    win.setDocumentEdited(attributes.modified);
  }
  win.setTitle(title);
}

export function initNativeHandlers(store) {
  const state$ = Rx.Observable.from(store);

  state$
    .map(selectTitleAttributes)
    .distinctUntilChanged()
    .switchMap(i => Rx.Observable.of(i))
    .debounceTime(200)
    .subscribe(setTitleFromAttributes, (err) => console.error(err));
}
