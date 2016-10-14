import { join } from 'path';
import { dialog } from 'electron';
import { existsSync, writeFile, chmod, mkdirSync } from 'fs';
import { exec } from 'child_process';


function getStartCommand() {
  const subdir = (process.platform === 'darwin') ? 'MacOS' : '';
  const ext = (process.platform === 'win32') ? '.exe' : '';
  const dir = join(process.resourcesPath, '..', subdir);

  const nteractPath = join(dir, 'nteract', ext);
  const electronPath = join(dir, 'electron', ext);

  if (existsSync(nteractPath)) {
    return [nteractPath, dir];
  } else if (existsSync(electronPath)) {
    // Developer install
    const mainDir = dir.split('node_modules')[0];
    return [`${electronPath} ${mainDir}`, mainDir];
  }
  return [null, null];
}

function writeExecutable(installDir, script, callback) {
  writeFile(installDir, script, (err) => {
    if (err) {
      callback(err);
    } else {
      chmod(installDir, '755', (error) => {
        callback(error);
      });
    }
  });
}

function showDialog(error) {
  if (error) {
    dialog.showErrorBox(
      'Could not write shell script.',
      error.message
    );
  } else {
    dialog.showErrorBox(
      'Command installed.',
      'The shell command "nteract" is installed.\nOpen notebooks with "nteract notebook.ipynb".'
    );
  }
}

function writeWinExecutable(mainDir, bashScript, winScript, callback) {
  const binDir = join(mainDir, 'bin');
  if (!existsSync(binDir)) {
    mkdirSync(binDir);
  }
  writeExecutable(join(binDir, 'nteract'), bashScript, (err) => {
    if (err) {
      callback(err);
    } else {
      writeExecutable(join(binDir, 'nteract.cmd'), winScript, (error) => {
        if (error) {
          callback(error);
        } else {
          // Remove duplicates because SETX throws a error if path is to long
          const env = process.env.PATH.split(';')
            .filter(item => !/nteract/.test(item))
            .filter((item, index, array) => array.indexOf(item) === index);
          env.push(binDir);
          const envPath = env.join(';');
          exec(`SETX PATH "${envPath}`, (e, stdout, stderr) => {
            callback(e || stderr);
          });
        }
      });
    }
  });
}

export function installShellCommand() {
  const [shellCommands, mainDir] = getStartCommand();
  const script = `#!/bin/bash\nnohup ${shellCommands.replace(/\\/g, '/')} "$@" > /dev/null 2>&1 &`;
  if (!shellCommands) {
    dialog.showErrorBox(
      'nteract application not found.',
      'Could not locate nteract executable.'
    );
  }
  if (process.platform === 'win32') {
    const winScript = `@echo off\n${shellCommands} %*`;
    writeWinExecutable(mainDir, script, winScript, showDialog);
  } else {
    const installDir = join('/usr/local/bin', 'nteract');
    const installDirUbuntu = join(process.env.HOME, '.local', 'bin', 'nteract');
    writeExecutable(installDir, script, (err) => {
      if (err) {
        writeExecutable(installDirUbuntu, script, showDialog);
      } else {
        showDialog(null);
      }
    });
  }
}
