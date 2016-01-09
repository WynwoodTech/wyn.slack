"use strict";

var config = require('../config/config.js'),
    request = require("request"),
    firebaseSvc = require('./firebase'),
    redis = require('redis'),
    redisClient = redis.createClient(), multi;

function getUserProfile(payload,cb){
  request('https://slack.com/api/users.info?token=' + config.slack.apiToken + '&user=' + payload.userId + '&pretty=1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var userInfo = JSON.parse(body).user;
      payload.color  = userInfo.color;
      payload.avatar = userInfo.profile.image_192;

      cb(payload,firebaseSvc.resizeMessageLength);
    }
  });
}

function checkToken(token){
  if (token == config.slack.webhookGeneralToken ||
      token == config.slack.webhookEngineeringToken ||
      token == config.slack.webhookRandomToken) {
    return true;
  } else {
    return false;
  }
}

function getChannelList(cb){
  request('https://slack.com/api/channels.list?token=' + config.slack.apiToken, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(body);
    }
  });
}

function getSlackMembers(cb){

  var redisGetAllMembers = function(callback){
    redisClient.smembers("wyn.tech/members",function(err, members) {
      redisGetMemberInfo(members,cb);
    });
  };

  var redisGetMemberInfo = function(members,callback) {
    multi = redisClient.multi();
    var allMembersMultiQueue = members.forEach(function(member,index,array){
      multi.get("wyn.tech/member/" + member);
    });

    multi.exec(function(error,replies){
      var memberInfo = replies.map(function(info){
        return JSON.parse(info);
      })
      callback(memberInfo);
    });
  };

  redisGetAllMembers(redisGetMemberInfo);
}

function setSlackMembers(channelId, cb){

  if (channelId == ''){
    channelId = 'C0E91L3LN';
  }

  request('https://slack.com/api/channels.info?token=' + config.slack.apiToken + '&channel=' + channelId, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var members = JSON.parse(body).channel.members.map(function(userId){
        var userInfo = saveSingleMember(userId);
        return userInfo;
      });
      cb();
    }
  });
}

function saveSingleMember(userId){
  request('https://slack.com/api/users.info?token=' + config.slack.apiToken + '&user=' + userId + '&pretty=1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var user = JSON.parse(body).user;

      var userInfo = {};
      userInfo.color  = user.color;
      userInfo.avatar = user.profile.image_192;
      userInfo.username = user.name;

      redisClient.sadd('wyn.tech/members', userId);
      redisClient.set('wyn.tech/member/' + userId, JSON.stringify(userInfo));
    }
  });
};

var getSingleUserInfo = function(userId, cb){
}

var slackSvc = {
  checkToken: function(token){
    return checkToken(token);
  },
  getUserProfile: function(payload,cb){
    return getUserProfile(payload,cb);
  },
  getChannelList: function(cb){
    return getChannelList(cb);
  },
  getSlackMembers: function(channelId,cb){
    return getSlackMembers(channelId,cb);
  },
  setSlackMembers: function(channelId,cb){
    return setSlackMembers(channelId, cb);
  },
};

module.exports = slackSvc;
