var express = require('express');
var fs = require('fs');

// http://www.senchalabs.org/connect/static.html
var app = express.createServer(express.logger());

app.use("/img", express.static(__dirname + "/img"));

app.get('/', function(request, response) {
  var buffer = fs.readFileSync("index.html");
  response.send(buffer.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
