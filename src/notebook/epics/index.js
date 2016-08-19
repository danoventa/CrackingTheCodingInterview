import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
} from './kernelLaunch';

const epics = [
  saveEpic,
  saveAsEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
];

export default epics;
