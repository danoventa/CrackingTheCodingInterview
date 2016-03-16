import { getCurrentWindow } from 'remote';

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return `${filename || 'Untitled'} - ${executionState}`;
    })
    .distinctUntilChanged()
    .subscribe(title => {
      const win = getCurrentWindow();
      win.setTitle(title);
    });
}
