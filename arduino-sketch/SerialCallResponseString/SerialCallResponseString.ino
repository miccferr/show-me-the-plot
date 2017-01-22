/*
  Serial Call and Response
  Language: Wiring/Arduino

  This program sends an ASCII A (byte of value 65) on startup
  and repeats that until it gets some data in.
  Then it waits for a byte in the serial port, and
  sends three sensor values whenever it gets a byte in.

  Thanks to Greg Shakar and Scott Fitzgerald for the improvements

   The circuit:
   potentiometers attached to analog inputs 0 and 1
   pushbutton attached to digital I/O 2

  Created 26 Sept. 2005
  by Tom Igoe
  modified 24 April 2012
  by Tom Igoe and Scott Fitzgerald

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/SerialCallResponse

*/

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete
boolean iAmFreeSendMeData = false;  // whether the string is complete

void setup() {
  // start serial port at 9600 bps:
  Serial.begin(9600);
  // reserve 2000 bytes for the inputString:
  inputString.reserve(600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  establishContact();  // send a byte to establish contact until receiver responds
}

void loop() {

  // print the string when a newline arrives:
  if (stringComplete) {
    Serial.println(inputString);
    // clear the string:
    inputString = "";
    stringComplete = false;
    iAmFreeSendMeData = true;
    Serial.write(1);  
  }
}

void establishContact() {
  while (Serial.available() <= 0) {
    Serial.write(1);
    iAmFreeSendMeData = true;
    //    delay(300);
  }
}

/*
  SerialEvent occurs whenever a new data comes in the
  hardware serial RX.  This routine is run between each
  time loop() runs, so using delay inside loop can delay
  response.  Multiple bytes of data may be available.
*/
void serialEvent() {
  //    // if we get a valid byte, read analog ins:
      if (Serial.available() > 0 ) {
  
  //  while still assembling data..keep sending!
//  while (iAmFreeSendMeData) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;   
    Serial.println(inputString);
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {      
      Serial.write(0);    
      stringComplete = true;
      iAmFreeSendMeData = false;
    }
  }
}


