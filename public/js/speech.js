"use strict";
(function () {
  var recognition, socket;
  var running = false;
  var runner = false;
  var sentence = '';
  var isProcessing = false;
  var speeches = [];
  var voiceSelect = document.getElementById('voice');

  var init = function () {
    socket = io();
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    bind();
    startRecognizing();
    loadVoices();
  };

  var bind = function () {
    socket.on('response', wolframResponse);
    socket.on('gif', giphyResponse);
    document.getElementById('loading').addEventListener('click', toggleDebug);

    recognition.addEventListener('start', function () {
      running = true;
    });

    recognition.addEventListener('speechstart', function () {
      if (runner) {
        clearInterval(runner);
      }
      runner = setTimeout(reset, 2000);
    });

    recognition.addEventListener('end', function() {
      doSomething(sentence);
      sentence = '';
      reset();
    });

    recognition.addEventListener('result', function(event) {
      document.getElementById('output').innerHTML = event.results[0][0].transcript;
      sentence = event.results[0][0].transcript;
    });

  };

  var wolframResponse = function (text) {
    isProcessing = false;
    sayAndShow(text);
  };

  var giphyResponse = function (id) {
    isProcessing = false;
    say('here you go');
    show('<video id="gif-mp4" poster="https://media.giphy.com/media/'+id+'/200_s.gif" style="margin:0;padding:0" width="380" height="213" autoplay="" loop=""><source src="http://media.giphy.com/media/'+id+'/giphy.mp4" type="video/mp4">Your browser does not support the mp4 video codec.</video>');
  };

  var doneSpeaking = function () {
    if (speeches.pop() && speeches.length === 0) {
      startRecognizing();
    }
    if (isProcessing) {
      processing();
    } else {
      waiting();
    }
  };

  var say = function(text) {
    stopRecognizing();
    speeches.push(1);
    speaking();
    var newUtt = new SpeechSynthesisUtterance(text);

    if (voiceSelect.value) {
      newUtt.voice = speechSynthesis.getVoices().filter(function(voice) {
        return voice.name === voiceSelect.value; })[0];
    }

    newUtt.volume = parseFloat(document.getElementById('volume').value);
    newUtt.rate = parseFloat(document.getElementById('rate').value);
    newUtt.pitch = parseFloat(document.getElementById('pitch').value);

    if (text.length < 120) {
      newUtt.addEventListener('end', doneSpeaking);
      speechSynthesis.speak(newUtt);
    } else {
      //https://gist.github.com/woollsta/2d146f13878a301b36d7
      speechUtteranceChunker(newUtt, { chunkLength: 120 }, doneSpeaking);
    }
    newUtt.addEventListener('start', function () {
       stopRecognizing();
    });
  };

  var show = function(string) {
    document.getElementById('response').innerHTML = string;
  };

  var sayAndShow = function(string) {
    say(string);
    show(string);
  };

  var startRecognizing = function() {
    if (!running) {
      running = true;
      try {
        recognition.start();
      } catch (e) {}
    }
  };

  var stopRecognizing = function() {
    if (running) {
      running = false;
      recognition.stop();
    }
  };

  var toggleSurveillance = function () {
    var container = document.getElementById("surveillance");
    if (container.classList.contains('hidden')) {
      document.getElementById('surveilance-iframe').src = 'http://192.168.10.4:8084/video/livesp.asp';
      document.getElementById("surveillance").classList.remove('hidden');
      return sayAndShow("surveillance activated");
    } else {
      document.getElementById("surveillance").classList.add('hidden');
      document.getElementById('surveilance-iframe').src = '';
      return sayAndShow("surveillance deactivated");
    }
  }

  var doSomething = function(text) {
    if (text.toLowerCase().indexOf("time") > -1) {
      var time = new Date();
      return sayAndShow("It is " + time.getHours() + ":" + time.getMinutes());
    }
    if (text.toLowerCase().indexOf("surveillance") > -1) {
      return toggleSurveillance();
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
  };

  var reset = function() {
    if (running) {
      if (speeches.length === 0) {
        stopRecognizing();
        startRecognizing();
      }
    }
  };

  var toggleDebug = function () {
    var debug = document.getElementById('debug');
    if (debug.classList.contains('hidden')) {
      debug.classList.remove('hidden');
    } else {
      debug.classList.add('hidden');
    }
  };

  var loadVoices = function() {
    // Fetch the available voices.
    var voices = speechSynthesis.getVoices();
    voiceSelect = document.getElementById('voice');
    // Loop through each of the voices.
    voices.forEach(function(voice) {
      // Create a new option element.
      var option = document.createElement('option');

      // Set the options value and text.
      option.value = voice.name;
      option.innerHTML = voice.name;

      // Add the option to the voice selector.
      voiceSelect.appendChild(option);
    });
  };

  var processing = function() {
    isProcessing = true;
    document.getElementById('response').innerHTML = '';
    document.getElementById('loading').className = "loader";
  };

  var waiting = function() {
    document.getElementById('loading').className = "loader-wait";
  };

  var speaking = function() {
    document.getElementById('loading').className = "loader-speak";
  };

  document.addEventListener("DOMContentLoaded", function() {
    if (('webkitSpeechRecognition' in window && 'speechSynthesis' in window)) {
      init();
    } else {
      document.getElementById('output').innerHTML = 'Sorry your browser is missing the Speech APIs. Try Chrome.';
    }
  });

  window.speechSynthesis.onvoiceschanged = function() {
    loadVoices();
  };

  // recognition.onaudiostart = function (event) { console.log('onaudiostart', event)};
  // recognition.onsoundstart = function (event) { console.log('onsoundstart', event)};
  // recognition.onspeechend = function (event) { console.log('onspeechend', event)};
  // recognition.onsoundend = function (event) { console.log('onsoundend', event)};
  // recognition.onaudioend = function (event) { console.log('onaudioend', event)};
  // recognition.onnomatch = function (event) { console.log('onnomatch', event)};
  // // recognition.onend = function (event) { console.log('onend', event)};
  // recognition.onerror = function(event) { console.log('error', event)};

})();