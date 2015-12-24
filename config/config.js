"use strict";

var env = require('../env.json');
var common = require('./common');
var config = common.config();

config.firebase = {
  url: 'https://wyntech.firebaseIO.com',
  secret: config.firebaseSecret
}

module.exports = config;
