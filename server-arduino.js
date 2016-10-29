var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io').listen(server);
var five = require("johnny-five");
var board = new five.Board();


server.listen(8080);

app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
  console.log('a user connected');

  board.on("ready", function() {
    // Create a standard `led` component instance
    var led = new five.Led(13);
    // "blink" the led in 500ms
    // on-off phase periods
    socket.on('newGeoJSONtoDraw', function(data){
      console.log(data);
      led.toggle();
    });
  });

});
