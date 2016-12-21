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

#define JSON_BUFF_DIMENSION 2000

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete
String text;
int endResponse = 0;
boolean startJson = false;
static char sprintfbuffer[15];




void setup() {
  DynamicJsonBuffer jsonBuffer2;
  // initialize serial:
  Serial.begin(9600);
    text.reserve(JSON_BUFF_DIMENSION);
//  text.reserve(jsonBuffer2);
//  text.reserve(3*JSON_ARRAY_SIZE(2) + JSON_OBJECT_SIZE(1));
}

void loop() {
  char c = 0;  
  if (Serial.available()) {
    c = Serial.read();    
    // json contains equal number of open and close curly brackets, therefore by counting
    // the open and close occurences, we can determine when a json is completely received
    // endResponse == 0 means equal number of open and close curly brackets reached
    if (endResponse == 0 && startJson == true) {
      parseJson(text.c_str());  // parse c string text in parseJson function
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

//Still lots of issues. See http://arduino.stackexchange.com/a/25831
void parseJson(const char * jsonString) {
//  StaticJsonBuffer<1000> jsonBuffer;
  DynamicJsonBuffer jsonBuffer;
  
  // FIND FIELDS IN JSON TREE
  JsonObject& root = jsonBuffer.parseObject(jsonString);
  if (!root.success()) {
    Serial.println("parseObject() failed");
    return;
  }
  // list is the array holding all the coordinates
  JsonArray& list = root["geometry"];
  Serial.println("adasdasdasdasdasdasd ");
  Serial.println(sizeof(list));
  // iterate over the array and extract the coords by couple
  for (int i = 0; i < sizeof(list); i++) {
    double      latitude  = list[i][0];
    double      longitude = list[i][1];
    String latitudeString =  String(latitude);
    Serial.println("latitude is " + latitudeString);
  }
  Serial.println(jsonString);
  
}

//------------------------------------------------------------------------------
// instantly move the virtual plotter position
// does not validate if the move is valid
//static void teleport(float x,float y) {
//  long L1,L2;
//  IK(x,y,L1,L2);
//  laststep1=L1;
//  laststep2=L2;
//}
//------------------------------------------------------------------------------
// Inverse Kinematics - turns XY coordinates into lengths L1,L2
//static void IK(float x, float y, long &l1, long &l2) {
//  // find length to M1
//  float dy = y - limit_top;
//  float dx = x - limit_left;
//  l1 = floor( sqrt(dx*dx+dy*dy) / THREADPERSTEP1 );
//  // find length to M2
//  dx = limit_right - x;
//  l2 = floor( sqrt(dx*dx+dy*dy) / THREADPERSTEP2 );
//}

