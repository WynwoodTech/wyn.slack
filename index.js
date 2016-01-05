'user strict';

var config = require('./config/config'),
   express = require('express'),
bodyParser = require('body-parser'),
   request = require("request"),
       app = express(),
  slackSvc = require('./services/slack'),
    firebaseSvc = require('./services/firebase');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res){
  res.send('Hello World!');
});

app.post('/new_message', function (req, res){
  //console.log(req.body);

  if (slackSvc.checkToken(req.body.token)){
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

    slackSvc.getUserProfile(payload,firebaseSvc.pushToFirebase);

    res.send('success');
  } else {
    res.send('Token is incorrect');
  }

});

var server = app.listen(3002, function (){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
})
