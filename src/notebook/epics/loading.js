import { emptyNotebook, emptyCodeCell, appendCell } from 'commutable';

const Rx = require('rxjs/Rx');
const fs = require('fs');
const commutable = require('commutable');
const immutable = require('immutable');

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

// It's Immutable!
const starterNotebook = appendCell(emptyNotebook, emptyCodeCell);

export const newNotebook = (kernelspec) => {
  const action = {
    type: SET_NOTEBOOK,
    filename: null,
    notebook: starterNotebook,
  };

  if (kernelspec) {
    action.notebook = action.notebook.setIn(['metadata', 'kernelspec'],
      immutable.fromJS({
        name: kernelspec.name,
        language: kernelspec.spec.language,
        display_name: kernelspec.spec.display_name,
      }));
  }
  return action;
};


// Expects notebook to be JS Object or Immutable.js
export const notebookLoaded = ({ filename, notebook }) => ({
  type: SET_NOTEBOOK,
  filename,
  notebook,
});

const convertRawNotebook = ({ filename, data }) => ({
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
    .mergeMap(action =>
      readFileObservable(action.filename)
        .map(convertRawNotebook)
        .map(notebookLoaded)
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
    );
