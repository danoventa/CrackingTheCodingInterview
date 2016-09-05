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

import {
  executeCellEpic,
} from './execute';

import {
  getStoredThemeEpic,
} from './theming';

const epics = [
  getStoredThemeEpic,
  saveEpic,
  saveAsEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
];

export default epics;
