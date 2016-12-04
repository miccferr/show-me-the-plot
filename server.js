var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io').listen(server);
var serialport = require('serialport');// include the library

server.listen(8080);
app.use(express.static(__dirname + '/public'));

SerialPort = serialport.SerialPort; // make a local instance of it
// get port name from the command line:
portName = process.argv[2];
// Then you open the port using new() like so:
var myPort = new SerialPort(portName, {
baudRate: 9600,
// look for return and newline at the end of each data packet:
parser: serialport.parsers.readline("\n")
});

io.on('connection', function(socket){
  console.log('a user connected');

    socket.on('newGeoJSONtoDraw', function(data){
      console.log("Sending data to serial:" + JSON.stringify(data));
      myPort.write(data, 'utf-8');
   }); //close data incoming event

}); //close ws stream
