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
  console.log(req.body);

  if (req.body.token == config.slack.token){
    var payload = {
      room:  req.body.channel_name,
      token: req.body.token,
      message: req.body.text,
      username: req.body.user_name,
      timestamp: req.body.timestamp
    }

    pushToFirebase(payload);

    res.send('success');
  } else {
    res.send('Token is incorrect');
  }

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
