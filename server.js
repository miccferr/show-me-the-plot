var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io').listen(server);
var SerialPort = require('serialport'); // include the library

server.listen(8080);
app.use(express.static(__dirname + '/public'));


// get port name from the command line:
// portName = process.argv[2];
portName = "/dev/cu.usbmodem1421";
// Then you open the port using new() like so:
// var myPort = new SerialPort(portName, {
// baudRate: 9600,
// // look for return and newline at the end of each data packet:
// parser: serialport.parsers.readline("\n")
// });

// var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;            // list of connections to the server

var port = new SerialPort(portName, {
  baudRate: 9600
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});


// set up event listeners for the serial events:
port.on('open', showPortOpen);
port.on('data', sendSerialData);
port.on('close', showPortClose);
port.on('error', showError);

function showPortOpen() {
  console.log("serial port open");
}

// this is called when new data comes into the serial port:
function sendSerialData(data) {
  // if there are webSocket connections, send the serial data
  // to all of them:
  console.log(Number(data));
  if (connections.length > 0) {
    broadcast(data);
  }
}

function sendToSerial(data) {
  console.log("sending to serial: " + JSON.stringify(data));
  // port.write(data);
  port.write(JSON.stringify(data));
}

function showPortClose() {
   console.log('port closed.');
}
// this is called when the serial port has an error:
function showError(error) {
  console.log('Serial port error: ' + error);
}

// ------------------------ webSocket Server event functions
io.on('connection', handleConnection);

function handleConnection(client) {
  console.log("New Connection");        // you have a new client
  connections.push(client);             // add this client to the connections array

  client.on('newGeoJSONtoDraw', sendToSerial);      // when a client sends a message,
  // comment the precedng/ uncomment the following to send test data to the arduino
  // port.write(JSON.stringify("{geometry: [[34.5,56.7], [232.6453,234346599.0006]]}"));
  client.on('close', function() {           // when a client closes its connection
    console.log("connection closed");       // print it out
    var position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1);        // and delete it from the array
  });
}
// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  for (c in connections) {     // iterate over the array of connections
    connections[c].send(JSON.stringify(data)); // send the data to each connection
  }
}
