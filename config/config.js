"use strict";

var env = require('../env.json');
var common = require('./common');
var config = common.config();

config.firebase = {
  url: config.firebaseUrl,
  secret: config.firebaseSecret
}

config.slack = {
  apiToken: config.slackApiToken,
  webhookGeneralToken: config.slackWebhookGeneralToken,
  webhookEngineeringToken: config.slackWebhookEngineeringToken,
  webhookRandomToken: config.slackWebhookRandomToken
}

module.exports = config;
