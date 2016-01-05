"use strict";

var config = require('../config/config.js'),
    request = require("request"),
    firebaseSvc = require('./firebase');

function getUserProfile(payload,callback){
  request('https://slack.com/api/users.info?token=' + config.slack.apiToken + '&user=' + payload.userId + '&pretty=1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var userInfo = JSON.parse(body).user;
      payload.color  = userInfo.color;
      payload.avatar = userInfo.profile.image_192;

      callback(payload,firebaseSvc.resizeMessageLength);
    }
  });
}
//
function checkToken(token){
  if (token == config.slack.webhookGeneralToken ||
      token == config.slack.webhookEngineeringToken ||
      token == config.slack.webhookRandomToken) {
    return true;
  } else {
    return false;
  }
}

var slackSvc = {
  getUserProfile: function(payload,callback){
    return getUserProfile(payload,callback);
  },
  checkToken: function(token){
    return checkToken(token);
  }
};

module.exports = slackSvc;
