import {
  remote,
} from 'electron';

export function cwdKernelFallback(defaultPath) {
  if (process.cwd() === '/') {
    return remote.app.getPath('home');
  } else if (defaultPath) {
    return defaultPath;
  }
  return process.cwd();
}

// In Electron, we want an object we can merge into dialog opts, falling back
// to the defaults from the dialog by not defining defaultPath
export function defaultPathFallback(defaultPath) {
  const path = cwdKernelFallback(defaultPath);
  if (process.cwd() === path) {
    return {};
  }
  return { defaultPath: path };
}
