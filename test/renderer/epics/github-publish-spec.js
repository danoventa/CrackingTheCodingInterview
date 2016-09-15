const chai = require('chai');
const chaiImmutable = require('chai-immutable');

chai.use(chaiImmutable);

const expect = chai.expect;

const Immutable = require('immutable');
const GitHub = require('github');
const fromJS = Immutable.fromJS;
import { dummyCommutable } from '../dummy-nb';
import { notificationSystem } from 'react-notification-system';

import {
  publishNotebookObservable
} from '../../../src/notebook/epics/github-publish';

describe('publishNotebookObservable', () => {
    it('returns an observable', () => {
        const publishNotebookObs = publishNotebookObservable(new GitHub(),
          dummyCommutable, './test.ipynb', notificationSystem);
        expect(publishNotebookObs.subscribe).to.not.be.null;
    });
});
