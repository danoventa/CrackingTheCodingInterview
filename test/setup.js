// From https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

// For some reason, this property does not get set above.
global.Image = global.window.Image;

global.navigator = {
  userAgent: 'node.js'
};

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return { right: 0 };
    },
    getClientRects: () => {
      return []
    }
  }
};

var mock = require('mock-require');
mock('electron-json-storage', {
  'get': function(key, callback){
    callback(null, { theme: 'light' });
  },
  'set': function(key, json, callback) {
    callback(null);
  },
})

mock('electron', {
  'shell': {
    'openExternal': function(url) { },
  },
})
