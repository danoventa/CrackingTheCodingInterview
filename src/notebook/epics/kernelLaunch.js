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
} from '../kernel/messaging';

import {
  setExecutionState,
  newKernel,
  setNotebookKernelSpec,
} from '../actions';

import {
  NEW_KERNEL,
  LAUNCH_KERNEL,
  SET_LANGUAGE_INFO,
  SET_NOTEBOOK,
  ERROR_KERNEL_LAUNCH_FAILED,
} from '../constants';

const path = require('path');

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
        const { config, spawn, connectionFile, kernelSpec } = c;

        const identity = uuid.v4();
        // TODO: I'm realizing that we could trigger on when the underlying sockets
        //       are ready with these subjects to let us know when the kernels
        //       are *really* ready
        const channels = {
          shell: createShellSubject(identity, config),
          iopub: createIOPubSubject(identity, config),
          control: createControlSubject(identity, config),
          stdin: createStdinSubject(identity, config),
        };

        observer.next(setNotebookKernelSpec({
          name: kernelSpecName,
          spec: kernelSpec,
        }));

        observer.next({
          type: NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
          kernelSpecName,
          kernelSpec,
        });
      });
  });
}

export const watchExecutionStateEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .switchMap(action =>
      Rx.Observable.merge(
        action.channels.iopub
          .filter(msg => msg.header.msg_type === 'status')
          .map(msg => setExecutionState(msg.content.execution_state)),
        Rx.Observable.of(setExecutionState('idle'))
      )
    );

export const acquireKernelInfoEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .switchMap(action =>
      acquireKernelInfo(action.channels)
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
    )
    .catch(error => Rx.Observable.of({
      type: ERROR_KERNEL_LAUNCH_FAILED,
      payload: error,
      error: true,
    }));

export const newNotebookKernelEpic = action$ =>
  action$.ofType(SET_NOTEBOOK)
    .do(action => {
      if (!action.data) {
        throw new Error('newNotebookKernel needs notebook data');
      }
    }).map(action => {
      const { filename, data } = action;
      const cwd = (filename && path.dirname(path.resolve(filename))) || process.cwd();
      const kernelName = data.getIn([
        'metadata', 'kernelspec', 'name',
      ], data.getIn([
        'metadata', 'language_info', 'name',
      ], 'python3')); // TODO: keep default kernel consistent
      return newKernel(kernelName, cwd);
    });
