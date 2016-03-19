var http = require('http');

const powerhost = '192.168.10.15';

function executeAction(socket, intent) {
  http.get({
    hostname: powerhost,
    port: 8000,
    path: buildPath(intent),
    agent: false  // create a new agent just for this one request
  }, (res) => {
    socket.emit('response', "As you wish");
  }, (err) => {
    socket.emit('response', "the communication with the power module failed");
  });
}

function buildPath(intent) {
  var slot, action, group = '10101';
  action = getToggle(intent.toggle);
  switch (intent.target) {
    case 'lights':
    case 'light':
    case 'tv light':
    case 'tv lights':
      slot = '02';
      break;
    case 'media center':
      slot = '01';
      break;
    case 'desk lights':
      slot = '04';
      break;
    case 'screen':
    case 'screens':
      slot = '03';
      break;
    case 'printer':
      slot = '04';
      group = '11111';
      break;
    default:
  }
  return `/?group=${group}&switch=${slot}&action=${action}`;
}

function getToggle(toggle) {
  switch (toggle) {
    case 'off':
      return 0;
    case 'on':
      return 1;
  }
}
module.exports.executeAction = executeAction;