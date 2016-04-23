import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import * as fs from 'fs';
import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export function launchKernel(kernelSpecName, spawnOptions) {
  return launch(kernelSpecName, spawnOptions)
      .then(c => {
        const kernelConfig = c.config;
        const spawn = c.spawn;
        const connectionFile = c.connectionFile;
        const identity = uuid.v4();
        const channels = {
          shell: createShellSubject(identity, kernelConfig),
          iopub: createIOPubSubject(identity, kernelConfig),
          control: createControlSubject(identity, kernelConfig),
          stdin: createStdinSubject(identity, kernelConfig),
        };
        return {
          channels,
          connectionFile,
          spawn,
        };
      });
}

export function shutdownKernel(kernel) {
  if (kernel.channels) {
    kernel.channels.shell.complete();
    kernel.channels.iopub.complete();
    kernel.channels.stdin.complete();
    kernel.channels.control.complete();
  }
  if (kernel.spawn) {
    kernel.spawn.stdin.destroy();
    kernel.spawn.stdout.destroy();
    kernel.spawn.stderr.destroy();
    kernel.spawn.kill('SIGKILL');
  }
  if (kernel.connectionFile) {
    fs.unlinkSync(kernel.connectionFile);
  }
}
