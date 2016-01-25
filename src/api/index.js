import fs from 'fs';

export const getJSON = filepath =>
  new Promise((resolve, reject) => {
    return fs.readFile(filepath, {}, (err, data) => {
      if(err) {
        reject(err);
        return;
      }
      try {
        const nb = JSON.parse(data);
        resolve(nb);
        return;
      }
      catch (e) {
        reject(e);
      }
    });
  });
