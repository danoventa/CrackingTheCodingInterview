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
  const win = (process.platform === 'win32') ? 'win' : '';
  const dir = join(process.resourcesPath, '..', subdir);

  const nteractPath = join(dir, `nteract${ext}`);
  const electronPath = join(dir, `electron${ext}`);

  if (fs.existsSync(nteractPath)) {
    return [nteractPath, '', join(dir, 'bin', win)];
  } else if (fs.existsSync(electronPath)) {
    // Developer install
    const rootDir = dir.split('node_modules')[0];
    return [electronPath, join(rootDir, 'app'), join(rootDir, 'bin', win)];
  }
  return [null, null, null];
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

const setWinPathObservable = (exe, rootDir, binDir) => {
  // Remove duplicates because SETX throws a error if path is to long
  const env = process.env.PATH.split(';')
    .filter(item => !/nteract/.test(item))
    .filter((item, index, array) => array.indexOf(item) === index);
  env.push(binDir);
  const envPath = env.join(';');
  return spawn('SETX', ['PATH', `"${envPath}`])
    .map('SETX', ['NTERACT_EXE', `"${exe}"`])
    .map('SETX', ['NTERACT_DIR', `"${rootDir}"`]);
};

const createSymlinkObservable = (target, path) =>
  unlinkObservable(path)
    .switchMap(() => createNewSymlinkObservable(target, path));

const installShellCommandsObservable = (exe, rootDir, binDir) => {
  if (process.platform === 'win32') {
    return setWinPathObservable(exe, rootDir, binDir);
  }
  const envFile = join(binDir, 'nteract-env');
  return writeFileObservable(envFile, `NTERACT_EXE="${exe}"\nNTERACT_DIR="${rootDir}"`)
    .switchMap(() => {
      const target = join(binDir, 'nteract.sh');
      return createSymlinkObservable(target, '/usr/local/bin/nteract')
        .catch(() => {
          const dest = join(process.env.HOME, '.local/bin/nteract');
          return createSymlinkObservable(target, dest);
        });
    });
};

export const installShellCommand = () => {
  const [exe, rootDir, binDir] = getStartCommand();
  if (!exe) {
    dialog.showErrorBox(
      'nteract application not found.',
      'Could not locate nteract executable.'
    );
    return;
  }

  installShellCommandsObservable(exe, rootDir, binDir)
    .subscribe(
      () => {},
      (err) => dialog.showErrorBox('Could not write shell script.', err.message),
      () => dialog.showErrorBox(
        'Command installed.',
        'The shell command "nteract" is installed.\nOpen notebooks with "nteract notebook.ipynb".'
        )
    );
};
