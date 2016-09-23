import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  loadEpic,
  newNotebookEpic,
} from './loading';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
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

import {
  commListenEpic,
} from './comm';

const epics = [
  commListenEpic,
  initialGitHubAuthEpic,
  publishEpic,
  getStoredThemeEpic,
  setThemeEpic,
  saveEpic,
  saveAsEpic,
  loadEpic,
  newNotebookEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
];

export default epics;
