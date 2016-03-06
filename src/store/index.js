import * as Rx from '@reactivex/rxjs';

export default function createStore(initialState, reducers) {
  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => {
      if (!action || !action.type || ! (action.type in reducers)) {
        console.error('Action not registered');
        console.error(action);
        console.error(action.type);
        return state; // no reduction
      }

      return reducers[action.type].call(null, state, action);
    },
    initialState || {}
  ).share();

  // Debugging time
  store.subscribe(null, (err) => {
    console.error('Error in the store', err);
  });

  let lastState = {};
  store.subscribe(st => {
    lastState = st;
  });

  function dispatch(action) {
    // We need the current state at this time
    return typeof action === 'function'
      ? action.call(null, subject, dispatch, lastState)
      : subject.next(action);
  }

  return {
    store,
    dispatch,
  };
}
