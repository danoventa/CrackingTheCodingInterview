import fs from 'fs';
import path from 'path';

function fileExists(filename) {
  if (!filename) {
    return false;
  } else {
    try {
      return fs.statSync(filename).isFile();
    } catch (e) {
      return false;
    }
  }
}

function getCopiedFilename(filename) {
  const base = path.basename(filename, '.ipynb');
  const dir = path.dirname(filename);
  var index = 1;
  var newFilename = `${dir}/${base}-Copy${index}.ipynb`;
  while (fileExists(newFilename)) {
    index = index + 1;
    newFilename = `${dir}/${base}-Copy${index}.ipynb`;
  }
  return newFilename;
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
