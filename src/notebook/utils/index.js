import fs from 'fs';
import path from 'path';

function getCopiedFilename(filename) {
  const base = path.basename(filename, '.ipynb');
  const dir = path.dirname(filename);
  return dir + '/' +  base + ' Copy.ipynb';
}

export function copyNotebook(filename) {
  return new Promise(function(resolve, reject) {
    const readStream = fs.createReadStream(filename);
    readStream.on('error', reject);

    const newFilename = getCopiedFilename(filename);
    const writeStream = fs.createWriteStream(newFilename);
    writeStream.on('error', reject);

    readStream.pipe(writeStream);
    writeStream.on('close', resolve(newFilename));
  });
}
