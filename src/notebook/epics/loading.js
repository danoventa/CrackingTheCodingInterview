import { emptyNotebook, emptyCodeCell, appendCell } from 'commutable';

import {
  newKernel,
} from '../actions';

const Rx = require('rxjs/Rx');
const fs = require('fs');
const commutable = require('commutable');

const path = require('path');

const Observable = Rx.Observable;

const readFileObservable = (filename, ...args) =>
  Observable.create(observer => {
    fs.readFile(filename, ...args, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next({ filename, data });
        observer.complete();
      }
    });
  });

export const LOAD = 'LOAD';
export const SET_NOTEBOOK = 'SET_NOTEBOOK';
export const NEW_NOTEBOOK = 'NEW_NOTEBOOK';

export const load = (filename) => ({ type: LOAD, filename });

export const newNotebook = (kernelSpecName, cwd) => ({
  type: NEW_NOTEBOOK,
  kernelSpecName,
  cwd: cwd || process.cwd(),
});

// Expects notebook to be JS Object or Immutable.js
export const notebookLoaded = (filename, notebook) => ({
  type: SET_NOTEBOOK,
  filename,
  notebook,
});

export const extractNewKernel = (filename, notebook) => {
  const cwd = (filename && path.dirname(path.resolve(filename))) || process.cwd();
  const kernelName = notebook.getIn(
    ['metadata', 'kernelspec', 'name'], notebook.getIn(
      ['metadata', 'language_info', 'name'],
        'python3')); // TODO: keep default kernel consistent
  return newKernel(kernelName, cwd);
};

export const convertRawNotebook = ({ filename, data }) => ({
  filename,
  notebook: commutable.fromJS(JSON.parse(data)),
});

// TODO: ERROR_LOADING response

export const loadEpic = actions =>
  actions.ofType(LOAD)
    .do(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error('load needs a filename');
      }
    })
    // Switch map since we want the last load request to be the lead
    .switchMap(action =>
      readFileObservable(action.filename)
        .map(convertRawNotebook)
        .flatMap(({ filename, notebook }) =>
          Observable.of(
            notebookLoaded(filename, notebook),
            extractNewKernel(filename, notebook),
          )
        )
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
    );

const starterNotebook = appendCell(emptyNotebook, emptyCodeCell);
export const newNotebookEpic = action$ =>
  action$.ofType(NEW_NOTEBOOK)
    .switchMap(action =>
      Observable.of(
        {
          type: 'SET_NOTEBOOK',
          notebook: starterNotebook,
        },
        newKernel(action.kernelSpecName, action.cwd),
      )
    );
