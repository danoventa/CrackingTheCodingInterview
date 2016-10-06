const Rx = require('rxjs/Rx');
const Observable = Rx.Observable;

const jupyterPaths = require('jupyter-paths');

import { MERGE_CONFIG } from '../constants';

export const LOAD_CONFIG = 'LOAD_CONFIG';
export const loadConfig = () => ({type: LOAD_CONFIG });

const readFileObservable = (filename, ...args) =>
  Observable.create(observer => {
    fs.readFile(filename, ...args, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(data);
        observer.complete();
      }
    })
  });

export const configLoaded = (config) => ({
  type: MERGE_CONFIG,
  config,
});

export const getConfigFilePath = () => {
  `${jupyterPaths.dataDir()[0]}/nteract.json`
}

export const loadConfigEpic = actions =>
  actions.ofType(LOAD_CONFIG)
    .do(action =>
      readFileObservable(getConfigFilePath())
        .map(JSON.parse)
        .map(configLoaded(config))
        )
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
      );
