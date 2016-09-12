const chai = require('chai');
const chaiImmutable = require('chai-immutable');

chai.use(chaiImmutable);

const expect = chai.expect;

const Immutable = require('immutable');

const fromJS = Immutable.fromJS;

import {
  executeCell,
  EXECUTE_CELL,
  reduceOutputs,
} from '../../../src/notebook/epics/execute';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../../utils';

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
    const outputs = Immutable.fromJS([{name: 'stdout', text: 'hello'}])
    const newOutputs = reduceOutputs(outputs, fromJS({name: 'stdout', text: ' world' }));

    expect(newOutputs).to.equal(Immutable.fromJS([{name: 'stdout', text: 'hello world'}]));
  })
})
