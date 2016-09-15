const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const expect = chai.expect;

const Immutable = require('immutable');
const GitHub = require('github');
const fromJS = Immutable.fromJS;
import { dummyCommutable } from '../dummy-nb';
import NotificationSystem from 'react-notification-system';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
import {
  publishNotebookObservable,
  createGistCallback
} from '../../../src/notebook/epics/github-publish';

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
    console.log(callback);
    expect((typeof(callback))).to.equal('function');
  });
});
