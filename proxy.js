var express = require('express');
var app = express();
var base64=require('base-64');
var request = require('request');
var config = require('./config');
var bodyParser = require('body-parser');
//domain 
var domain = "https://ydevopsa60b97f07.hana.ondemand.com/";

var credentials=base64.encode(config.user + ":" + config.password);
var xsapp =config.app;
//put + post body handling
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));

//prevent caching 
var nocache = require('nocache')
app.use(nocache())
//etags disable to send back correct status codes 
app.disable('etag');
app.all('/api/*', function(req, res) {
  //set request settings 
  var reqSettings={
    method:req.method,
    url:domain + xsapp + req.originalUrl,
    headers:{'Authorization':'Basic ' + credentials}
  }
  if(Object.keys(req.body).length !== 0){
    reqSettings.body = JSON.stringify(req.body);
  }
  request(reqSettings,function(err,httpResponse,body){
    //log error
    if(err){
      res.status(500).send("proxy received no response");  
    }
    if(httpResponse){
      res.set(httpResponse.headers);

      //log request
      console.log(req.method + " Request: " + req.path + " response:" + httpResponse.statusCode);
      //log query for easy reading
      if(Object.keys(req.query).length !== 0){
        console.log("query:" +JSON.stringify(req.query, null, 4));
      }
      //send response
      res.status(httpResponse.statusCode).send(httpResponse.body);
    }
  }); 
});
var port = config.port ? config.port : 8000;
app.listen(port);
console.log("proxy server started to " + domain + xsapp + " On localhost:" + port);
app.use(express.static(__dirname + '/'));