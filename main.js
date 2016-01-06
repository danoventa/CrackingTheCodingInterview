// Bootstrap main that lets us use ES6, JSX, etc.
// Through the rest of our app code.
// NOTE: This must remain ES5 code.
var path = require('path');

var appRoot = path.join(__dirname);
require('electron-compile').init(appRoot, './app');
