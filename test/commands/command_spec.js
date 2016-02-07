import { expect } from 'chai';
import {spy} from 'sinon';

import {registerCommand, unregisterCommand, get, invoke} from '../../src/commands/index';

beforeEach(function() {
  unregisterCommand('test');
});

describe('commands', () => {
  describe('registerCommand', () => {
    it('registers a command', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);

      expect(get('test')).to.equal(command);
    });
    it('does not allow overwrite', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);

      expect(() => registerCommand(command)).to.throw(Error);
      expect(() => registerCommand({name: 'test', callback: ()=>{}})).to.throw(Error);
    });
    it('accepts metadata', () => {
      const command = {name: 'test', callback: ()=>{}, metadata: 'blorg'};
      registerCommand(command);

      expect(get('test')).to.equal(command);
    });
    it('checks validity of the command', () => {
      expect(() => registerCommand('not a command')).to.throw(Error);
      expect(() => registerCommand({})).to.throw(Error);
      expect(() => registerCommand({name: 'test'})).to.throw(Error);
      expect(() => registerCommand({callback: ()=>{}})).to.throw(Error);
      expect(() => registerCommand({name: 'test', callback: ()=>{}})).to.not.throw(Error);
    });
  });
  describe('unregisterCommand', () => {
    it('removes a command', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);
      unregisterCommand('test');
      expect(get('test')).to.be.undefined;
    });
    it('is case sensitive', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);
      unregisterCommand('Test');
      expect(get('test')).to.equal(command);
    });
    it('does not error if a command does not exist', () => {
      expect(() => unregisterCommand('i do not exist')).to.not.throw(Error);
    });
  });
  describe('get', () => {
    it('gets a command', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);
      expect(get('test')).to.equal(command);
    });
    it('is case sensitive', () => {
      const command = {name: 'test', callback: ()=>{}};
      registerCommand(command);
      expect(get('Test')).to.be.undefined;
    });
    it('returns undefined for commands that do not exist', () => {
      expect(get('asdf')).to.be.undefined;
    });
  });
  describe('invoke', () => {
    it('invokes a command', () => {
      const cb = spy();
      const command = {name: 'test', callback: cb};
      registerCommand(command);
      invoke('test');
      expect(cb.calledOnce).to.be.ok;
    });
    it('is case sensitive', () => {
      const cb = spy();
      const command = {name: 'test', callback: cb};
      registerCommand(command);
      invoke('Test');
      expect(cb.calledOnce).to.not.be.ok;
    });
    it('does not fail if a command does not exist', () => {
      expect(() => invoke('xcvb')).to.not.throw(Error);
    });
  });
});
