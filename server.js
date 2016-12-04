var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io').listen(server);
var SerialPort = require('serialport'); // include the library

server.listen(8080);
app.use(express.static(__dirname + '/public'));


// get port name from the command line:
// portName = process.argv[2];
portName = "/dev/cu.usbmodem1411";
// Then you open the port using new() like so:
// var myPort = new SerialPort(portName, {
// baudRate: 9600,
// // look for return and newline at the end of each data packet:
// parser: serialport.parsers.readline("\n")
// });

var port = new SerialPort(portName, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
  // open socket
  io.on('connection', function(socket){
    console.log('a user connected');
    // when socket gets data..
      socket.on('newGeoJSONtoDraw', function(data){
        console.log("Sending data to serial:" + JSON.stringify(data));
        // ...redirect it to arduino via serialport
        port.write(data, function(err) {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
          console.log('message written');
        });
        // myPort.write(data, 'utf-8');
     }); //close data incoming event

  }); //close ws stream


});
