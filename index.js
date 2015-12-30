'user strict';

var config = require('./config/config'),
  firebase = require('./services/firebase'),
   express = require('express'),
bodyParser = require('body-parser'),
   request = require("request"),
       app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res){
  res.send('Hello World!');
});

app.post('/new_message', function (req, res){
  //console.log(req.body);

  if (checkToken(req.body.token)){
    var payload = {
      room:  req.body.channel_name,
      token: req.body.token,
      userId: req.body.user_id,
      message: req.body.text,
      username: req.body.user_name,
      timestamp: req.body.timestamp
    }

    if (payload.message == ''){
      return res.send('No message provided');
    }

    getUserProfile(payload,pushToFirebase);

    res.send('success');

  } else {

    res.send('Token is incorrect');
  }

});

var checkToken = function(token){
  if (token == config.slack.webhookGeneralToken ||
      token == config.slack.webhookEngineeringToken ||
      token == config.slack.webhookRandomToken){
    return true;
  } else {
    return false;
  }
}

var getUserProfile = function(payload, callback){
  request('https://slack.com/api/users.info?token=' + config.slack.apiToken + '&user=' + payload.userId + '&pretty=1',
    function(error,response,body){

      if (error){
        return console.log("Error" + error);
      }

      userInfo = JSON.parse(body).user;

      payload.color  = userInfo.color;
      payload.avatar = userInfo.profile.image_192;

      callback(payload,resizeMessageLength);
    })
}

var pushToFirebase = function(payload, callback){
  var roomRef = firebase.child(payload.room).push().set({
    color:     payload.color,
    avatar:    payload.avatar,
    message:   payload.message,
    username:  payload.username,
    timestamp: payload.timestamp
  })

  callback(payload.room);
}

var resizeMessageLength = function(room){
  var ref = firebase.child(room);
  ref.on('value', function(snapshot){
    console.log(snapshot.val());
    var length = Object.keys(snapshot.val()).length
    if (length > config.maxMessageLength){
      for (first in snapshot.val()) break;
      ref.child(first).remove();
    }
  }, function(errorObject){
    console.log("The read failed: " + errorObject.code);
  });
}

var server = app.listen(3002, function (){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
})
