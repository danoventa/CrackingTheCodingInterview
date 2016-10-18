# nteract

nteract is a literate coding environment that supports Python, R, JavaScript and other Jupyter kernels. It wraps up the best of the web based Jupyter notebook and embeds it as a desktop application that allows you to open notebooks natively on your system. Double click a .ipynb on the desktop, use Spotlight on the Mac. It Just Works™


## Installation
To get started, download the latest [release](https://github.com/nteract/nteract/releases) for your OS.

## Authoring Notebook Files (.ipynb)

### Create a New Notebook
A new notebook can be created by accessing the menu,

  File<br/>
        &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;New<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;\<Language Kernel\> (e.g. Python 3, R, Julia etc.)

### Opening a Notebook
There are several ways to open a notebook in nteract:

1. From the menu:

  File<br/>
        &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;Open<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;Open<br/>

2. Double-click a notebook file :tada::  

3. From the Command Line (assuming you have shell commands installed), run `nteract notebook.ipynb`:

*Keyboard shortcut ⌘O on macOS and Ctrl-O on Windows/Linux*

### Saving a Notebook

A notebook can be saved in the following ways:

File<br/>
      &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;Save

*Keyboard shortcut: ⌘S on macOS and Ctrl-S on Windows/Linux*

File<br/>
      &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;Save As

*Keyboard shortcut: ⇧⌘S on macOS and Shift-Ctrl-S on Windows/Linux*

## Notebook Cells

### Adding a Cell

#### Code Cells
A code cell can be created by accessing the menu,

Edit<br/>
      &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;New Code Cell

*Keyboard shortcut: Shift ⌘N on macOS or Shift Ctrl-N on Windows/Linux*

A code cell can also be created by clicking <> on the cell hover menu (what is the name of this?)

#### Text Cells
A text (or markdown) cell can be created by clicking **M** on the cell hover menu (what is the name of this?)

### Running a Cell
A cell can be run from the keyboard by pressing *Shift ⏎* or by selecting the ▶︎ button from the cell toolbar.

***N.B. To run all cells at once, access the menu:***

Cell<br/>
      &nbsp;&nbsp;&nbsp;⮑&nbsp;&nbsp;Run All


### Moving a Cell

A cell can be moved anywhere in the notebook by clicking and dragging to desired position.
