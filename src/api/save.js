import * as path from 'path';

import remote from 'remote';
const dialog = remote.require('dialog');

export function showSaveAsDialog(defaultPath) {
  return new Promise((resolve) => {
    const filename = dialog.showSaveDialog({
      title: 'Save Notebook',
      defaultPath,
      filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
    });

    if (filename && path.extname(filename) === '') {
      resolve(`${filename}.ipynb`);
    }
    resolve(filename);
  });
}
