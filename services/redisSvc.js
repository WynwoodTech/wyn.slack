"use strict";

var config = require('../config/config.js'),
  firebaseSvc = require('./firebaseSvc'),
  redis = require('redis'),
  redisClient = redis.createClient(), multi;

function increaseMessageCounter(){
  redisClient.incr('wyn.tech/message-counter');
  updateMessageCounter();
}

function updateMessageCounter(){
  redisClient.get('wyn.tech/message-counter', function(err, reply){
    firebaseSvc.setMessageCounter(reply);
  });
}

var slackSvc = {
  increaseMessageCounter: function(){
    return increaseMessageCounter();
  }
};

module.exports = slackSvc;
