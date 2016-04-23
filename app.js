'user strict';

var  config = require('./config/config'),
    express = require('express'),
         fs = require('fs'),
       http = require('http'),
      https = require('https'),
 privateKey = fs.readFileSync('../ssl/wyn.tech.key','utf8'),
certificate = fs.readFileSync('../ssl/wyn.tech.crt','utf8'),
 bodyParser = require('body-parser'),
    request = require("request"),
        app = express(),
       cors = require('cors'),
       redisSvc = require('./services/redisSvc'),
       slackSvc = require('./services/slackSvc'),
       firebaseSvc = require('./services/firebaseSvc');

var corsOptions = {
  origin: [ 
   'http://127.0.0.1:8081'
  ,'http://127.0.0.1:8080'
  ,'http://localhost'
  ,'http://localhost:8080'
  ,'https://wyn.tech'
  ]
};

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res){
  res.send({message: "Hello World!"});
});

app.get('/members', cors(corsOptions), function (req, res){
  var respond = function(members){
    res.send(members);
  }

  slackSvc.getSlackMembers(respond);
});

app.get('/set_members', function(req,res){
  var respond = function(){
    res.send({message: "Members Saved!"});
  }

  slackSvc.setSlackMembers(channelId,respond);
});

app.get('/new_subscriber_request', function(req,res){
  if(req.body.data){
    var email = req.body.data.email;
    slackSvc.sendNewMemberInvite(email);
    var message = "Request has been sent";
  } else {
    var message = "No email has been provided";
  }

  return res.send({message: message});
});

app.post('/new_subscriber_request', function(req,res){
  if(req.body.data){
    var email = req.body.data.email;
    slackSvc.sendNewMemberInvite(email);
    var message = "Request has been sent";
  } else {
    var message = "No email has been provided";
  }

  return res.send({message: message});
});

app.post('/incr_message_counter', function (req, res){
  if (slackSvc.checkToken(req.body.token)){
    redisSvc.increaseMessageCounter();
    res.send("Message counter increased!");
  } else {
    res.send({message: "Token is invalid"});
  }
});

app.post('/new_message', function (req, res){

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
    redisSvc.increaseMessageCounter();

    res.send('success');
  } else {
    res.send('Token is invalid');
  }

});
var options = {
  key: privateKey,
  cert: certificate
}

var server = https.createServer(options,app);

server.listen(3002, config.server.listenAddress, function (){
  var host = server.address().address;
  var port = server.address().port;

  slackSvc.setSlackMembers('',function(){});
  console.log('wyn.slack app listening at https://%s:%s', host, port);
})
