import Rx from 'rxjs/Rx';

import { launch } from 'spawnteract';

import * as uuid from 'uuid';

import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import {
  createMessage,
} from '../api/messaging';

import { setExecutionState } from '../actions';

import { NEW_KERNEL, LAUNCH_KERNEL, SET_LANGUAGE_INFO } from '../constants';

export function setLanguageInfo(langInfo) {
  return {
    type: SET_LANGUAGE_INFO,
    langInfo,
  };
}

export function acquireKernelInfo(channels) {
  const { shell } = channels;

  const message = createMessage('kernel_info_request');

  const obs = shell
    .childOf(message)
    .ofMessageType('kernel_info_reply')
    .first()
    .pluck('content', 'language_info')
    .map(setLanguageInfo)
    .publishReplay(1)
    .refCount();

  shell.next(message);
  return obs;
}

export function newKernelObservable(kernelSpecName, cwd) {
  return Rx.Observable.create((observer) => {
    launch(kernelSpecName, { cwd })
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
      })
    .then(kc => {
      const { channels, connectionFile, spawn } = kc;

      // Listen to the execution status of the kernel
      channels.iopub
        .filter(msg => msg.header.msg_type === 'status')
        .first()
        .map(msg => msg.content.execution_state)
        .subscribe((state) => observer.next(setExecutionState(state)));
        // TODO: Determine if the execution state gets set elsewhere (I think it does)
        // TODO: Possibly only grab the first for this one or unsubscribe

      acquireKernelInfo(channels)
        .subscribe(action => {
          observer.next(action);
          observer.next(setExecutionState('idle'));
        });

      observer.next({
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


export const newKernelEpic = action$ =>
  action$.ofType(LAUNCH_KERNEL)
    .do(action => {
      if (!action.kernelSpecName) {
        throw new Error('newKernel needs a kernelSpecName');
      }
    })
    .mergeMap(action =>
      newKernelObservable(action.kernelSpecName, action.cwd)
    );
