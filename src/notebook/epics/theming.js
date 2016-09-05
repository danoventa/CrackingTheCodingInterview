import storage from 'electron-json-storage';

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

const constants = require('../constants');

export const getStoredThemeObservable = () =>
  Observable.create(observer => {
    storage.get('theme', (error, data) => {
      if (error) {
        observer.error(error);
      } else if (Object.keys(data).length === 0) {
        observer.complete();
      } else {
        observer.next(data.theme);
      }
      observer.complete();
    });
  });

export const setStoredThemeObservable = (theme) =>
  Observable.create(observer => {
    storage.set('theme', { theme }, (error) => {
      if (error) {
        observer.error(error);
      }
      observer.complete();
    });
  });

export const setTheme = (theme) => ({
  type: constants.SET_THEME,
  theme,
});

export const getStoredThemeEpic = () =>
  // Basically a one-shot
  // Leaving this with the redux observable setup because
  // * This is our main asynchronous dispatch
  // * We could turn this into watching the theming file continuously
  getStoredThemeObservable()
    .map(setTheme);

// storage.set('theme', { theme });

export const setThemeEpic = (action$) =>
  action$.ofType(constants.SET_THEME)
    .mergeMap(action =>
      setStoredThemeObservable(action.theme)
    );
