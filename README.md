# composition

[![Build Status](https://travis-ci.org/nteract/composition.svg)](https://travis-ci.org/nteract/composition) [![slack in](https://slack.nteract.in/badge.svg)](http://slack.nteract.in)

:notebook: Electron app of the Jupyter Notebook

This is a work in progress. Check out the issues for more detail.

### Development

Requires node 5.x and npm 3.

1. Fork this repo
2. Clone it `git clone https://github.com/nteract/composition`
3. `cd` to where you `clone`d it
4. `npm install`
5. `npm run start`

Assets are compiled via electron-compile directly, no worry about build steps until we make a release. As you hack on components, you can reload directly or pop open the dev console and run `location.reload()`. No hot reloading at the moment.


### ROADMAP

The primary goal of composition is to create a fully standalone desktop application, written with Electron that has a one-click installer for
OS X and Windows.

* [ ] Bundled kernel with scientific Python packages (Anaconda FTW!)
* [ ] Observes kernelspecs available
* [ ] One click installer

#### Sub-pieces

There are going to be node packages that should get maintained and worked on independent of composition itself.

* [ ] Prebuilt versions of `zmq` for use in node/Electron/Atom (for everyone :tada:!)
* [X] Port Transformime (Jupyter Mimetype bundles -> HTML Elements) over to pure react elements
