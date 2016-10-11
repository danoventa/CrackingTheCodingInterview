if (process.platform != 'win32') {
  var commandExists = require('command-exists');
  var colors = require('colors');
  var depedencies = [
    'automake',
    'autoconf',
    'pkg-config',
    'wget',
    'libtool',
    'python2'
  ];

  depedencies.forEach(function(dep) {
    commandExists(dep, function(err, commandExists) {
      if(!commandExists) {
        console.error(`Missing dependency: ${dep.bold} Could not be found on your system.`.red);
      }
    });
  });
}
