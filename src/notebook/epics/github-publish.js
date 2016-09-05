import {
  SET_GITHUB,
} from '../constants';

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

const Github = require('github');

export const githubAuthObservable = (authOptions) =>
  Observable.create(observer => {
    const github = new Github();
    github.authenticate(authOptions, (err) => {
      if (err) {
        observer.error(err);
      } else {
        observer.next(github);
      }
    });
  });

export const setGithub = (github) => ({
  type: SET_GITHUB,
  github,
});

export const initialGitHubAuthEpic = () => {
  const auth = {};
  if (process.env.GITHUB_TOKEN) {
    auth.type = 'oauth';
    auth.token = process.env.GITHUB_TOKEN;
  }
  return githubAuthObservable(auth)
    .catch(err => {
      // TODO: Prompt?
      console.error(err);
      return new Github(); // Fall back to no auth
    })
    .map(setGithub);
};
