'user strict';

var config = require('./config/config')
var firebase = require('./services/firebase');
var express = require('express');
var app = express();

app.get('/', function (req, res){
  res.send('Hello World!');
});

var server = app.listen(3002, function (){
  var host = server.address().address;
  var port = server.address().port;

  //firebase.set({
    //title: "Something",
    //author: "Me"
  //})

  console.log('Example app listening at http://%s:%s', host, port);
})
