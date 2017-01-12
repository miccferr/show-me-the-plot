// var io = require('socket.io-client');
// var socket = io.connect('http://localhost:8080');
var express = require('express');
var app     = express();
var server  = require('http').Server(app);
server.listen(8000);
app.use(express.static(__dirname + '/arduino'));


// setInterval(function () {
//   socket.emit('iAmReadySendMeStuff',function () {
//     console.log("i am ready to work! send me stuff!");
//     socket.on('newFigureToDraw', function (data) {
//       console.log("pretendin I'm moving the motors to drwa the data..BZZZZ");
//       console.log(data);
//     });
//   });
// },3000);
