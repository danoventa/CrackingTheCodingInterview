var colors = require('colors');

if (process.platform === 'win32') {
  var fs = require('fs');
  var path = require('path');
  // https://github.com/atom/apm/blob/master/src/apm.coffee#L84
  if (process.env.GYP_MSVS_VERSION === '2015') {
    return;
  }
  var programDir = process.env["ProgramFiles(x86)"] || process.env["ProgramFiles"];
  var VSPath = path.join(programDir, "Microsoft Visual Studio 14.0", "Common7", "IDE");
  try {
    fs.statSync(VSPath).isDirectory();
  } catch (err) {
    console.error(`Missing dependency: ${'Visual C++ Build Tools 2015'.bold} must be installed`.red);
  }
} else {
  var commandExists = require('command-exists');
  var depedencies = [
    'make',
    'gcc',
    'python2.7'
  ];

  depedencies.forEach(function(dep) {
    commandExists(dep, function(err, commandExists) {
      if(!commandExists) {
        console.error(`Missing dependency: ${dep.bold} Could not be found on your system.`.red);
      }
    });
  });

  if (process.platform === 'linux') {
    var publishDeps = ['icnsutils', 'graphicsmagick', 'xz-utils'];
    publishDeps.forEach(function(dep) {
      commandExists(dep, function(err, commandExists) {
        if(!commandExists) {
          console.error(`Missing dependency: ${dep.bold} is necessary if you want to package a release.`.yellow);
        }
      });
    });
  }
}
