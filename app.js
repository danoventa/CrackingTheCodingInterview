module.exports = window.App = App;

var ipc = require('ipc');
var fs = require('fs');

var jp = require('jupyter-paths');

// TODO: Jupyter path is so not nodey
// TODO: It should totes accept a callback or give a promise
kernels = jp.jupyterPath('kernels');

// SPECS/ISSUES for jupyter-paths

// jp.kernelSpecs()
// Array of kernel spec JSONs (contents)

// Event based handling of new kernelspecs?
// Register it
//   jp.on('kernel', function(newKernel){}) // New kernel
// What do you do if one is deleted?
//

// jp.on('data', function(allKernels) {  });

// jp.push('kernel')

// jp.on('kernelspecs', ...)
// jp.on('runtimes', ...)

// FORESHADOWING

// New runtimes will come in

// Know runtimeDir, know kernelSpecs

// Launch kernelSpec process
/* Example kernelSpec
{
 "display_name": "Python 2",
 "language": "python",
 "argv": [
  "/usr/local/opt/python/bin/python2.7",
  "-m",
  "ipykernel",
  "-f",
  "{connection_file}"    // This will be the runtime file *we* create
 ]
}
*/

// Example runtime
/*
{
  "hb_port": 64477,      // These are all ports that we *decide* to open (find open ports) for zmq (through jmp)
  "iopub_port": 64474,   // *
  "stdin_port": 64475,   // *
  "shell_port": 64473,   // *
  "control_port": 64476, // *
  "key": "23a87070-5248-47c5-9dea-70f50cd3871d", // UUID we create for message signing
  "transport": "tcp",
  "signature_scheme": "hmac-sha256", // Stick with the defaults here
  "ip": "127.0.0.1"      // localhost like a boss
}
*/



// Create the individual zmq/jmp sockets for
// hb - heartbeat
// iopub - display outputs (stdout, pngs, etc.)
// stdin_port - send crap on stdin
// shell_port - send code to kernel
// control_port - ????

// On reception of iopub messages
// we display the mimetype they give us 'image/png', 'text/html'








function App (el) {
  kernels.forEach(function(k){
    fs.readdir(k, function(err, kernelSpecDirectories) {
      if(err) {
        console.error(err);
        return;
      }

      // We expect files to be directories of kernelspec directories

      console.log(kernelSpecDirectories);

    });

  });

  el.innerHTML = kernels;
}
