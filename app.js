module.exports = window.App = App

var ipc = require('ipc')

function App (el) {
  el.innerHTML = 'hello'
}