import { getCurrentWindow } from 'remote';

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return {
        title: `${filename || 'Untitled'} - ${executionState}`,
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
