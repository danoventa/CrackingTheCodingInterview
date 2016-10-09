# nteract <img src="https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif" alt="nteract animated logo" height="80px" align="right" />

[![](https://img.shields.io/badge/version-latest-blue.svg)](https://github.com/nteract/nteract)
[![Build Status](https://travis-ci.org/nteract/nteract.svg?branch=master)](https://travis-ci.org/nteract/nteract) [![Build status](https://ci.appveyor.com/api/projects/status/odxx4hrkcxh1oilx/branch/master?svg=true)](https://ci.appveyor.com/project/nteract/nteract/branch/master)
[![](https://img.shields.io/badge/version-stable-blue.svg)](https://github.com/nteract/nteract/releases)
[![codecov.io](https://codecov.io/github/nteract/nteract/coverage.svg?branch=master)](https://codecov.io/github/nteract/nteract?branch=master)
![Documentation Coverage](https://doc.esdoc.org/github.com/nteract/nteract/badge.svg)
[![slack in](http://slack.nteract.in/badge.svg)](http://slack.nteract.in)

[**Users**](#installation--users) | [**Contributors and Development**](#installation---contributors-and-development) | [**Maintainers**](#for-maintainers-creating-a-release)


## Overview

Edit code cells, write markdown, visualize!

![nteract geojson](https://cloud.githubusercontent.com/assets/836375/18421299/d95ad398-783b-11e6-8b23-d54cf7caad1e.png)

Note: There will be :bug:s and quirks. Please come tell us about them!

nteract is a literate coding environment that supports Python, R, JavaScript and [other Jupyter kernels](https://github.com/ipython/ipython/wiki/IPython-kernels-for-other-languages). It wraps up the best of the web based Jupyter notebook and embeds it as a desktop application that allows you to open notebooks natively on your system. Double click a `.ipynb` on the desktop, use Spotlight on the Mac. It Just Works™

### Scope and goals

* Notebook environment to explore and get things done ✅
* Standalone cross-platform desktop application ✅
* One notebook document/narrative per window ✅
* Work with any Jupyter kernel using message spec v5 ✅
* Easy install with pre-configured Python3 and JavaScript runtimes ❌
* Grow an ecosystem of tooling to allow others to build their own platforms relying on the Jupyter specifications 🔜

## Installation - Users

Head to the [Releases](https://github.com/nteract/nteract/releases) page and download the version for your OS.

<!-- TODO: Explain how to install per each platform, likely with screenshots -->

## Installation - Contributors and Development

The contributors are listed in [contributors](https://github.com/nteract/nteract/graphs/contributors)

To learn how to contribute, head to our [contributing guide](CONTRIBUTING.md).

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

Feel free to post issues or chat in [Slack](http://slack.nteract.in/) if you need help or have questions. If you have trouble creating an account on slack, either email rgbkrk@gmail.com or post an issue on GitHub.

### Development

To get started developing install a [python runtime](#python-runtime) then install [`nteract` in dev mode](#install-nteract-in-dev-mode).

#### Python runtime

At least for now, we need the python 3 kernel installed when hacking on nteract:

```
python3 -m pip install ipykernel
python3 -m ipykernel install --user
```

#### Install `nteract` in dev mode

Requires [node 6.x and npm 3](https://docs.npmjs.com/getting-started/installing-node).

**Prerequisites for Linux and OS X**

If you are running on Linux or OS X, you will need to have `automake`,
`autoconf`, `pkg-config`, `wget`, `libtool` and Python 2.7 (`v3.x.x` is not supported) installed. For Linux, use your distribution's
package manager to install. On OS X, these can be installed using
[Homebrew](http://brew.sh) and using the Homebrew command `brew install`
command. For example, install `wget` with `brew install wget`.

**Prerequisites for Windows**

- **Option 1:** Install all the required tools and configurations using Microsoft's [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) by running `npm install -g windows-build-tools` from an elevated PowerShell (run as Administrator).
- **Option 2:** Install dependencies and configuration manually
   1. Visual C++ Build Environment:
     * **Option 1:** Install [Visual C++ Build Tools](http://go.microsoft.com/fwlink/?LinkId=691126) using the *Default Install* option.
     * **Option 2:** Install [Visual Studio 2015](https://www.visualstudio.com/products/visual-studio-community-vs) (or modify an existing installation) and select *Common Tools for Visual C++* during setup.  

  > :bulb: [Windows Vista / 7 only] requires [.NET Framework 4.5.1](http://www.microsoft.com/en-us/download/details.aspx?id=40773)

  2. Install [Python 2.7](https://www.python.org/downloads/) or [Miniconda 2.7](http://conda.pydata.org/miniconda.html) (`v3.x.x` is not supported), and run `npm config set python python2.7`
  3. Launch cmd, `npm config set msvs_version 2015`

##### Now you're ready to build!

1. Fork this repo
2. Clone it `git clone https://github.com/nteract/nteract`
3. `cd` to where you `clone`d it
4. `npm install`
5. `npm run start`

As you make changes, close the entire app (cmd-q on OS X, or ctrl-c at the terminal) then run `npm run start` again.

#### Build Documentation
You can run nteract's documentation generator by running

```
npm run build:docs
```

And then opening `docs/index.html` in your favorite browser.

#### Troubleshooting

> I upgraded my developer installation and things are broken!

- Try `$ rm -rf node_modules` then `$ npm install`

## For maintainers: Creating a release

### Bump the version

```
npm version {major|minor|patch}
git push
git push --tags
npm publish
```

### OS X release

The OS X release has to be signed with an Apple developer key. Currently only
Kyle (@rgbkrk) has this set up. The process he runs through is as follows:

```
npm run dist:osx:signed
```

Then verify that the copy of nteract in `dist/nteract-darwin-x64/` works
properly (mostly ad-hoc basic notebook loading and execution).

## Sponsors

Work on the nteract notebook is currently sponsored by

[![Plotly](https://cloud.githubusercontent.com/assets/836375/13661288/0f1d6d8c-e657-11e5-897b-9d047cb30ef4.png)](https://plot.ly/)

[![Domino Data Lab](https://cloud.githubusercontent.com/assets/836375/13661281/052c8506-e657-11e5-8e93-1497c6097519.png)](https://www.dominodatalab.com/)

We're on a common mission to build a great notebook experience. Feel free to
[get in touch](mailto:rgbkrk@gmail.com) if you'd like to help. Resources go towards
paying for additional work by seasoned designers and engineers.

#### Made possible by

The nteract project was made possible with the support of

[![Carina by Rackspace](https://657cea1304d5d92ee105-33ee89321dddef28209b83f19f06774f.ssl.cf1.rackcdn.com/carina-logo-69ecb9689d028f8d8f0db1caad4b95472040cb3af32104bbc98716fe2088dca4.svg)](https://getcarina.com).

If your employer allows you to work on nteract during the day and would like
recognition, feel free to add them to the "Made possible by" list.
