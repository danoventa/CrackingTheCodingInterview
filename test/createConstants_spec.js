import { expect } from 'chai';

import createConstants from '../src/actions/createConstants';

describe('createConstants', () => {
  it('creates an object', () => {
    const subject = createConstants('ONE', 'TWO');

    expect(subject).to.be.a('object');
  });

  it('has the arguments that were passed in as keys', () => {
    const subject = createConstants('ONE', 'TWO');

    expect(subject).to.have.all.keys('ONE', 'TWO');
  });

  it('creates symbols for each key', () => {
    const subject = createConstants('ONE', 'TWO');

    Object.keys(subject).forEach(key => {
      expect(subject[key]).to.be.a('symbol');
    });
  });
});
