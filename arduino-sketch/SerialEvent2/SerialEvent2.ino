/*
  Serial Event example

 When new serial data arrives, this sketch adds it to a String.
 When a newline is received, the loop prints the string and
 clears it.

 A good test for this is to try it with a GPS receiver
 that sends out NMEA 0183 sentences.

 Created 9 May 2011
 by Tom Igoe

 This example code is in the public domain.

 http://www.arduino.cc/en/Tutorial/SerialEvent

 */
#include <SPI.h>
#include <ArduinoJson.h>

#define JSON_BUFF_DIMENSION 2500

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete
String text;
int endResponse = 0;
boolean startJson = false;
static char sprintfbuffer[15];


void setup() {
  // initialize serial:
  Serial.begin(9600);
}

void loop() {


  char c = 0;
  
  if (Serial.available()) {
//    Serial.println(endResponse + " "+ startJson);
    c = Serial.read();
    Serial.println(c);
    // json contains equal number of open and close curly brackets, therefore by counting
    // the open and close occurences, we can determine when a json is completely received
    
      // endResponse == 0 means equal number of open and close curly brackets reached 
      if (endResponse == 0 && startJson == true) {
        parseJson(text.c_str());  // parse c string text in parseJson function
        Serial.println("sadasdasd");
        text = "";                // clear text string for the next time
        startJson = false;        // set startJson to false to indicate that a new message has not yet started
      }
      if (c == '{') {
        startJson = true;         // set startJson true to indicate json message has started
        endResponse++;
      }
      if (c == '}') {
        endResponse--;
        
      }
      if (startJson == true) {
        text += c;
      }
    }  
  
}
/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
//void serialEvent() {
//  while (Serial.available()) {
//    // get the new byte:
//    char inChar = (char)Serial.read();
//    // add it to the inputString:
//    inputString += inChar;
//    // if the incoming character is a newline, set a flag
//    // so the main loop can do something about it:
//    if (inChar == '*') {
//      stringComplete = true;
//    }
//  }
//}
void parseJson(const char * jsonString) {
  StaticJsonBuffer<4000> jsonBuffer;

  // FIND FIELDS IN JSON TREE
  JsonObject& root = jsonBuffer.parseObject(jsonString);
  if (!root.success()) {
    Serial.println("parseObject() failed");
    return;
  }

  JsonArray& list = root["geometry"];
  JsonObject& coords = list[0];
  JsonObject& firstElem = list[0];
  float X = 10.2 ;
//  firstElem["X"];
  String latitude =  String(X);

  Serial.println("latitude is " + latitude);

}
