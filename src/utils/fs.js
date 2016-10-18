import Rx from 'rxjs/Rx';
import * as fs from 'fs';

export const unlinkObservable = (path) =>
  Rx.Observable.create(observer => {
    if (fs.existsSync(path)) {
      fs.unlink(path, (error) => {
        if (error) {
          observer.error(error);
        } else {
          observer.next();
          observer.complete();
        }
      });
    } else {
      observer.next();
      observer.complete();
    }
  });

export const createNewSymlinkObservable =
  Rx.Observable.bindNodeCallback(fs.symlink);

export const createSymlinkObservable = (target, path) =>
  unlinkObservable(path)
    .flatMap(() => createNewSymlinkObservable(target, path));

export const readFileObservable =
  Rx.Observable.bindNodeCallback(fs.readFile);

export const writeFileObservable =
  Rx.Observable.bindNodeCallback(fs.writeFile);
