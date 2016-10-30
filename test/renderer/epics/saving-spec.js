import { expect } from 'chai';

import {
  dummyCommutable
} from '../dummy-nb';

import { ActionsObservable } from 'redux-observable';

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

import {
  save,
  saveAs,
  SAVE,
  SAVE_AS,
  saveEpic,
  saveAsEpic,
} from '../../../src/notebook/epics/saving';


describe('save', () => {
  it('creates a SAVE action', () => {
    expect(save('test/test-save.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE,
        filename: 'test/test-save.ipynb',
        notebook: dummyCommutable,
    });
  });
});

describe('saveAs', () => {
  it('creates a SAVE_AS action', () => {
    expect(saveAs('test/test-saveas.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE_AS,
        filename: 'test/test-saveas.ipynb',
        notebook: dummyCommutable,
    });
  });
  it.skip('creates a CHANGE_FILENAME action', () => {
    // We need to test that the epic triggers a CHANGE_FILENAME
    expect.fail();
  });
});

describe('saveEpic', () => {
  it('throws an error when no filename provided', () => {
    const input$ = Observable.of({type: SAVE });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = saveEpic(action$).catch(error => {
      expect(error.message).to.equal('save needs a filename');
      done();
    })
    responseActions.subscribe(
      actionBuffer.push, // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([]); // ;
      });
  });
})
