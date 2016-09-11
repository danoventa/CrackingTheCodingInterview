import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  loadEpic,
} from './loading';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
} from './kernel-launch';

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
  loadEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
];

export default epics;
