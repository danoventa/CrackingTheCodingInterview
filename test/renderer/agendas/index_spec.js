import { expect } from 'chai';

import { updateCellSource, executeCell } from '../../../src/notebook/actions';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../../utils';

describe('agendas.executeCell', () => {
  it('is a thunk (returns a function)', function() {
    const thunk = executeCell();
    expect(thunk).to.not.be.undefined;
    expect(thunk).to.be.a('function');
  });
  it('thunk returns an observable', function() {
    const thunk = executeCell();
    expect(thunk).to.not.be.undefined;
    expect(thunk).to.be.a('function');

    const observable = thunk();
    expect(observable).to.not.be.undefined;
    expect(observable.subscribe).to.be.a('function');
  });
});
