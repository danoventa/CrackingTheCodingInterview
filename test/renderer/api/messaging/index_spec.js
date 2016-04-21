import { expect } from 'chai';
import { childOf } from '../../../../src/notebook/api/messaging';

const Rx = require('@reactivex/rxjs');

describe('childOf', () => {
  it('filters messages that have the same parent', () => {
    return Rx.Observable.from([
      {parent_header: {msg_id: '100'}},
      {parent_header: {msg_id: '100'}},
      {parent_header: {msg_id: '200'}},
      {parent_header: {msg_id: '300'}},
      {parent_header: {msg_id: '100'}},
    ])
    .childOf({header: {msg_id: '100'}})
    .count()
    .toPromise()
    .then(val => {
      expect(val).to.equal(3);
    });
  });
});
