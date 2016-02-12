import * as Rx from '@reactivex/rxjs';

export default function createStore(initialState, reducers) {

  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => reducers[action.type].call(null, state, action),
    initialState || {}
  );

  function dispatch(action) {
    return typeof action === 'function'
      ? action.call(null, subject, dispatch)
      : subject.next(action);
  }

  return {
    store,
    dispatch,
  };

}
