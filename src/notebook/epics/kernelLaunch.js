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

/**
 * TODO: Ideally this flow of actions should be:
 *
 * LAUNCH_KERNEL
 * KERNEL_LAUNCHED
 * ACQUIRE_KERNEL_INFO
 * SET_LANGUAGE_INFO
 * KERNEL_READY
 *
 */

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
    .cache(1);

  shell.next(message);
  return obs;
}

export function newKernelObservable(kernelSpecName, cwd) {
  return Rx.Observable.create((observer) => {
    launch(kernelSpecName, { cwd })
      .then(c => {
        const { config, spawn, connectionFile } = c;
        const identity = uuid.v4();
        const channels = {
          shell: createShellSubject(identity, config),
          iopub: createIOPubSubject(identity, config),
          control: createControlSubject(identity, config),
          stdin: createStdinSubject(identity, config),
        };

        observer.next({
          type: NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
          kernelSpecName,
        });
      });
  });
}

export const watchExecutionStateEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .mergeMap(action =>
      action.channels.iopub
        .filter(msg => msg.header.msg_type === 'status')
        .map(msg => setExecutionState(msg.content.execution_state))
          // TODO: Determine if the execution state gets set elsewhere (I think it does)
          // TODO: Possibly only grab the first for this one or unsubscribe
    );

export const acquireKernelInfoEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .mergeMap(action =>
      // TODO: This Observable should be cancelled if another NEW_KERNEL occurs
      acquireKernelInfo(action.channels)
        // delay request for kernel to _really_ be ready
        .delay(200)
    );

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
