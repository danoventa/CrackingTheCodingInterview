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

export function shutdownKernel(channels, spawn, connectionFile) {
  if (channels) {
    channels.shell.complete();
    channels.iopub.complete();
    channels.stdin.complete();
  }
  if (spawn) {
    spawn.stdin.destroy();
    spawn.stdout.destroy();
    spawn.stderr.destroy();
    spawn.kill('SIGKILL');
  }
  if (connectionFile) {
    fs.unlinkSync(connectionFile);
  }
}
