import { getCurrentWindow } from 'remote';

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return {title:`${filename || 'Untitled'} - ${executionState}`, path:filename};
    })
    .distinctUntilChanged()
    .debounceTime(200)
    .subscribe(res => {
      const win = getCurrentWindow();
      // no indication of this does not exists or is no-op on Non OSX.
      debugger;
      if(res.path){
          (win.setRepresentedFilename||function(){})(res.path);
      }
      win.setTitle(res.title);
    });
}
