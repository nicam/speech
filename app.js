"use strict";
var config = require('./config/config');
var wolfram = require('wolfram').createClient(config.wolframKey);
var giphy = require('giphy')(config.giphyKey);
var fs = require('fs');
var http = require('http');
var wit = require('./wit');

var express = require('express');
var app = express();
var giphyResults = 20;
var protocol;

protocol = require('http').Server(app);

var io = require('socket.io')(protocol);

app.set('port', (process.env.PORT || 5000));
app.use("/", express.static(__dirname + '/public/'));

protocol.listen(app.get('port'), function() {
  console.log('listening on *:'+ app.get('port'));
});

io.on('connection', function(socket) {
  socket.on('message', handleIncomingRequest(socket));
});

function handleIncomingRequest (socket) {
  return (string) => {
    var giphyCheck = /show me (a |an ).*/i;
    var witCheck = /(show|tell|turn|isaac|isac|want|resume|stop|switch|mute|channel|volume|up|down)/i;
    var giphyRep = /show me (a |an )?/i;
    if (giphyCheck.test(string)) {
      giphy.search({q: string.replace(giphyRep.exec(string)[0], '').trim(),limit: giphyResults}, parseGiphy(socket));
    } else if (witCheck.test(string)) {
      wit.analyzeWithWith(socket, string);
    } else {
      wolfram.query(string, parseWolfram(socket));
    }
  }
}

function parseGiphy(socket) {
  return function (err, results) {
    var idx = Math.floor((Math.random() * results.data.length) + 1)-1;
    socket.emit('gif', results.data[idx].id);
  };
}

function parseWolfram(socket) {
  return function (err, result) {
    if (!result || result.length === 0) {
      socket.emit('response', "I couldn't find an answer for that.");
    }
    if (result && result[1] && result[1].subpods && result[1].subpods[0]) {
      if (result[1].subpods[0].value.trim().length === 0) {
        socket.emit('response', "I couldn't find an answer for that.");
      } else {
        socket.emit('response', responseText(result[1].subpods[0].value));
      }
    }
  };
}

function responseText(text) {
  Object.getOwnPropertyNames(unitReplacements).forEach(function(val) {
    if (text.indexOf(val) > -1 && text.indexOf(unitReplacements[val])) {
      text = text.replace(unitReplacements[val], '');
    }
  });
  return text;
}

var unitReplacements = {
  "km": "(kilometers)",
  "CHF": "(Swiss francs)",
  "m^3": "(cubic meters)",
};
