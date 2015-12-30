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

  if (req.body.token == config.slack.webhookToken){
    var payload = {
      room:  req.body.channel_name,
      token: req.body.token,
      userId: req.body.user_id,
      message: req.body.text,
      username: req.body.user_name,
      timestamp: req.body.timestamp
    }

    getUserProfile(payload,pushToFirebase);

    res.send('success');
  } else {
    res.send('Token is incorrect');
  }

});

var getUserProfile = function(payload, callback){
  request('https://slack.com/api/users.info?token=' + config.slack.apiToken + '&user=' + payload.userId + '&pretty=1',
    function(error,response,body){

      if (error){
        return console.log("Error" + error);
      }

      userInfo = JSON.parse(body).user;
      payload.color  = userInfo.color;
      payload.avatar = userInfo.profile.image_192;

      callback(payload);
    })
}

var pushToFirebase = function(payload){
  var roomRef = firebase.child(payload.room).push().set({
    color:     payload.color,
    avatar:    payload.avatar,
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
