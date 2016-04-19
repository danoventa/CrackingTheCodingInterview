const Rx = require('@reactivex/rxjs');
const commutable = require('commutable');
const path = require('path');

import { shell } from 'electron';

import {
  doneUploading,
  startedUploading,
  overwriteMetadata,
} from '../actions';

function notifyUser(filename, gistURL, gistID) {
  const title = 'Gist uploaded';
  const options = {
    body: `${filename} ready at ${gistURL}`,
  };
  const notification = new Notification(title, options);
  notification.onclick = function openGist() {
    shell.openExternal(`https://nbviewer.jupyter.org/${gistID}`);
  };
}

function createGistCallback(hotOffThePresses, agenda, filename) {
  return function gistCallback(err, response) {
    if (err) {
      agenda.error(err);
      agenda.complete();
      return;
    }

    const gistID = response.id;
    const gistURL = response.html_url;

    notifyUser(filename, gistURL, gistID);
    if (hotOffThePresses) {
      agenda.next(overwriteMetadata('gist_id', gistID));
    }
    agenda.next(doneUploading);
  };
}

export function publish(github, notebook, filepath) {
  return Rx.Observable.create((agenda) => {
    const files = {};
    const notebookString = JSON.stringify(commutable.toJS(notebook), undefined, 1);
    const filename = path.parse(filepath).base;
    files[filename] = { content: notebookString };

    agenda.next(startedUploading);

    // Already in a gist, update the gist
    if (notebook.hasIn(['metadata', 'gist_id'])) {
      const gistRequest = {
        files,
        id: notebook.getIn(['metadata', 'gist_id']),
      };
      github.gists.edit(gistRequest, createGistCallback(false, agenda, filename));
    } else {
      const gistRequest = {
        files,
        public: false,
      };
      github.gists.create(gistRequest, createGistCallback(true, agenda, filename));
    }
  });
}
