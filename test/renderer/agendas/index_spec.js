import { expect } from 'chai';

import { updateCellSource, executeCell } from '../../../src/notebook/actions';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../../utils';

describe('agendas.executeCell', function() {
  this.timeout(5000);
  it('produces the right output', (done) => {
    setTimeout(done, 5000);
    return liveStore((kernel, dispatch, store) => {
      const cellId = store.getState().document.getIn(['notebook', 'cellOrder', 0]);
      const source = 'print("a")';
      dispatch(updateCellSource(cellId, source));

      // TODO: Remove hack
      // HACK: Wait 100ms before executing a cell because kernel ready and idle
      // aren't enough.  There must be another signal that we need to listen to.
      return (new Promise(resolve => setTimeout(resolve, 100)))
        .then(() => dispatch(executeCell(kernel.channels, cellId, source, true, undefined)))
        .then(() => dispatchQueuePromise(dispatch))
        .then(() => waitForOutputs(store, cellId))
        .then(() => {
          const output = store.getState().document.getIn(['notebook', 'cellMap', cellId, 'outputs', 0]).toJS();
          expect(output.name).to.equal('stdout');
          expect(output.text).to.equal('a\n');
          expect(output.output_type).to.equal('stream');
        });
    });
  });
});
