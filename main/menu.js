export const file = {
  label: '&File',
  submenu: [
    {
      label: '&Open',
      click: () => { console.error('TODO: open a new BrowserWindow'); },
      accelerator: 'CmdOrCtrl+O',
    },
    {
      type: 'separator',
    },
    {
      label: '&Quit',
      action: ['killKernel', 'exit'],
      accelerator: 'CmdOrCtrl+Q',
    },
    {
      label: 'goop',
      click: (item, focusedWindow) => {
        console.log(item);
        if(focusedWindow) {
          console.log(focusedWindow);
          focusedWindow.webContents.send('ping', 'whooooh');
        } else {
          console.error('WATTTTTT', item, focusedWindow);
        }
      },
      metadata: 'wat',
      action: ['new cell'],
    },
  ],
};

export const edit = {
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo',
    },
    {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut',
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall',
    },
  ],
};

export const view = {
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.reload();
        }
      },
    },
    {
      label: 'Toggle Full Screen',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F';
        }
        return 'F11';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I';
        }
        return 'Ctrl+Shift+I';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
    },
  ],
};
