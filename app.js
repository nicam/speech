"use strict";

var wolfram = require('wolfram').createClient("8U7YVL-3364E95GXU");
var giphy = require('giphy')('dc6zaTOxFJmzC');
var fs = require('fs');

var express = require('express');
var app = express();
var giphyResults = 20;
var protocol;

if (process.env.NODE_ENV === 'local') {
  var privateKey  = fs.readFileSync('nicam.key', 'utf8');
  var certificate = fs.readFileSync('nicam.cert', 'utf8');
  var credentials = {key: privateKey, cert: certificate};
  protocol = require('https').Server(credentials, app);
} else {
  protocol = require('http').Server(app);
}

var io = require('socket.io')(protocol);

app.set('port', (process.env.PORT || 5000));
app.use("/", express.static(__dirname + '/public/'));

protocol.listen(app.get('port'), function() {
  console.log('listening on *:'+ app.get('port'));
});

io.on('connection', function(socket) {
  socket.on('message', function(string) {
    var giphyCheck = /show me (a |an )?.*/i;
    var giphyRep = /show me (a |an )?/i;
    if (giphyCheck.test(string)) {
      giphy.search({q: string.replace(giphyRep.exec(string)[0], '').trim(),limit: giphyResults}, parseGiphy(socket));
    } else {
      wolfram.query(string, parseWolfram(socket));
    }
  });
});

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
