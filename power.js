var http = require('http');
var responder = require('./responder');
var config = require('./config/config');

function executeAction(socket, intent) {
  var path = buildPath(intent);
  if (!path) {
    socket.emit('response', responder.error());
    return;
  }
  http.get({
    hostname: config.powerIp,
    port: config.powerPort,
    path: path,
    agent: false  // create a new agent just for this one request
  }, (res) => {
    socket.emit('response', responder.success());
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
      return false;
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