const chai = require('chai');
const chaiImmutable = require('chai-immutable');

chai.use(chaiImmutable);


import { dummyStore } from '../../utils';

import { ActionsObservable } from 'redux-observable';

const Immutable = require('immutable');

const fromJS = Immutable.fromJS;

const expect = chai.expect;

const sinon = require('sinon');

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;
import {
  EXECUTE_CELL,
  UPDATE_CELL_EXECUTION_COUNT,
  ERROR_EXECUTING,
  ERROR_UPDATE_DISPLAY,
  CLEAR_OUTPUTS,
  UPDATE_CELL_STATUS,
  UPDATE_CELL_PAGERS,
  UPDATE_CELL_OUTPUTS,
 } from '../../../src/notebook/constants';

import { executeCell } from '../../../src/notebook/actions';
import {
  reduceOutputs,
  executeCellStream,
  executeCellEpic,
  updateDisplayEpic,
  createExecuteRequest,
  msgSpecToNotebookFormat,
  createPagerActions,
  createSourceUpdateAction,
  createCellAfterAction,
  createCellStatusAction,
  createExecuteCellStream,
  updateCellNumberingAction,
  handleFormattableMessages,
  createErrorActionObservable,
} from '../../../src/notebook/epics/execute';

describe('executeCell', () => {
  it('returns an executeCell action', () => {
    expect(executeCell('0-0-0-0', 'import random; random.random()'))
      .to.deep.equal({
        type: EXECUTE_CELL,
        id: '0-0-0-0',
        source: 'import random; random.random()',
      });
  });
});


describe('executeCellStream', () => {
  // TODO: Refactor executeCelStream into separate testable observables
  it('is entirely too insane for me to test this well right this second', (done) => {
    const frontendToShell = new Rx.Subject();
    const shellToFrontend = new Rx.Subject();
    const mockShell = Rx.Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Rx.Subject();

    const channels = {
      shell: mockShell,
      iopub: mockIOPub,
    };

    // Expect message to have been sent
    frontendToShell
      .subscribe(msg => {
        expect(msg.header.msg_type).to.equal('execute_request');
        expect(msg.content.code).to.equal('import this');
      })

    const action$ = executeCellStream(channels, '0', 'import this');

    action$
      .bufferCount(3)
      .subscribe(messages => {
        expect(messages).to.deep.equal([
          // TODO: Order doesn't actually matter here
          { type: 'CLEAR_OUTPUTS', id: '0' },
          { type: 'UPDATE_CELL_STATUS', id: '0', status: 'busy' },
          { type: 'UPDATE_CELL_PAGERS', id: '0', pagers: Immutable.List() },
        ]);
        done(); // TODO: Make sure message check above is called
      })


  })

  it('outright rejects a lack of channels.shell and iopub', (done) => {
    const obs = executeCellStream({}, '0', 'woo')
    obs.subscribe(null, (err) => {
        expect(err.message).to.equal('kernel not connected');
        done();
    })

  })
});

describe('createExecuteRequest', () => {
  it('creates an execute_request message', () => {
    const code = 'print("test")';
    const executeRequest = createExecuteRequest(code);

    expect(executeRequest.content.code).to.equal(code);
    expect(executeRequest.header.msg_type).to.equal('execute_request');
  });
});

describe('msgSpecToNotebookFormat', () => {
  it('converts a message to the notebook format', () => {
    const msg = {content: {data: 'test'}, header: {msg_type: 'test_header'}};
    const notebookSpecMsg = msgSpecToNotebookFormat(msg);

    expect(notebookSpecMsg).to.have.property('output_type');
    expect(notebookSpecMsg).to.have.property('data');
    expect(notebookSpecMsg.output_type).to.equal('test_header');
  });
});

describe('createPagerActions', () => {
  it('emits actions to set pagers', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'page',
      data: {'text/html': 'this is a test'},
    }]);

    const pagerAction$ = createPagerActions('1', msgObs);

    pagerAction$.subscribe((action) => {
      const expected = [{ source: 'page', data: { 'text/html': 'this is a test' } } ];
      expect(action.id).to.equal('1');
      expect(action.pagers.toJS()).to.deep.equal(expected);
      done();
    });
  });
});

describe('createCellAfterAction', () => {
  it('emits a createCellAfter action', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'set_next_input',
      text: 'This is some test text.',
      replace: false,
    }]);

    const cellAction$ = createCellAfterAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      done();
    });
  });
});

describe('createCellStatusAction', () => {
  it('emits an updateCellStatus action', (done) => {
    const msgObs = Rx.Observable.from([{
      header: {
        msg_id: '123',
        msg_type: 'status',
      },
      parent_header: {},
      content: {
        'execution_state': 'idle',
      },
      metadata: {},
    }]);

    const cellAction$ = createCellStatusAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      expect(action.status).to.equal('idle');
      done();
    });
  });
});

describe('updateCellNumberingAction', () => {
  it('emits updateCellExecutionCount action', (done) => {
    const msgObs = Rx.Observable.from([{
      header: {
        msg_id: '123',
        msg_type: 'execute_input',
      },
      parent_header: {},
      content: {
        'execution_count': 3,
      },
      metadata: {},
    }]);

    const cellAction$ = updateCellNumberingAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      expect(action.count).to.equal(3);
      done();
    });
  });
});

describe('createSourceUpdateAction', () => {
  it('emits updateCellSource action', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'set_next_input',
      text: 'This is some test text.',
      replace: true,
    }]);

    const cellAction$ = createSourceUpdateAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.source).to.equal('This is some test text.');
      done();
    });
  });
});
describe('createExecuteCellStream', () => {
  it('errors if the kernel is not connected in create', (done) => {
      const frontendToShell = new Rx.Subject();
      const shellToFrontend = new Rx.Subject();
      const mockShell = Rx.Subject.create(frontendToShell, shellToFrontend);
      const mockIOPub = new Rx.Subject();
      const store = { getState: function() { return this.state; },
                state: {
                  app: {
                    executionState: 'not connected',
                    channels: { iopub: mockIOPub,
                                shell: mockShell,
                              },
                    notificationSystem: {
                      addNotification: sinon.spy(),
                    },
                  }
                },
              };
      const action$ = ActionsObservable.of({type: 'EXECUTE_CELL'});
      const observable = createExecuteCellStream(action$, store, 'source', 'id');
      const actionBuffer = [];
      const subscription = observable.subscribe(
        (x) => actionBuffer.push(x.payload),
        (err) => expect.fail(err, null),
        () => { expect(actionBuffer).to.deep.equal(['Kernel not connected!']);
                done(); },
      )
  });
  it('doesnt complete but does push until abort action', (done) => {
      const frontendToShell = new Rx.Subject();
      const shellToFrontend = new Rx.Subject();
      const mockShell = Rx.Subject.create(frontendToShell, shellToFrontend);
      const mockIOPub = new Rx.Subject();
      const store = { getState: function() { return this.state; },
                state: {
                  app: {
                    executionState: 'connected',
                    channels: { iopub: mockIOPub,
                                shell: mockShell,
                              },
                    notificationSystem: {
                      addNotification: sinon.spy(),
                    },
                  }
                },
              };
    const action$ = ActionsObservable.of({type: 'EXECUTE_CELL', id: 'id' },
                                         {type: 'EXECUTE_CELL', id: 'id_2' },
                                         {type: 'ABORT_EXECUTION', id: 'id_2' },
                                         {type: 'EXECUTE_CELL', id: 'id' });
    const observable = createExecuteCellStream(action$, store, 'source', 'id');
    const actionBuffer = [];
    const subscription = observable.subscribe(
      (x) => actionBuffer.push(x.type),
      (err) => expect.fail(err, null),
    );
    expect(actionBuffer).to.deep.equal([ CLEAR_OUTPUTS, UPDATE_CELL_STATUS, UPDATE_CELL_PAGERS ]);
    done();
  });
})

describe('executeCellEpic', () => {
  const store = { getState: function() { return this.state; },
            state: {
              app: {
                executionState: 'idle',
                channels: 'errorInExecuteCellObservable',
                notificationSystem: {
                  addNotification: sinon.spy(),
                },
                token: 'blah'
              }
            },
          };
  it('Errors on a bad action', (done) => {
    const badInput$ = Observable.of({ type: EXECUTE_CELL });
    const badAction$ = new ActionsObservable(badInput$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(badAction$, store).catch(error => {
      expect(error.message).to.equal('execute cell needs an id');
    });
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([ERROR_EXECUTING]);
        done();
      },
    );
  });
  it('Errors on an action where source not a string', (done) => {
    const badInput$ = Observable.of(executeCell('id', 2));
    const badAction$ = new ActionsObservable(badInput$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(badAction$, store).catch(error=> {
      expect(error.message).to.equal('execute cell needs source string');
    });
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([ERROR_EXECUTING]);
        done();
      },
    );
  });
  it('Runs an epic with the appropriate flow with good action', (done) => {
    const input$ = Observable.of(executeCell('id', 'source'));
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(action$, store);
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.payload.toString()), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal(['Error: kernel not connected']); // ;
        done();
      },
    );
  });
})

describe('updateDisplayEpic', () => {
  it('creates an epic that handles update_display_data messages', (done) => {
    const messages = [
      // Should be processed
      { header: { msg_type: 'update_display_data' },
        content: {
          data: { 'text/html': '<marquee>wee</marquee>' },
          transient: { display_id: '1234' },
        },
      },
      // Should not be processed
      { header: { msg_type: 'display_data' },
        content: {
          data: { 'text/html': '<marquee>wee</marquee>' },
          transient: { display_id: '5555' },
        },
      },
      { header: { msg_type: 'ignored' },
        content: {
          data: { 'text/html': '<marquee>wee</marquee>' },
        },
      },
      // Should be processed
      { header: { msg_type: 'update_display_data' },
        content: {
          data: { 'text/plain': 'i am text' },
          transient: { display_id: 'here' },
        },
      },
    ];

    const channels = {
      iopub: Observable.from(messages),
    };
    const kernel$ = Observable.of({ type: 'NEW_KERNEL', channels });
    const action$ = new ActionsObservable(kernel$);

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      (action) => responseActions.push(action),
      (err) => { throw err; },
      () => {
        expect(responseActions).to.deep.equal([
          { type: 'UPDATE_DISPLAY',
            output: {
              output_type: 'display_data',
              data: { 'text/html': '<marquee>wee</marquee>' },
              transient: { display_id: '1234' },
            }
          },
          { type: 'UPDATE_DISPLAY',
            output: {
              output_type: 'display_data',
              data: { 'text/plain': 'i am text' },
              transient: { display_id: 'here' },
            }
          },
        ])
        done();
      }
    )

  })
})

describe('createErrorActionObservable', () => {
  it('returns a function that creates an observable', (done) => {
    const func = createErrorActionObservable('TEST_IT')
    const err = new Error('HEY');
    const obs = func(err);

    obs.subscribe(x => {
      expect(x.type).to.equal('TEST_IT');
      expect(x.payload).to.equal(err);
      expect(x.error).to.equal(true);
    }, (err) => { throw err; },
    () => {
      done();
    });

  })
})
