const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const expect = chai.expect;

const Immutable = require('immutable');
const GitHub = require('github');
const fromJS = Immutable.fromJS;
import { dummyCommutable } from '../dummy-nb';
import { dummyStore } from '../../utils';
import NotificationSystem from 'react-notification-system';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
import {
  publishNotebookObservable,
  createGistCallback,
  handleGistAction,
  handleGistError,
  notifyUser,
} from '../../../src/notebook/epics/github-publish';

describe('handleGistAction', () => {
  it('returns an observable from User Action', () => {
    const publishUserAction = { type: 'PUBLISH_USER_GIST' }
    const store = dummyStore();
    const handleGist = handleGistAction(publishUserAction, store);
    expect(handleGist.subscribe).to.not.be.null;
  });
  it('returns an observable from anonymous Action', () => {
    const publishAnonymousAction = { type: 'PUBLISH_ANONYMOUS_GIST' }
    const store = dummyStore();
    const handleGist = handleGistAction(publishAnonymousAction, store);
    expect(handleGist.subscribe).to.not.be.null;
  })
})

describe('publishNotebookObservable', () => {
    it('returns an observable', () => {
        const notificationSystem = NotificationSystem();
        const publishNotebookObs = publishNotebookObservable(new GitHub(),
          dummyCommutable, './test.ipynb', notificationSystem);
        expect(publishNotebookObs.subscribe).to.not.be.null;
    });

    it('renders a notification popup', () => {
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(new GitHub(),
        dummyCommutable, './test.ipynb', notificationSystem);
      const addNotification = sinon.spy(notificationSystem, 'addNotification');
      publishNotebookObs.subscribe( () => {
        expect(addNotification).to.be.called;
      });
    });

    it('calls create gist', () => {
      const github = new GitHub();
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(github,
        dummyCommutable, './test.ipynb', notificationSystem);
      const create = sinon.spy(github.gists, 'create');
      publishNotebookObs.subscribe( () => {
        expect(create).to.be.called;
      });
    });
    it('edits gist that is already made', () => {
      const github = new GitHub();
      const notebook = dummyCommutable.setIn(['metadata', 'gist_id'], 'ID123')
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(github,
        notebook, './test.ipynb', notificationSystem);
      const edit = sinon.spy(github.gists, 'edit');
      publishNotebookObs.subscribe( () => {
        expect(edit).to.be.called;
      });
    });
});

describe('createGistCallback', () => {
  it('returns a function', () => {
    const github = new GitHub();
    const notificationSystem = NotificationSystem();
    const publishNotebookObs = publishNotebookObservable(github,
      dummyCommutable, './test.ipynb', notificationSystem);
    const callback = createGistCallback(true, publishNotebookObs,
      './test.ipynb', notificationSystem);
    expect((typeof(callback))).to.equal('function');
  });
});

describe('notifyUser', () => {
  it('notifies a user that gist has been uploaded', () => {
    const store = dummyStore();
    const notification = store.getState().app.notificationSystem.addNotification;
    const notificationSystem = store.getState().app.notificationSystem;
    const notifyUserCall = notifyUser('filename', 'gistID', notificationSystem)
    expect(notification.calledWith({
      title: 'Gist uploaded',
      message: `filename is ready`,
      dismissible: true,
      position: 'tr',
      level: 'success',
      action: {
        label: 'Open Gist',
        callback: function openGist() {
          shell.openExternal(`https://nbviewer.jupyter.org/gistID`);
        },
      },
    }))
  })
})

describe('handleGistError', () => {
  it('handles bad credentials', () => {
    const store = dummyStore();
    const notification = store.getState().app.notificationSystem.addNotification;
    handleGistError(store, '{"message": "Bad credentials"}');
    expect(notification).to.be.calledWith({
      title: 'Bad credentials',
      message: 'Unable to authenticate with your credentials.\n' +
               'Please try again.',
      level: 'error',
    });
  });
  it('handles other errors', () => {
    const store = dummyStore();
    const notification = store.getState().app.notificationSystem.addNotification;
    handleGistError(store, '{"message": "this"}');
    expect(notification).calledWith({
      title: 'Publication Error',
      message: 'this',
      level: 'error',
    });
  })
  it('handles bad errors', () => {
    const store = dummyStore();
    const notification = store.getState().app.notificationSystem.addNotification;
    handleGistError(store, '{hi}');
    expect(notification).to.be.calledWith({
      title: 'Unknown Publication Error',
      message: 'hi',
      level: 'error',
    });
  });
});
