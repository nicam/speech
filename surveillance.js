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
    headers: {
      'Authorization': config.cameraAuth
    },
    hostname: config.cameraIp,
    port: config.cameraPort,
    path: path,
    agent: false  // create a new agent just for this one request
  }, (res) => {
    socket.emit('response', responder.success());
  }, (err) => {
    socket.emit('response', "the communication with the surveillance module failed");
  });
}

function buildPath(intent) {
  var code, value;
  switch (intent.target) {
    case 'desk':
      code = 13;
      value = 3;
      break;
    case 'tv':
      code = 13;
      value = 1;
      break;
    case 'hallway':
      code = 13;
      value = 2;
      break;
    default:
    return false;
  }
  return `/media/?action=cmd&code=${code}&value=${value}`;
}

module.exports.executeAction = executeAction;