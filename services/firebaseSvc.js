"use strict";

var Firebase = require('firebase'),
  config = require('../config/config.js');

var conn = new Firebase(config.firebase.url);

function pushToFirebase(payload, callback){
  var roomRef = conn.child(payload.room).push().set({
    color:     payload.color,
    avatar:    payload.avatar,
    message:   payload.message,
    username:  payload.username,
    timestamp: payload.timestamp
  })

  callback(payload.room);
}

function resizeMessageLength(room){
  var ref = conn.child(room);
  ref.on('value', function(snapshot){
    console.log(snapshot.val());
    var length = Object.keys(snapshot.val()).length
    if (length > config.maxMessageLength){
      for (var first in snapshot.val()) break;
      ref.child(first).remove();
    }
  }, function(errorObject){
    console.log("The read failed: " + errorObject.code);
  });
}

function setMessageCounter(count){
  var ref = conn.child('message-counter');
  ref.set(count);
}

var firebaseSvc = {
  pushToFirebase: function(payload,callback){
    pushToFirebase(payload,callback);
  },
  resizeMessageLength: function(room){
    resizeMessageLength(room);
  },
  setMessageCounter: function(roomName,count){
    setMessageCounter(roomName,count);
  }
};

module.exports = firebaseSvc;
