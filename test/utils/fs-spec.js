import { expect } from 'chai';
import { unlinkObservable, createSymlinkObservable } from '../../src/utils/fs';

describe('unlinkObservable', () => {
  it('returns an observable', () => {
    expect(unlinkObservable('path').subscribe).to.not.be.null;
  });
})

describe('createSymlinkObservable', () => {
  it('returns an observable', () => {
    expect(createSymlinkObservable('target', 'path').subscribe).to.not.be.null;
  });
})
