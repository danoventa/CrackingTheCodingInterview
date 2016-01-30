# composition

[![Build Status](https://travis-ci.org/nteract/composition.svg)](https://travis-ci.org/nteract/composition) [![slack in](http://slack.nteract.in/badge.svg)](http://slack.nteract.in)

## Overview

:notebook: It's an Electron-based Notebook! :notebook:

Note: this isn't feature complete yet. There will be :bug:s and we're currently
lacking a lot of core features like saving, loading, and executing code.

### Scope and goals

* Notebook environment to explore and get things done
* Standalone cross-platform desktop application
* Easy install with pre-configured Python3 and JavaScript runtimes
* Grow an ecosystem of tooling to allow others to build their own platforms relying on the Jupyter specifications

### Contributing

The contributors are listed in [contributors](https://github.com/nteract/composition/graphs/contributors)

nteract uses the [C4.1 (Collective Code Construction Contract)](http://rfc.zeromq.org/spec:22) process for contributions.

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

### Design

* Full compliance with [Jupyter message spec v5](http://jupyter-client.readthedocs.org/en/latest/messaging.html)
* Full compliance with [Notebook format v4](http://nbformat.readthedocs.org/en/latest/format_description.html)
* Follow notebook model operations flow from [commutable](https://github.com/nteract/commutable)
* Rely on common interfaces for kernel communication via [enchannel's comm spec](https://github.com/nteract/enchannel) (Go read it!)
* Mocks for UI can be explored in issues, while design references go in [mocks](https://github.com/nteract/mocks)
* React for views (pushing notebook state down into the view)
* Full node, direct to zmq (no running a Python server underneath)

### Development

Requires node 5.x and npm 3. Join us in the future.

1. Fork this repo
2. Clone it `git clone https://github.com/nteract/composition`
3. `cd` to where you `clone`d it
4. `npm install`
5. `npm run start`

Assets are compiled via electron-compile directly, no build steps until we make a release. As you hack on components, you can reload directly or pop open the dev console and run `location.reload()`. No hot reloading at the moment.

#### Frontend background

As much as possible, we'd like to get people speaking a common language (which
may evolve over time!) for development of nteract components and packages.

Core tech behind the scenes:

* [Observables](http://cycle.js.org/observables.html) through [RxJS](https://github.com/ReactiveX/RxJS)
* [React](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/) (Note: architecture basis, common communication - we're not using Redux itself)
* [Jupyter Messaging](http://jupyter-client.readthedocs.org/en/latest/messaging.html)
* [ZeroMQ](http://zguide.zeromq.org/page:all)

These are our suggested tutorials and background to help you get up to speed:

* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [Full Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)

Depending on where you plug yourself in, you may find the introduction to Reactive
programming is the biggest help.

If you'd like to experiment with the core Jupyter messaging and Observables
without working with React, check out [ick](https://github.com/nteract/ick),
an interactive console.

Post in [Slack](http://slack.nteract.in/) if you need help with these or have questions. Several people
are working through tutorials right now and would love a study group! If you have trouble creating an account, either email rgbkrk@gmail.com or post an issue on GitHub.
