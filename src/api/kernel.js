import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export default function launchKernel(kernelSpecName) {
  return launch(kernelSpecName)
      .then(c => {
        const kernel = c.config;
        const spawn = c.spawn;
        const connectionFile = c.connFile;
        const identity = uuid.v4();
        const channels = {
          shell: createShellSubject(identity, kernel),
          iopub: createIOPubSubject(identity, kernel),
          control: createControlSubject(identity, kernel),
          stdin: createStdinSubject(identity, kernel),
        };
        return {
          channels,
          connectionFile,
          spawn,
        };
      });
}
