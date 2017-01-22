var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var SerialPort = require('serialport'); // include the library
var kue = require('kue'),
  jobs = kue.createQueue();


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
var connections = new Array; // list of connections to the server

var port = new SerialPort(portName, {
  baudRate: 9600,
  // parser: SerialPort.parsers.byteLength(5)
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});


// set up event listeners for the serial events:
port.on('open', showPortOpen);
port.on('data', function (data) {
  console.log('Data: ' + JSON.stringify(data));
  console.log(data[0]);
  if (data[0] == 1 ) {
    console.log("Sending Data to Arduino Boss!")    
    port.write("ciaomamma\n");
  }
})

// port.on('data', sendSerialData);
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

var fakeDataALot = {
  "geometry": [
    [98.83576322222223, 30.111594289567424],
    [98.835763, 30.111593488481503],
    [98.83576311111112, 30.111592620638405],
    [98.8357633888889, 30.111591819552462],
    [98.83576388888889, 30.111591218737992],
    [98.83576450000001, 30.111590818195005],
    [98.83576522222222, 30.111590684680678],
    [98.83576594444445, 30.111590818195005],
    [98.83576655555555, 30.111591285495155],
    [98.835767, 30.111591953066785],
    [98.83576727777778, 30.111592754152728],
    [98.83576733333334, 30.11159355523866],
    [98.83576711111112, 30.111594423081737],
    [98.83576672222223, 30.111595090653335],
    [98.83576616666667, 30.11159562471059],
    [98.8357655, 30.11159582498208],
    [98.83576483333334, 30.11159582498208],
    [98.83576416666666, 30.111595557953432]
  ]
}
var fakeDataLess = {
  "geometry": [
    [98.83576322222223, 30.111594289567424],
    [98.835763, 30.111593488481503],
    [98.83576416666666, 30.111595557953432]
  ]
}

function sendFakeData() {
  console.log("sending FAKE DATA via serial: " + JSON.stringify(fakeDataLess));
  port.write(JSON.stringify(fakeDataLess));
}

function showPortClose() {
  console.log('port closed.');
}
// this is called when the serial port has an error:
function showError(error) {
  console.log('Serial port error: ' + error);
}

// with simple array
// --------------
var geomQueue = [];

function newJob(data) {
  console.log("added new geometry to the queue");
  geomQueue.push(data);
};

function sendFakeData2FakeArduino() {
  var geomToBeSent = geomQueue.pop();
  io.emit('newFigureToDraw', geomToBeSent);
  console.log("sent new geometry to be drawn");
};


// ------------------------ webSocket Server event functions
io.on('connection', handleConnection);

function handleConnection(client) {
  console.log("New Client Connection"); // you have a new client
  connections.push(client); // add this client to the connections array

  // note: comment out while testing
  // client.on('newGeoJSONtoDraw', sendToSerial);      // when a client sends a message,
  // sending fake test data
  // setInterval(sendFakeData, 5000);

  // with simple array
  client.on('newGeoJSONtoDraw', newJob);
  // instead of the following line (used to mimick an arduino)
  // client.on("iAmReadySendMeStuff", sendFakeData2FakeArduino);
  // i'm now listening for a  "data" event on the SerialPort comm
  //  by default SerialPort has its own serial parsers which emit events, i.e. data





  // comment the precedng/ uncomment the following to send test data to the arduino
  // port.write(JSON.stringify("{geometry: [[34.5,56.7], [232.6453,234346599.0006]]}"));
  client.on('close', function () { // when a client closes its connection
    console.log("Client connection closed"); // print it out
    var position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1); // and delete it from the array
  });
}

// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  for (c in connections) { // iterate over the array of connections
    connections[c].send(JSON.stringify(data)); // send the data to each connection
  }
}