import * as commutable from 'commutable';
import * as path from 'path';
import { writeFileSync } from 'fs';

import remote from 'remote';
const dialog = remote.require('dialog');

export function showDialog(defaultPath) {
  const filename = dialog.showSaveDialog({
    title: 'Save Notebook',
    defaultPath,
    filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
  });

  if (filename && path.extname(filename) === '') {
    return filename + '.ipynb';
  }

  return filename;
}

export function save(filename, notebookState) {
  writeFileSync(filename, JSON.stringify(commutable.toJS(notebookState), null, 2));
}
