import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import {
  setLanguageInfo,
} from '../../../src/notebook/epics/kernelLaunch';

describe('setLanguageInfo', () => {
  it('creates a SET_LANGUAGE_INFO action', () => {
    const langInfo = {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name":"python",
      "nbconvert_exporter":"python",
      "pygments_lexer":"ipython3",
      "version":"3.5.1",
    };

    expect(setLanguageInfo(langInfo)).to.deep.equal({
      type: constants.SET_LANGUAGE_INFO,
      langInfo: langInfo,
    });
  })
});
