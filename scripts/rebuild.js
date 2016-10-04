#!/usr/bin/env node
const exec = require('child_process').exec;

if (process.platform === 'win32') {
  exec('npm rebuild zmq-prebuilt --runtime=electron --target=1.1.3 --disturl=https://atom.io/download/atom-shell --build-from-source',
  function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err) {
      throw err;
    }
  });
} else if (process.platform === 'linux' || process.platform === 'darwin') {
  console.log('No postinstall step required for platform' + process.platform);
} else {
  console.log(process.platform + ' is not yet supported.');
}
