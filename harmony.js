var harmony = require('harmonyhubjs-client');

function executeHarmonyAction(socket, intent) {
  harmony('192.168.10.102').then(function(harmonyClient) {
    if (intent.toggle === "off") {
      harmonyClient.turnOff()
      harmonyClient.end()
      socket.emit("response", "I turned it off");
    } else {
      harmonyClient.getActivities().then(function(activities) {
        console.log(activities.map(activity => activity.label));
        var mappedActivity = mapActivities(intent.target)
        if (!mappedActivity) {
          socket.emit("response", "I couldn't find an activity for that");
        } else {
          activities.some(activity => {
            console.log(activity.label, mappedActivity)
            if (activity.label === mappedActivity) {
              harmonyClient.startActivity(activity.id);
              socket.emit("response", "I started the " + mappedActivity);
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

module.exports.executeHarmonyAction = executeHarmonyAction;