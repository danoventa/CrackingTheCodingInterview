# Handling Multiple Ways of Discovering, Launching, and Destroying Kernels

Goal: Provide a way to launch and discover kernels in many different ways.

We currently have a method for discovering, launching, and destroying ZMQ based
kernels.

## Alternative kernel launchers

The next "pilot" kernels I want us to be able to support are:

* "Built-in"/fallback default Python kernel
* Conda environment kernels
* Built-in ijavascript kernel
* Built-in ijavascript/electron kernel (similar to above yet hooked to same session)

### "Default" Python kernel

For those that don't have the IPython kernel installed with a kernelspec, yet
have `ipykernel` installed, we should provide the default kernel as an option,
whose kernelspec would look like:

```json
{
 "argv": [
  "python",
  "-m",
  "ipykernel",
  "-f",
  "{connection_file}"
 ],
 "display_name": "Built-in Python",
 "language": "python"
}
```

### Conda environment kernels

See https://github.com/nteract/nteract/pull/847

### Built-in ijavascript kernel

The `jp-kernel` package provides a means for allocating a kernel straight in
JavaScript like so:

```js
const Kernel = require('jp-kernel')
kernel = new Kernel({
  connection: {
    key: 'fc00d33b-e254-4989-97b3-7c9e1b9aee50',
    signature_scheme: 'hmac-sha256',
    transport:'tcp',
    ip: '127.0.0.1',
    hb_port: 9005,
    control_port: 9006,
    shell_port: 9007,
    stdin_port: 9008,
    iopub_port: 9009,
  },
  cwd: notebookDir,
  protocolVersion: "5",
  hideUndefined: true,
  kernelInfoReply: {
    protocol_version: 5,
    implementation: 'nteract-embedded-ijs',
    implementation_version: '¯\\_(ツ)_/¯',
    language_info: {
      name: 'javascript',
      version: process.versions.node,
      mimetype: 'application/javascript',
      file_extension: '.js',
    },
  },
  // [Optional]
  // transpile: nel~Transpiler
  // startupScript: string
  // startupCallback: function
})
```

### Built-in ijavascript kernel _without_ ZMQ

Given that we have direct access to node, we could run a kernel in a webworker
or via another process with ipc. This requires _no_ ZMQ and could be glorious
out of the box.

### Built-in ijavascript kernel using Electron/nteract session

We could likely provide a kernel that is executing in the context of the current
notebook. Could be _really_ useful for debugging and documenting nteract itself.

## Providing a means to do this

As outlined in https://github.com/nteract/nteract/issues/822, we need a method of:

* Discovering these kernels
* Launching them
* Destroying them

I'm currently imagining that each of these provide their own epics for handling
the kernel life cycle, as well as a handler for our current "shutdown kernel immediate"
that happens on force quit.

The likely way this would need to work is to namespace launcher and kernelspec
name. The current kernel launch would be named "native-local". The others would
get their own namespace that they can register, which would be used as part of
the menu.

* `native-jupyter`
* `builtin-ijs`
* `conda`
* `default`
