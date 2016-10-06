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
  publishEpic,
} from './github-publish';

import {
  commListenEpic,
} from './comm';

import {
  loadConfigEpic,
} from './config';

const epics = [
  commListenEpic,
  publishEpic,
  saveEpic,
  saveAsEpic,
  loadEpic,
  newNotebookEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  loadConfigEpic,
];

export default epics;
