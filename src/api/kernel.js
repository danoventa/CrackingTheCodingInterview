import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export function launchKernel(kernelSpecName) {
  return launch(kernelSpecName)
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
