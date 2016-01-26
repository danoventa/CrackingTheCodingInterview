import * as Rx from '@reactivex/rxjs';

export default function createStore(initialState, reducers) {

  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => reducers[action.type].call(null, state, action),
    initialState || {}
  );

  const dispatch = (action) => typeof action === 'function'
    ? action.call(null, subject)
    : subject.next(action);

  return {
    store,
    dispatch,
  };

}
