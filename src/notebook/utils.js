import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

// TODO: this should go to an epic
export function copyNotebook(filename) { // eslint-disable-line
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filename);
    readStream.on('error', reject);

    const base = path.basename(filename, '.ipynb');

    tmp.tmpName({ prefix: `${base}-Copy`, postfix: '.ipynb' }, (err, newFilename) => {
      if (err) {
        reject(err);
      }

      const writeStream = fs.createWriteStream(newFilename);
      writeStream.on('error', reject);

      readStream.pipe(writeStream);
      writeStream.on('close', resolve(newFilename));
    });
  });
}
