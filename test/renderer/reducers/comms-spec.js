const chai = require('chai');
const chaiImmutable = require('chai-immutable');
chai.use(chaiImmutable);

const expect = chai.expect;

import Immutable from 'immutable';

import commsReducer from '../../../src/notebook/reducers/comms';
import { CommsRecord } from '../../../src/notebook/records';

describe('registerCommTarget', () => {
  it('sets comm targets', () => {
    const state = new CommsRecord();

    const action = {type: 'REGISTER_COMM_TARGET', name: 'steve', handler: '?????'}

    const nextState = commsReducer(state, action);
    expect(nextState).to.deep.equal(state.setIn(['targets', 'steve'], '?????'))
  })
})
