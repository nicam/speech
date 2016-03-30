var harmony = require('harmonyhubjs-client');
var responder = require('./responder');
var config = require('./config/config');

function executeAction(socket, intent) {
  harmony(config.harmonyIp).then(function(harmonyClient) {
    if (intent.toggle === "off") {
      harmonyClient.turnOff()
      harmonyClient.end()
      socket.emit("response", "I turned it off");
    } else {
      harmonyClient.getActivities().then(function(activities) {
        var mappedActivity = mapActivities(intent.target)
        if (!mappedActivity) {
          socket.emit("response", "Sorry, I couldn't find an activity for that");
        } else {
          activities.some(activity => {
            if (activity.label === mappedActivity) {
              harmonyClient.startActivity(activity.id);
              // socket.emit("response", "I started the " + mappedActivity);
              socket.emit("response", responder.success());
              harmonyClient.end();
              return true
            }
            return false
          })
        }
      });
    }
  });
}

// [ 'XBMC', 'PS4', 'PowerOff', 'Play PS4', 'Watch TV' ]
function mapActivities(target) {
  switch (target.toLowerCase()) {
    case 'tv':
    return 'Watch TV';
    case 'xbmc':
    case 'movie':
    return 'XBMC';
    case 'game':
    case 'ps4':
    return 'Play PS4';
    default:
    return false;
  }
}

module.exports.executeAction = executeAction;