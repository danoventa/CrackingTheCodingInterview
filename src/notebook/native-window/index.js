import { getCurrentWindow } from 'remote';

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return `${filename || 'Untitled'} - ${executionState}`;
    })
    .distinctUntilChanged()
    .debounceTime(200)
    .subscribe(title => {
      const win = getCurrentWindow();
      win.setTitle(title);
    });
}
