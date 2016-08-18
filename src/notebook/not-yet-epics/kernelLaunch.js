/**
* TODO: Convert to Epic by
*   - following guidance in https://github.com/nteract/nteract/issues/579
*   - checking out epics/saving.js
*/

import Rx from 'rxjs/Rx';

import { launchKernel } from '../api/kernel';
import { acquireKernelInfo } from '../agendas';

import { setExecutionState } from '../actions';

import { NEW_KERNEL } from '../constants';

export function newKernel(kernelSpecName, cwd) {
  return () => Rx.Observable.create((subscriber) => {
    launchKernel(kernelSpecName, { cwd })
    .then(kc => {
      const { channels, connectionFile, spawn } = kc;

      // Listen to the execution status of the kernel
      channels.iopub
        .filter(msg => msg.header.msg_type === 'status')
        .first()
        .map(msg => msg.content.execution_state)
        .subscribe((state) => subscriber.next(setExecutionState(state)));
        // TODO: Determine if the execution state gets set elsewhere (I think it does)
        // TODO: Possibly only grab the first for this one or unsubscribe

      acquireKernelInfo(channels)
        .subscribe(action => {
          subscriber.next(action);
          subscriber.next(setExecutionState('idle'));
        });

      subscriber.next({
        type: NEW_KERNEL,
        channels,
        connectionFile,
        spawn,
        kernelSpecName,
      });
    })
    .catch((err) => console.error(err));
  });
}
