if (('webkitSpeechRecognition' in window)) {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  // recognition.interimResults = true;
  var running = false;
  recognition.lang = "en-US";

  var runner = false;
  var sentence = '';
  var isProcessing = false;
  var speeches = [];

  var socket = io();
  socket.on('response', function(text) {
    console.log('received response ' + text);
    isProcessing = false;
    sayAndShow(text);
  });

  socket.on('gif', function(id) {
    isProcessing = false;
    say('here you go');
    // show('<img src="'+url+'">');
    show('<video id="gif-mp4" poster="https://media.giphy.com/media/'+id+'/200_s.gif" style="margin:0;padding:0" width="380" height="213" autoplay="" loop=""><source src="http://media.giphy.com/media/'+id+'/giphy.mp4" type="video/mp4">Your browser does not support the mp4 video codec.</video>');
  });

  recognition.onstart = function (event) {
    running = true;
  };

  recognition.onspeechstart = function (event) {
    if (runner) {
      clearInterval(runner);
    }
    runner = setTimeout(reset, 2000);
  };

  function doneSpeaking() {
    console.log('end speaking');
    if (speeches.pop() && speeches.length === 0) {
      startRecognizing();
    }
    if (isProcessing) {
      processing();
    } else {
      waiting();
    }
  }

  function say(text) {
    stopRecognizing();
    speeches.push(1);
    speaking();
    var newUtt = new SpeechSynthesisUtterance(text);

    speechUtteranceChunker(newUtt, { chunkLength: 120
    }, doneSpeaking);

    newUtt.addEventListener('start', function () {
      console.log('start speaking');
       stopRecognizing();
    })
  }

  function show(string) {
    document.getElementById('response').innerHTML = string;
  }

  function sayAndShow(string) {
    say(string);
    show(string);
  }

  function startRecognizing() {
    if (!running) {
      running = true;
      try {
        recognition.start();
      } catch (e) {}
    }
  }

  function stopRecognizing() {
    if (running) {
      running = false;
      recognition.stop();
    }
  }

  function doSomething(text) {
    if (text.toLowerCase().indexOf("time") > -1) {
      var time = new Date();
      return sayAndShow("It is " + time.getHours() + ":" + time.getMinutes());
    }
    if (text.toLowerCase().indexOf("joke") > -1) {
      return sayAndShow("Did you hear about the giant with diarrhea? \n It's all over town.");
    }
    if (text.toLowerCase().indexOf("say") > -1) {
      return sayAndShow(text.replace('say','').trim());
    }
    if (text.length > 0) {
      // say('Let me think about that for a second');
      socket.emit('message', text);
      processing();
    }
    sentence = '';
    return text;
  }

  recognition.onend = function(event) {
    console.log('onend', event);
    doSomething(sentence);
    sentence = '';
    reset();
  };

  recognition.onresult = function(event) {
    // console.log(event.results[0][0].transcript, event.results[0][0].confidence);
    document.getElementById('output').innerHTML = event.results[0][0].transcript;
    sentence = event.results[0][0].transcript;
  };

  function reset () {
    if (running) {
      if (speeches.length === 0) {
        stopRecognizing();
        startRecognizing();
      }
    }
  }

  function processing() {
    isProcessing = true;
    document.getElementById('response').innerHTML = '';
    document.getElementById('loading').className = "loader";
  }

  function waiting() {
    document.getElementById('loading').className = "loader-wait";
  }

  function speaking() {
    document.getElementById('loading').className = "loader-speak";
  }

  document.addEventListener("DOMContentLoaded", function(event) { 
    startRecognizing();
  });

  recognition.onaudiostart = function (event) { console.log('onaudiostart', event)};
  recognition.onsoundstart = function (event) { console.log('onsoundstart', event)};
  recognition.onspeechend = function (event) { console.log('onspeechend', event)};
  recognition.onsoundend = function (event) { console.log('onsoundend', event)};
  recognition.onaudioend = function (event) { console.log('onaudioend', event)};
  recognition.onnomatch = function (event) { console.log('onnomatch', event)};
  // recognition.onend = function (event) { console.log('onend', event)};
  recognition.onerror = function(event) { console.log('error', event)};

}