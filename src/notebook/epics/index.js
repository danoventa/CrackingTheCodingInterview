import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
} from './kernelLaunch';

const epics = [
  saveEpic,
  saveAsEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
];

export default epics;
