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



/**
 * Create an observable stream containing the Github API
 * @param {object} authOptions - The authorization information, right now
 * this is just oauth token and corresponding type, but can be username
 * and password later, https://developer.github.com/v3/#authentication
 */
export const githubAuthObservable = (authOptions) =>
  Observable.create(observer => {
    if (authOptions) {
      // Right now this doesn't actually do anything as far as I can tell
      observer.next(new Github(authOptions));
    } else {
      observer.next(new Github());
    }
    observer.complete();
  });

/**
 * TODO I have no idea what this does yet
 * @param {}
 */
export const setGithub = (github) => ({
  type: SET_GITHUB,
  github
});

export const PUBLISH_GIST = 'PUBLISH_GIST';

/**
 *
 * @throws
 * @return Observable containing oauth token
 */
export const initialGitHubAuthEpic = () => {
  const auth = {};
  if (process.env.GITHUB_TOKEN) {
    auth.type = 'oauth';
    auth.token = process.env.GITHUB_TOKEN;
  }
  // TODO, what is the purpose of setGithub?
  return githubAuthObservable(auth)
    .catch(err => {
      // TODO: Prompt?
      console.error(err);
      return new Github(); // Fall back to no auth
    })
    .map(setGithub);
};

/**
 * Notify the notebook user that it has been published as a gist.
 * @param {string} filename - Filename of the notebook.
 * @param {string} gistURL - URL for the published gist.
 * @param {string} gistID - ID of the published gist, given after URL
 * @param {object} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
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

/**
 * Callback function to be used in publishNotebookObservable such that the
 * response from the github API can be used for user notification.
 * @param {boolean} firstTimePublish - If false, overwrite gist_id metdata.
 * @param {object} observer - The publishNotebookObserver that will be
 * completed after the callback.
 * @param {string} filename - Filename of the notebook.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 * @return callbackFunction for use in publishNotebookObservable
 */
function createGistCallback(firstTimePublish, observer, filename, notificationSystem) {
  return function gistCallback(err, response) {
    if (err) {
      observer.error(err);
      observer.complete();
      return;
    }
    const gistID = response.id;
    const gistURL = response.html_url;

    notifyUser(filename, gistURL, gistID, notificationSystem);
    if (firstTimePublish) {
      // TODO: Move this up and out to be handled as a return on the observable
      observer.next(overwriteMetadata('gist_id', gistID));
    }
  };
}

/**
 * Notebook Observable for the purpose of tracking every time a user
 * wishes to publish a gist.
 * @param {object} github - The github api for authenticating and publishing
 * the gist.
 * @param {object} notebook - The notebook to be converted to its JSON.
 * @param {string} filename - The filename of the notebook to be published.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
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
    // Hacky fix to authenticate user, according to docs this is synchronous
    // and may break things, TODO, figure out how to make this not possibly
    // break things
    if(process.env.GITHUB_TOKEN) {
      github.authenticate({type:'oauth', token: process.env.GITHUB_TOKEN});
    }
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

/**
 * Epic to capture the end to end action of publishing and receiving the
 * response from the Github API.
 */
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
