import Rx from 'rxjs/Rx';
import { join } from 'path';
import { dialog } from 'electron';
import { spawn } from 'spawn-rx';
// We probably want to move this function
import { writeFileObservable } from '../notebook/epics/config';

const fs = require('fs');

const getStartCommand = () => {
  const subdir = (process.platform === 'darwin') ? 'MacOS' : '';
  const ext = (process.platform === 'win32') ? '.exe' : '';
  const dir = join(process.resourcesPath, '..', subdir);

  const nteractPath = join(dir, `nteract${ext}`);
  const electronPath = join(dir, `electron${ext}`);

  if (fs.existsSync(nteractPath)) {
    return [nteractPath, join(dir, 'bin')];
  } else if (fs.existsSync(electronPath)) {
    // Developer install
    const rootDir = dir.split('node_modules')[0];
    return [`${electronPath} ${join(rootDir, 'app')}`, join(rootDir, 'bin')];
  }
  return [null, null];
};

const createNewSymlinkObservable = (target, path) =>
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

const unlinkObservable = (path) =>
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

const setWinPathObservable = (binDir) => {
  // Remove duplicates because SETX throws a error if path is to long
  const env = process.env.PATH.split(';')
    .filter(item => !/nteract/.test(item))
    .filter((item, index, array) => array.indexOf(item) === index);
  env.push(binDir);
  const envPath = env.join(';');
  return spawn('SETX', ['PATH', `"${envPath}"`]);
};

const createSymlinkObservable = (target, path) =>
  unlinkObservable(path)
    .switchMap(() => createNewSymlinkObservable(target, path));

const linkScriptObservable = (target) =>
  Rx.Observable.catch(
    createSymlinkObservable(target, '/usr/local/bin/nteract'),
    createSymlinkObservable(target, join(process.env.HOME, '.local', 'bin', 'nteract'))
  );

export const installShellCommand = () => {
  const [cmd, binDir] = getStartCommand();
  if (!cmd) {
    dialog.showErrorBox(
      'nteract application not found.',
      'Could not locate nteract executable.'
    );
    return;
  }

  writeFileObservable(join(binDir, 'nteract-env'), `NTERACT_CMD="${cmd}"`)
    // why does this throw "Observable.catch is not a function"?
    // .map(() => linkScriptObservable(join(binDir, 'nteract.sh')))
    .switchMap(() => {
      if (process.platform === 'win32') {
        return setWinPathObservable(binDir);
      }
      return createSymlinkObservable(join(binDir, 'nteract.sh'), '/usr/local/bin/nteract');
    })
    .subscribe(
      () => {},
      (err) => dialog.showErrorBox('Could not write shell script.', err.message),
      () => dialog.showErrorBox(
        'Command installed.',
        'The shell command "nteract" is installed.\nOpen notebooks with "nteract notebook.ipynb".'
        )
    );
};
