var SerialPort = require("serialport").SerialPort;
var serialport = new SerialPort("/dev/tty.usbmodem1421");
serialport.on('open', function(){
  console.log('Serial Port Opend');
  setInterval(function(){
    serialport.write("ciaomamma\n");
  },200);
  // serialport.on('data', function(data){
  //     console.log('Data: ' + JSON.stringify(data));
  //     console.log(data[0]);
  // });
});