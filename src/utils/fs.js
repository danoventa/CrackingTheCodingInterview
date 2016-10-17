import Rx from 'rxjs/Rx';

const fs = require('fs');

export const unlinkObservable = (path) =>
  Rx.Observable.create(observer => {
    if (fs.existsSync(path)) {
      fs.unlink(path, (error) => {
        if (error) {
          observer.error(error);
        } else {
          observer.next({ path });
          observer.complete();
        }
      });
    } else {
      observer.next({ path });
      observer.complete();
    }
  });

export const createNewSymlinkObservable = (target, path) =>
  Rx.Observable.create(observer => {
    fs.symlink(target, path, (error) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next({ target, path });
        observer.complete();
      }
    });
  });

export const createSymlinkObservable = (target, path) =>
  unlinkObservable(path)
    .switchMap(() => createNewSymlinkObservable(target, path));

export const readFileObservable = (filename, ...args) =>
  Rx.Observable.create(observer => {
    fs.readFile(filename, ...args, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next({ filename, data });
        observer.complete();
      }
    });
  });

export const writeFileObservable = (filename, data, ...args) =>
  Rx.Observable.create(observer => {
    fs.writeFile(filename, data, ...args, error => {
      if (error) {
        observer.error(error);
      } else {
        observer.next({ filename, data });
        observer.complete();
      }
    });
  });
