const chai = require('chai');
const chaiImmutable = require('chai-immutable');

chai.use(chaiImmutable);

const expect = chai.expect;

import { dummyStore } from '../../utils';

const Immutable = require('immutable');

const fromJS = Immutable.fromJS;

const Rx = require('rxjs/Rx');

import {
  executeCell,
  EXECUTE_CELL,
  reduceOutputs,
  executeCellObservable,
  executeCellEpic,
  createExecuteRequest,
  msgSpecToNotebookFormat,
  createPagerActions,
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

describe('reduceOutputs', () => {
  it('empties outputs when clear_output passed', () => {
    const outputs = Immutable.List([1,2,3]);
    const newOutputs = reduceOutputs(outputs, {output_type: 'clear_output'});
    expect(newOutputs.size).to.equal(0);
  })

  it('puts new outputs at the end by default', () => {
    const outputs = Immutable.List([1,2]);
    const newOutputs = reduceOutputs(outputs, 3)

    expect(newOutputs).to.equal(Immutable.List([1, 2, 3]));
  })

  it('merges streams of text', () => {
    const outputs = Immutable.fromJS([{name: 'stdout', text: 'hello', output_type: 'stream'}])
    const newOutputs = reduceOutputs(outputs, {name: 'stdout', text: ' world', output_type: 'stream' });

    expect(newOutputs).to.equal(Immutable.fromJS([{name: 'stdout', text: 'hello world', output_type: 'stream'}]));
  })

  it('keeps respective streams together', () => {
    const outputs = Immutable.fromJS([
      {name: 'stdout', text: 'hello', output_type: 'stream'},
      {name: 'stderr', text: 'errors are', output_type: 'stream'},
    ])
    const newOutputs = reduceOutputs(outputs, {name: 'stdout', text: ' world', output_type: 'stream' });

    expect(newOutputs).to.equal(Immutable.fromJS([
      {name: 'stdout', text: 'hello world', output_type: 'stream'},
      {name: 'stderr', text: 'errors are', output_type: 'stream'},
    ]));

    const evenNewerOutputs = reduceOutputs(newOutputs, {name: 'stderr', text: ' informative', output_type: 'stream' });
    expect(evenNewerOutputs).to.equal(Immutable.fromJS([
      {name: 'stdout', text: 'hello world', output_type: 'stream'},
      {name: 'stderr', text: 'errors are informative', output_type: 'stream'},
    ]));

  })
})

describe('executeCellObservable', () => {
  // TODO: Refactor executeCellObservable into separate testable observables
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

    const action$ = executeCellObservable(channels, '0', 'import this');

    action$
      .bufferCount(2)
      .subscribe(messages => {
        expect(messages).to.deep.equal([
          // TODO: Order doesn't actually matter here
          { type: 'UPDATE_CELL_PAGERS', id: '0', pagers: Immutable.List() },
          { type: 'UPDATE_CELL_OUTPUTS', id: '0', outputs: Immutable.List() },
        ]);
        done(); // TODO: Make sure message check above is called
      })


  })

  it('outright rejects a lack of channels.shell and iopub', (done) => {
    const obs = executeCellObservable({}, '0', 'woo')
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

    const pagerActions$ = createPagerActions('1', msgObs);

    pagerActions$.subscribe((action) => {
      const expected = [{ source: 'page', data: { 'text/html': 'this is a test' } } ];
      expect(action.id).to.equal('1');
      expect(action.pagers.toJS()).to.deep.equal(expected);
      done();
    });
  });
});
