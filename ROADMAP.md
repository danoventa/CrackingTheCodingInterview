# Roadmap of the nteract Desktop App

This document is a roadmap of future releases of the nteract desktop application.
We focus on small, lean, and iterative releases. This document will give you
the sense of our overall vision and future work on the project.

## Pre-alpha
We want to start making packaged releases so that we can begin evaluating the 
desktop experience more fully. In other words, to be able to start testing the
usability of our notebook. It is expected that we'll make lots of pre-alpha 
"releases" to get the shipping flow down.

* Packaging and Installation
    * Ability to open and run a notebook from the desktop
    * Packaged release of "nteract-lite" (no bundled kernel) for OS X and Linux
* Specification Compliance
    * Full compliance with Notebook format v4
    * Full compliance with message spec v5

## Alpha

* Packaging and Installation
    * OS X and Linux packaged release
* Specification Compliance
    * Read compliance with Notebook format v3 (v4 is already supported)
* Editor Functionality
    * LaTeX (https://github.com/nteract/mathjax-electron)
    * Code completion and introspection
    * Clipboard
    * Undo/redo stack
* Communication
    * Comm message handling (preliminary/provisional API)
* Extra Goodies
    * Metrics/instrumentation around usage of the notebook

A big part of the notebook is the ecosystem of libraries that rely on it. We need
to make sure that we support many of the common libraries in use across Python, 
Julia, R, and JavaScript. We need to insure that we are supporting the following
libraries.

* Plotly
* Bokeh
* ipywidgets
* Matplotlib (`%matplotlib notebook`)
* Julia's Gadfly

## Beta
Beta should be feature-complete (relative to the Jupyter Notebook) and stable 
enough for a wide class of users to trust with running their notebooks in.

## Release Candidate

* Packaging and Installation
    * Bundled Python kernel
    * Installers for all platforms
* Notebook Publishing
  * gists
  * Plotly
  * Domino
* Kernels
    * Remote kernels to Docker endpoints

## Parking Lot

The parking lot contains features we've talked about, discussed, and even put 
time towards designing. The priority can shift of course, these are included 
in order for us to be explicit about goals.

* Real time collaboration
* Remote kernels (binder, JupyterHub remote, or raw Docker launches)
