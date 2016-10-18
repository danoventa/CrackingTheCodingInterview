import { writeFileObservable } from '../../utils/fs';

const Rx = require('rxjs/Rx');
const commutable = require('commutable');

const Observable = Rx.Observable;

export const SAVE = 'SAVE';
export const SAVE_AS = 'SAVE_AS';
export const CHANGE_FILENAME = 'CHANGE_FILENAME';
export const DONE_SAVING = 'DONE_SAVING';

export const changeFilename = filename => ({ type: CHANGE_FILENAME, filename });
export const save = (filename, notebook) => ({ type: SAVE, filename, notebook });
export const saveAs = (filename, notebook) => ({ type: SAVE_AS, filename, notebook });
export const doneSaving = () => ({ type: DONE_SAVING });

export const saveEpic = actions =>
  actions.ofType(SAVE)
    .do(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error('save needs a filename');
      }
    })
    .mergeMap(action =>
      writeFileObservable(action.filename,
        JSON.stringify(
          commutable.toJS(
            action.notebook.update('cellMap', (cells) =>
              cells.map((value) =>
                value.delete('inputHidden').delete('outputHidden').delete('status')))),
          null,
          1))
        .map(doneSaving)
        // .startWith({ type: START_SAVING })
        // since SAVE effectively acts as the same as START_SAVING
        // you could just look for that in your reducers instead of START_SAVING
    );

export const saveAsEpic = actions =>
  actions.ofType(SAVE_AS)
    .mergeMap(action => [
      changeFilename(action.filename),
      save(action.filename, action.notebook),
    ]);
