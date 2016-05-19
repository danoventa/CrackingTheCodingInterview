import Rx from 'rxjs/Rx';

export class BackendToRedux {
  constructor(store, dispatch) {
    this.dispatch = dispatch;
    this.comms = {};

    Rx.Observable.from(store)
      .pluck('app')
      .pluck('channels')
      .distinctUntilChanged()
      .switchMap(channels => {
        if (!(channels && channels.iopub)) {
          return Rx.Observable.empty();
        }
        console.log('filtering on ', channels.iopub);
        return channels.iopub
          .filter(msg =>
            msg && msg.msg_type &&
            msg.msg_type.slice(0, 5) === 'comm_'
          );
      })
      .subscribe(this.handleCommMsg.bind(this));
  }

  handleCommMsg(msg) {
    console.log('comm msg', msg);
  }
}
