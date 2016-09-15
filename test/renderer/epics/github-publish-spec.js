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
  publishNotebookObservable
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
        expect(notificationSystem.addNotification).to.be.called;
      });
    });
});
