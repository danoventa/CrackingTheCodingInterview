import { shell } from 'electron';

import {
  overwriteMetadata,
} from '../actions';

import {
  SET_GITHUB,
} from '../constants';

const commutable = require('commutable');
const path = require('path');

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

const Github = require('github');

export const githubAuthObservable = (authOptions) =>
  Observable.create(observer => {
    if (authOptions.token && authOptions.type) {
      observer.next(new Github(authOptions));
    } else {
      observer.next(new Github());
    }
    observer.complete();
  });

export const setGithub = (github) => ({
  type: SET_GITHUB,
  github,
});

export const PUBLISH_GIST = 'PUBLISH_GIST';

export const initialGitHubAuthEpic = () => {
  const auth = {};
  if (process.env.GITHUB_TOKEN) {
    auth.type = 'oauth';
    auth.token = process.env.GITHUB_TOKEN;
  }
  return githubAuthObservable(auth)
    .catch(err => {
      // TODO: Prompt?
      console.error(err);
      return new Github(); // Fall back to no auth
    })
    .map(setGithub);
};

function notifyUser(filename, gistURL, gistID, notificationSystem) {
  notificationSystem.addNotification({
    title: 'Gist uploaded',
    message: `${filename} is ready`,
    dismissible: true,
    position: 'tr',
    level: 'success',
    action: {
      label: 'Open Gist',
      callback: function openGist() {
        shell.openExternal(`https://nbviewer.jupyter.org/${gistID}`);
      },
    },
  });
}

function createGistCallback(hotOffThePresses, observer, filename, notificationSystem) {
  return function gistCallback(err, response) {
    if (err) {
      observer.error(err);
      observer.complete();
      return;
    }

    const gistID = response.id;
    const gistURL = response.html_url;

    notifyUser(filename, gistURL, gistID, notificationSystem);
    if (hotOffThePresses) {
      // TODO: Move this up and out to be handled as a return on the observable
      observer.next(overwriteMetadata('gist_id', gistID));
    }
  };
}

export function publishNotebookObservable(github, notebook, filepath, notificationSystem) {
  return Rx.Observable.create((observer) => {
    const notebookString = JSON.stringify(commutable.toJS(notebook), undefined, 1);

    let filename;

    if (filepath) {
      filename = path.parse(filepath).base;
    } else {
      filename = 'Untitled.ipynb';
    }

    const files = {};
    files[filename] = { content: notebookString };

    notificationSystem.addNotification({
      title: 'Uploading gist...',
      message: 'Your notebook is being uploaded as a GitHub gist',
      level: 'info',
    });

    // Already in a gist, update the gist
    if (notebook.hasIn(['metadata', 'gist_id'])) {
      const gistRequest = {
        files,
        id: notebook.getIn(['metadata', 'gist_id']),
      };
      github.gists.edit(gistRequest,
        createGistCallback(false, observer, filename, notificationSystem));
    } else {
      const gistRequest = {
        files,
        public: false,
      };
      github.gists.create(gistRequest,
        createGistCallback(true, observer, filename, notificationSystem));
    }
  });
}


export const publishEpic = (action$, store) =>
  action$.ofType(PUBLISH_GIST)
    .mergeMap(() => {
      // TODO: Determine if action should have the notebook or if it should be pulled from store
      const state = store.getState();
      const notebook = state.document.get('notebook');
      const filename = state.metadata.get('filename');
      const github = state.app.get('github');
      const notificationSystem = state.app.get('notificationSystem');

      return publishNotebookObservable(github, notebook, filename, notificationSystem);
    })
    .catch((err) => {
      const state = store.getState();
      const notificationSystem = state.app.get('notificationSystem');
      // TODO: Let this go into the general error flow
      if (err.message) {
        const githubError = JSON.parse(err.message);
        if (githubError.message === 'Bad credentials') {
          notificationSystem.addNotification({
            title: 'Bad credentials',
            message: 'Unable to authenticate with your credentials.\n' +
                     'What do you have $GITHUB_TOKEN set to?',
            level: 'error',
          });
          return;
        }
        notificationSystem.addNotification({
          title: 'Publication Error',
          message: githubError.message,
          level: 'error',
        });
        return;
      }
      notificationSystem.addNotification({
        title: 'Unknown Publication Error',
        message: err.toString(),
        level: 'error',
      });
    });
