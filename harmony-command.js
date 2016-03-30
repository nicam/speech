var harmony = require('harmonyhubjs-client');
var responder = require('./responder');
var config = require('./config/config');

function executeAction(socket, intent) {
  harmony(config.harmonyIp).then(function(harmonyClient) {
    console.log('wat');
    harmonyClient.getAvailableCommands()
      .then(function (commands) {
        // Look for the first device and pick its "power" control group, pick
        // there the "poweron" function and trigger it:
        // console.log(commands);
        console.log('foo');
        var actions = buildCommandObject(commands);
        var action = intent.action.toLowerCase().replace(' ', '');
        console.log(action);
        if (actions[action]) {
          executeCommand(harmonyClient, actions[action]);
          socket.emit('response', responder.success());
        } else {
          socket.emit('response', responder.error());
        }
      })
      .finally(function () {
        harmonyClient.end()
      })
  });
}

function buildCommandObject(commands) {
  var device = commands.device[0]
  var receiver = commands.device[4]
  actions = {};
  var powerControls = device.controlGroup
                            .filter(function (group) { return group.name.toLowerCase() === 'power' })
                            .pop()
  var volumeControls = receiver.controlGroup
                            .filter(function (group) { return group.name.toLowerCase() === 'volume' })
                            .pop()
  var channelControls = device.controlGroup
                            .filter(function (group) { return group.name.toLowerCase() === 'channel' })
                            .pop()

  actions['poweron'] = powerControls['function']
                            .filter(function (action) { return action.name.toLowerCase() === 'poweron' })
                            .pop()
  actions['poweroff'] = powerControls['function']
                            .filter(function (action) { return action.name.toLowerCase() === 'poweroff' })
                            .pop()
  actions['volumedown'] = volumeControls['function']
                            .filter(function (action) { return action.name.toLowerCase() === 'volumedown' })
                            .pop()
  actions['volumeup'] = volumeControls['function']
                            .filter(function (action) { return action.name.toLowerCase() === 'volumeup' })
                            .pop()
  actions['mute'] = volumeControls['function']
                            .filter(function (action) { return action.name.toLowerCase() === 'mute' })
                            .pop()
  actions['channeldown'] = channelControls['function']
                          .filter(function (action) { return action.name.toLowerCase() === 'channeldown' })
                          .pop()
  actions['channelup'] = channelControls['function']
                        .filter(function (action) { return action.name.toLowerCase() === 'channelup' })
                        .pop()
  actions['up'] = actions['channelup'];
  actions['down'] = actions['channeldown'];
  return actions;
}

function executeCommand(client, func) {
    if (func) {
      var encodedAction = func.action.replace(/\:/g, '::')
      return client.send('holdAction', 'action=' + encodedAction + ':status=press')
    } else {
      throw new Error('could not find poweron function of first device :(')
    }
}

module.exports.executeAction = executeAction;