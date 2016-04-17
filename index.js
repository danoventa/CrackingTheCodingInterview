// Bootstrap main that lets us use ES6, JSX, TypeScript, etc. without
// a manual build step
// NOTE: This must remain ES5 code.
const path = require('path');

const appRoot = path.join(__dirname);

require('electron-compile').init(appRoot, './src/main');
