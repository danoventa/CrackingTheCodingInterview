import { fromJS } from 'immutable';
import { listKernelSpecs } from '../api/kernel';

export default listKernelSpecs().then(kernelSpecs => {
  return fromJS(Object.keys(kernelSpecs).map(name => {
    return {
      label: kernelSpecs[name].spec.display_name,
      action: ['killKernel', { name: 'newKernel', args: [name] }],
    };
  }));
})
.catch(err => console.error('Could not enumerate kernels', err))
.then(kernelMenuItems => {
  return fromJS([
    {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          action: 'readJSON',
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
      ],
    },
    {
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
    },
    {
      label: '&Language',
      submenu: [
        {
          label: '&Kill Running Kernel',
          action: 'killKernel',
        },
        {
          type: 'separator',
        },
      ],
    },
  ]).updateIn([2, 'submenu'], menuItems => {
    if (kernelMenuItems) {
      return menuItems.concat(kernelMenuItems);
    }
    return menuItems;
  });
})
.catch(err => {
  console.error('Could not generate the default menu', err);
});
