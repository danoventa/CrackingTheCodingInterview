import { dialog, app, shell, Menu, ipcMain as ipc,
         BrowserWindow } from 'electron';
import * as path from 'path';
import { launch, launchNewNotebook } from './launch';
import { installShellCommand } from './cli';

const kernelspecs = require('kernelspecs');

function getExampleNotebooksDir() {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(path.join(__dirname, '..', '..', 'example-notebooks'));
  }
  return path.join(process.resourcesPath, 'example-notebooks');
}

const exampleNotebooksDirectory = getExampleNotebooksDir();

function send(focusedWindow, eventName, obj) {
  if (!focusedWindow) {
    console.error('renderer window not in focus (are your devtools open?)');
    return;
  }
  focusedWindow.webContents.send(eventName, obj);
}

function createSender(eventName, obj) {
  return (item, focusedWindow) => {
    send(focusedWindow, eventName, obj);
  };
}

export function authAndPublish(item, focusedWindow) {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75 }
  });
  if (process.env.AUTHENTICATED) {
    send(focusedWindow, 'menu:github:auth');
    return;
  }
  win.webContents.on('dom-ready', () => {
    if (win.getURL().indexOf('callback?code=') !== -1) {
      win.webContents.executeJavaScript(`
        require('electron').ipcRenderer.send('auth', document.body.textContent);
        `);
      ipc.on('auth', (event, auth) => {
        send(focusedWindow, 'menu:github:auth', JSON.parse(auth).access_token);
        process.env.AUTHENTICATED = true;
        win.close();
      });
    } else {
      win.show();
    }
  });
  win.loadURL('https://oauth.nteract.io/github');
}

export const fileSubMenus = {
  new: {
    label: '&New',
    accelerator: 'CmdOrCtrl+N',
  },
  open: {
    label: '&Open',
    click: () => {
      const opts = {
        title: 'Open a notebook',
        filters: [
          { name: 'Notebooks', extensions: ['ipynb'] },
        ],
        properties: [
          'openFile',
        ],
      };
      if (process.cwd() === '/') {
        opts.defaultPath = app.getPath('home');
      }

      dialog.showOpenDialog(opts, (fname) => {
        if (fname) {
          launch(fname[0]);
        }
      });
    },
    accelerator: 'CmdOrCtrl+O',
  },
  openExampleNotebooks: {
    label: '&Open Example Notebooks',
    submenu: [
      {
        label: '&Intro',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'intro.ipynb'));
        },
      },
      {
        label: '&Plotly',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'plotly.ipynb'));
        },
      },
      {
        label: '&Plotlyr',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'plotlyr.ipynb'));
        },
      },
      {
        label: '&Altair',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'altair.ipynb'));
        },
      },
      {
        label: '&Geojson',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'geojson.ipynb'));
        },
      },
      {
        label: '&Pandas to GeoJSON',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'pandas-to-geojson.ipynb'));
        },
      },
      {
        label: '&Named display updates',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'display-updates.ipynb'));
        },
      },
      {
        label: '&Analyze nteract download metrics',
        click: () => {
          const opts = {
            title: 'Open a notebook',
            filters: [
              { name: 'Notebooks', extensions: ['ipynb'] },
            ],
            properties: [
              'openFile',
            ],
          };
          launch(path.join(exampleNotebooksDirectory, 'download-stats.ipynb'));
        },
      }
    ]
  },
  save: {
    label: '&Save',
    click: createSender('menu:save'),
    accelerator: 'CmdOrCtrl+S',
  },
  saveAs: {
    label: 'Save &As',
    click: (item, focusedWindow) => {
      const opts = {
        title: 'Save Notebook As',
        filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
      };

      if (process.cwd() === '/') {
        opts.defaultPath = app.getPath('home');
      }

      dialog.showSaveDialog(opts, (filename) => {
        if (!filename) {
          return;
        }

        const ext = path.extname(filename) === '' ? '.ipynb' : '';
        send(focusedWindow, 'menu:save-as', `${filename}${ext}`);
      });
    },
    accelerator: 'CmdOrCtrl+Shift+S',
  },
  publish: {
    label: '&Publish',
    submenu: [
      {
        label: '&User Gist',
        click: authAndPublish,
      },
      {
        label: '&Anonymous Gist',
        click: createSender('menu:publish:gist'),
      },
    ],
  },
};

export const file = {
  label: '&File',
  submenu: [
    fileSubMenus.new,
    fileSubMenus.open,
    fileSubMenus.openExampleNotebooks,
    fileSubMenus.save,
    fileSubMenus.saveAs,
    fileSubMenus.publish,
  ],
};

export const edit = {
  label: 'Edit',
  submenu: [
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
    {
      type: 'separator',
    },
    {
      label: 'New Code Cell',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: createSender('menu:new-code-cell'),
    },
    {
      label: 'New Text Cell',
      accelerator: 'CmdOrCtrl+Shift+M',
      click: createSender('menu:new-text-cell'),
    },
    {
      label: 'Copy Cell',
      accelerator: 'CmdOrCtrl+Shift+C',
      click: createSender('menu:copy-cell'),
    },
    {
      label: 'Cut Cell',
      accelerator: 'CmdOrCtrl+Shift+X',
      click: createSender('menu:cut-cell'),
    },
    {
      label: 'Paste Cell',
      accelerator: 'CmdOrCtrl+Shift+V',
      click: createSender('menu:paste-cell'),
    },
  ],
};

export const cell = {
  label: 'Cell',
  submenu: [
    {
      label: 'Run All',
      click: createSender('menu:run-all'),
    },
    {
      label: 'Run All Below',
      click: createSender('menu:run-all-below'),
    },
    {
      label: 'Clear All',
      click: createSender('menu:clear-all'),
    },
    {
      label: 'Unhide All',
      click: createSender('menu:unhide-all'),
    }
  ],
};
const theme_menu = [
  {
    label: 'Light',
    click: createSender('menu:theme', 'light'),
  },
  {
    label: 'Dark',
    click: createSender('menu:theme', 'dark'),
  },
  {
    label: 'Classic',
    click: createSender('menu:theme', 'classic'),
  },
  {
    label: 'nteract',
    click: createSender('menu:theme', 'nteract'),
  },
];
const blink_menu = [
  // TODO: replace the with one `type: 'checkbox'` item once we have state to
  // know which way it should be set initially.
  {
    label: 'Do Not Blink Editor Cursor',
    click: createSender('menu:set-blink-rate', 0),
  },
  {
    label: 'Blink Editor Cursor',
    click: createSender('menu:set-blink-rate', 530),
  },
];

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
if (month === 12) {
  theme_menu.push(
    {
      label: 'Hohoho',
      click: createSender('menu:theme', 'christmas'),
    });
} else if (month === 10) {
  theme_menu.push({
    label: 'Pumpkin Spice',
    click: createSender('menu:theme', 'halloween'),
  });
}


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
    {
      label: 'Actual Size',
      accelerator: 'CmdOrCtrl+0',
      click: createSender('menu:zoom-reset'),
    },
    {
      label: 'Zoom In',
      accelerator: 'CmdOrCtrl+=',
      click: createSender('menu:zoom-in'),
    },
    {
      label: 'Zoom Out',
      accelerator: 'CmdOrCtrl+-',
      click: createSender('menu:zoom-out'),
    },
    {
      label: 'Theme',
      submenu: theme_menu,
    },

    {
      label: 'Editor options',
      submenu: blink_menu,
    },
  ],
};


const windowDraft = {
  label: 'Window',
  role: 'window',
  submenu: [
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    },
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close',
    },
  ],
};

if (process.platform === 'darwin') {
  windowDraft.submenu.push(
    {
      type: 'separator',
    },
    {
      label: 'Bring All to Front',
      role: 'front',
    }
  );
}

export const window = windowDraft;

const shellCommands = {
  label: 'Install Shell Commands',
  click: () => installShellCommand(),
};

const helpDraft = {
  label: 'Help',
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click: () => { shell.openExternal('http://github.com/nteract/nteract'); }
    }
  ]
};

if (process.platform !== 'darwin') {
  helpDraft.submenu.unshift(shellCommands, { type: 'separator' });
}

export const help = helpDraft;

const name = 'nteract';
app.setName(name);

export const named = {
  label: name,
  submenu: [
    {
      label: `About ${name}`,
      role: 'about',
    },
    {
      type: 'separator',
    },
    shellCommands,
    {
      type: 'separator',
    },
    {
      label: 'Services',
      role: 'services',
      submenu: [],
    },
    {
      type: 'separator',
    },
    {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide',
    },
    {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers',
    },
    {
      label: 'Show All',
      role: 'unhide',
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => app.quit(),
    },
  ],
};

export function generateDefaultTemplate() {
  const template = [];

  if (process.platform === 'darwin') {
    template.push(named);
  }

  template.push(file);
  template.push(edit);
  template.push(view);
  template.push(window);
  template.push(help);

  return template;
}

export const defaultMenu = Menu.buildFromTemplate(generateDefaultTemplate());

export function loadFullMenu() {
  return kernelspecs.findAll().then((kernelSpecs) => {
    function generateSubMenu(kernelName) {
      return {
        label: kernelSpecs[kernelName].spec.display_name,
        click: createSender('menu:new-kernel', kernelName),
      };
    }

    const kernelMenuItems = Object.keys(kernelSpecs).map(generateSubMenu);

    const newNotebookItems = Object.keys(kernelSpecs)
      .map(kernelName => ({
        label: kernelSpecs[kernelName].spec.display_name,
        click: () => launchNewNotebook(kernelName),
      }));

    const languageMenu = {
      label: '&Language',
      submenu: [
        {
          label: '&Kill Running Kernel',
          click: createSender('menu:kill-kernel'),
        },
        {
          label: '&Interrupt Running Kernel',
          click: createSender('menu:interrupt-kernel'),
        },
        {
          label: 'Restart Running Kernel',
          click: createSender('menu:restart-kernel'),
        },
        {
          label: 'Restart and Clear All Cells',
          click: createSender('menu:restart-and-clear-all'),
        },
        {
          type: 'separator',
        },
        // All the available kernels
        ...kernelMenuItems,
      ],
    };

    const template = [];

    if (process.platform === 'darwin') {
      template.push(named);
    }

    const fileWithNew = {
      label: '&File',
      submenu: [
        {
          label: '&New',
          submenu: newNotebookItems,
        },
        fileSubMenus.open,
        fileSubMenus.openExampleNotebooks,
        fileSubMenus.save,
        fileSubMenus.saveAs,
        fileSubMenus.publish,
      ],
    };

    template.push(fileWithNew);
    template.push(edit);
    template.push(cell);
    template.push(view);

    // Application specific functionality should go before window and help
    template.push(languageMenu);
    template.push(window);
    template.push(help);

    const menu = Menu.buildFromTemplate(template);
    return menu;
  });
}
