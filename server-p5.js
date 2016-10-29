var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io').listen(server);


server.listen(8080);

app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
  console.log('a user connected');

    socket.on('newGeoJSONtoDraw', function(data){
      console.log(data);
      io.emit('newGeoJSONtoDraw', data);      
    });


});
