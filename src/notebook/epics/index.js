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
  setThemeEpic,
} from './theming';

import {
  initialGitHubAuthEpic,
  publishEpic,
} from './github-publish';

const epics = [
  initialGitHubAuthEpic,
  publishEpic,
  getStoredThemeEpic,
  setThemeEpic,
  saveEpic,
  saveAsEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
];

export default epics;
