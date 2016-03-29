var wit = require('node-wit');
var http = require('http');
var harmonyCommand = require('./harmony-command');
var harmonyActivity = require('./harmony-activity');
var power = require('./power');
var surveillance = require('./surveillance');

const ACCESS_TOKEN = "GRALRNKXTETRK7UA2ZDCT4HWMBYTJSKL";

function analyzeWithWith(socket, string) {
  wit.captureTextIntent(ACCESS_TOKEN, string, (err, res) => {
    if (err) console.log("Error: ", err);
    switchIntentions(res, socket);
  });
};

function normalize(response) {
  var obj = {};
  if (response.outcomes.length > 0) {
    Object.keys(response.outcomes[0].entities).forEach((key) => {
      if (response.outcomes[0].entities[key] && response.outcomes[0].entities[key].length > 0) {
        obj[key] = response.outcomes[0].entities[key][0].value.toLowerCase();
      }
    })
    // for (var [key, value] of response.outcomes[0].entities) {
    //   if (value && value.length > 0) {
    //     obj[key] = value.value.toLowerCase();
    //   }
    // }
    obj.intent = response.outcomes[0].intent;
    return obj;
  } else {
    return false;
  }
}

function switchIntentions(response, socket) {
  var normalizedObj = normalize(response);
  if (normalizedObj) {
    switch (normalizedObj.intent) {
      case 'power':
        power.executeAction(socket, normalizedObj);
        break;
      case 'harmony':
        harmonyActivity.executeAction(socket, normalizedObj);
        break;
      case 'harmony_command':
      console.log('command acceessed');
        harmonyCommand.executeAction(socket, normalizedObj);
        break;
      case 'surveillance':
        surveillance.executeAction(socket, normalizedObj);
        break;
      default:
       socket.emit('response', "I couldn't figure out what to do");
      break;
    }
  }
}

module.exports.analyzeWithWith = analyzeWithWith;