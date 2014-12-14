

var wolfram = require('wolfram').createClient("8U7YVL-3364E95GXU")
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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
        console.log(value);
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

io.on('connection', function(socket){
  console.log('connection');
  socket.on('message', function(msg) {
    console.log('received message ' + msg);
    if (msg) {
      askWolfram(msg, function(err, result) {
        console.log(result);
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
          console.log('responsed message', result[1]['subpods'][0].value);
          socket.emit('response', result[1]['subpods'][0].value);
        }
      });
    }
  });
});