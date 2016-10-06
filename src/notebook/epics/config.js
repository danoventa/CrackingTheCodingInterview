import { MERGE_CONFIG } from '../constants';

const Rx = require('rxjs/Rx');
const jupyterPaths = require('jupyter-paths');

const Observable = Rx.Observable;

export const LOAD_CONFIG = 'LOAD_CONFIG';
export const loadConfig = () => ({ type: LOAD_CONFIG });

const readFileObservable = (filename, ...args) =>
  Observable.create(observer => {
    fs.readFile(filename, ...args, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(data);
        observer.complete();
      }
    });
  });

export const configLoaded = (config) => ({
  type: MERGE_CONFIG,
  config,
});

export const CONFIG_FILE_PATH = `${jupyterPaths.dataDirs()[0]}/nteract.json`;

export const loadConfigEpic = actions =>
  actions.ofType(LOAD_CONFIG)
    .do(action =>
      readFileObservable(CONFIG_FILE_PATH)
        .map(JSON.parse)
        .map(configLoaded(config))
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
      );
