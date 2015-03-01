var wolfram = require('wolfram').createClient("8U7YVL-3364E95GXU")
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res){
  // console.log(req);
  res.sendFile(__dirname + '/index.html');
});

app.use("/images", express.static(__dirname + '/images'));

http.listen(app.get('port'), function() {
  console.log('listening on *:'+app.get('port'));
});

app.get('/wolfram', function(req, res){
  // res.send('blub');
  askWolfram('titanic', function (err, result) {

    if (result.length > 0) {
      // Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
      //   if ()
      //   print(val + ' -> ' + obj[val]);
      // });
      result.forEach(function(value, key) {
        // console.log(value);
        if (value.title == 'Basic information') {
          console.log(value['subpods'].value);
          res.send(value['subpods'].value);
        }
      });
    }

    // console.log(result);
    // res.send(result);
  })
});

function askWolfram(query, callback) {
  wolfram.query(query, callback);
}

var unitReplacements = {
  "km": "(kilometers)",
  "CHF": "(Swiss francs)",
  "m^3": "(cubic meters)",
}

function responseText(text) {

  Object.getOwnPropertyNames(unitReplacements).forEach(function(val, idx, array) {
    if (text.indexOf(val) > -1 && text.indexOf(unitReplacements[val])) {
      text = text.replace(unitReplacements[val], '');
    }
  });
 
  return text;
}

io.on('connection', function(socket){
  // console.log('connection');
  socket.on('message', function(msg) {
    // console.log('received message ' + msg);
    if (msg) {
      askWolfram(msg, function(err, result) {
        // console.log(result);
        if (result.length === 0) {
          socket.emit('response', "I couldn't find an answer for that.");
        }
        // console.log(result[1]['subpods'][0].value)
        // if (result.length > 0 && result[0]) {
        //   result[0].forEach(function(value, key) {
        //     console.log(value);
        //     if (value.title == 'Wikipedia summary') {
        //       console.log(value['subpods']);
        //     }
        //   });
        // }
        if (result && result[1] && result[1]['subpods'] && result[1]['subpods'][0]) {
          
          if (result[1]['subpods'][0].value.trim().length === 0) {
            socket.emit('response', "I couldn't find an answer for that.");
          } else {
            socket.emit('response', responseText(result[1]['subpods'][0].value));
          }


        }
      });
    }
  });
});