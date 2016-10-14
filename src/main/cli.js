import { join } from 'path';
import { existsSync, writeFile, chmod } from 'fs';


function getStartCommand() {
  let subdir;
  if (process.platform === 'darwin') {
    subdir = 'MacOS';
  } else {
    subdir = '';
  }
  const dir = join(process.resourcesPath, '..', subdir);
  const nteractPath = join(dir, 'nteract');
  const electronPath = join(dir, 'Electron');

  if (existsSync(nteractPath)) {
    return nteractPath;
  } else if (existsSync(electronPath)) {
    // Developer install
    const mainDir = dir.split('/node_modules/')[0];
    return `${electronPath} ${mainDir}`;
  }
  return null;
}

function writeExecutable(installDir, script, callback) {
  writeFile(installDir, script, (err) => {
    if (err) callback(err);
    chmod(installDir, '755', (error) => {
      if (error) callback(error);
    });
  });
}

export function installShellCommand() {
  const installDir = join('/usr/local/bin', 'nteract');
  const script = `#!/bin/bash\nnohup ${getStartCommand()} "$@" > /dev/null 2>&1 &`;
  writeExecutable(installDir, script, (err) => {
    console.error(err);
  });
}
