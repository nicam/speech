var wit = require('node-wit');
var http = require('http');
var harmony = require('./harmony');

const ACCESS_TOKEN = "GRALRNKXTETRK7UA2ZDCT4HWMBYTJSKL";

function analyzeWithWith(socket, string) {
  wit.captureTextIntent(ACCESS_TOKEN, string, askWit(socket));
};

function askWit(socket) {
  return function (err, res) {
    console.log("Response from Wit for text input: ");
    // socket.emit('response', "Asked wit successfully");
    if (err) console.log("Error: ", err);
    // console.log(JSON.stringify(res, null, " "));
    switchOnWitActions(res, socket);
  };
}

function normalizeWit(response) {
  var obj = {};
  if (response.outcomes.length > 0) {
    Object.keys(response.outcomes[0].entities).forEach((key) => {
      if (response.outcomes[0].entities[key] && response.outcomes[0].entities[key].length > 0) {
        obj[key] = response.outcomes[0].entities[key][0].value.toLowerCase();
      }
    })
    return obj;
  } else {
    return false;
  }
}

function switchOnWitActions(response, socket) {
  var normalizedObj = normalizeWit(response);
  if (normalizedObj) {
    switch (normalizedObj.target) {
      case 'lights':
      case 'light':
      case 'desk lights':
      case 'tv light':
      case 'tv lights':
      case 'screen':
      case 'screens':
      case 'printer':
      case 'media center':
        http.get({
          hostname: '192.168.10.15',
          port: 8000,
          path: buildPath(normalizedObj),
          agent: false  // create a new agent just for this one request
        }, (res) => {
          socket.emit('response', "As you wish");
          console.log(res);
        });
        break;
      case 'tv':
      case 'xbmc':
      case 'ps4':
      case 'movie':
        harmony.executeHarmonyAction(socket, normalizedObj);
        break;
      default:
       socket.emit('response', "I couldn't figure out what to do");
      break;
    }
  }
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
  if (toggle == "off") {
    return 0;
  }
  if (toggle == "on") {
    return 1;
  }
}

module.exports.analyzeWithWith = analyzeWithWith;