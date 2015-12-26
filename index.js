'user strict';

var config = require('./config/config')
var firebase = require('./services/firebase');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res){
  res.send('Hello World!');
});

app.post('/new_message', function (req, res){
  console.log(req.query);

  var payload = {
    room:  req.query.channel_name,
    token: req.query.token,
    message: req.query.text,
    username: req.query.user_name,
    timestamp: req.query.timestamp
  }

  pushToFirebase(payload);

  res.send('success');
});

var pushToFirebase = function(payload){
  var roomRef = firebase.child(payload.room).push().set({
    message:   payload.message,
    username:  payload.username,
    timestamp: payload.timestamp
  })
}

var server = app.listen(3002, function (){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
})
