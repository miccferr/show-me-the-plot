var SerialPort = require("serialport").SerialPort;
var serialport = new SerialPort("/dev/tty.usbmodem1421",{
  baudRate: 9600,
  // parser: SerialPort.parsers.byteLength(5)
});
serialport.on('open', function(){
  console.log('Serial Port Opend');
  // setInterval(function(){
  //   serialport.write("ciaomamma\n");
  // },200);
  // serialport.on('data', function(data){
  //     console.log('Data: ' + JSON.stringify(data));
  //     console.log(data[0]);
  // });
});
// serialport.on('data', function (data) {
//   console.log('Data: ' + JSON.stringify(data)); 
//   if (data[0] == 'I' ) {
//     console.log("Sending Data to Arduino Boss!")    
//     serialport.write("ciaomamma\n");
//   }
// })

setInterval(function(){
    serialport.write("ciaomamma\n");
  },200);