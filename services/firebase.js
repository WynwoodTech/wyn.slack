"use strict";

var Firebase = require('firebase');
var config = require('../config/config.js');

var firebase = new Firebase(config.firebase.url);

module.exports = firebase;
