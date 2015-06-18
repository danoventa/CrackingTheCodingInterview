module.exports = window.start = start

var ipc = require('ipc')
var fs = require('fs')
var jp = require('jupyter-paths')
var Handlebars = require('handlebars')
var path = require('path')
var KernelWatch = require('jupyter-kernel-watch')
var RuntimeWatch = require('jupyter-runtimes')

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

function start (content) {
  var kernels = jp.jupyterPath('kernels')
  console.log('kernels', kernels)

  var kernelwatch = KernelWatch(kernels)
  kernelwatch.on('data', function (kernelSpecs) {
    console.log('kernelspecs', kernelSpecs)
    updateKernelView({kernels: kernelSpecs})
  })

  // var runtimeDir = jp.jupyterRuntimeDir()
  var runtimeDir = '/Users/karissa/.ipython/profile_default/security/'
  console.log('runtimeDir', runtimeDir)

  var runtimewatch = RuntimeWatch([runtimeDir])
  runtimewatch.on('data', function (runtimes) {
    console.log('runtimes', runtimes)
    updateRuntimeView({runtimes: runtimes})
  })
}

function render (source, data) {
  var template = Handlebars.compile(source)
  return template(data)
}

function updateKernelView (data) {
  // render kernels
  var template = fs.readFileSync(path.join(__dirname, 'templates/kernels.html')).toString()
  document.getElementById('kernels').innerHTML = render(template, data)
}

function updateRuntimeView (data) {
  // render kernels
  var template = fs.readFileSync(path.join(__dirname, 'templates/runtimes.html')).toString()
  document.getElementById('runtimes').innerHTML = render(template, data)
}

function main (data) {
  // render main
  var template = fs.readFileSync(path.join(__dirname, 'templates/main.html')).toString()
  document.getElementById('content').innerHTML = render(template, data)
}