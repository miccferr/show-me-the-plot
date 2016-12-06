/*
 * 
 Created 4 Dec. 2016
 by Michele Ferretti
 
 This example code is in the public domain.

  */

#include <ArduinoJson.h>

const unsigned long BAUD_RATE = 9600;     // serial connection speed
int inByte = 0;                           // incoming serial byte
String incoming = "";

// The type of data that we want to extract from the page
struct UserData {
  float x;
  float y;
};

// ARDUINO entry point #1: runs once when you press reset or power the board
void setup() {
  initSerial(); 
}

// ARDUINO entry point #2: runs over and over again forever
void loop() {
  // if we get a valid byte, read analog ins:
//  if (Serial.available()) {
    
    Serial.println("incoming data");
    incoming = Serial.readString();
    Serial.println(incoming);
    UserData userData;
//      if (parseUserData(json, &userData)) {
//        printUserData(&userData);
//      }   
//  }
  wait();  
}

// Initialize Serial port
void initSerial() {
  Serial.begin(BAUD_RATE);
  while (!Serial) {
    ;  // wait for serial port to initialize
  }
  Serial.println("Serial ready");
}

// Pause for a 1 minute
void wait() {
  Serial.println("Wait 60 seconds");
  delay(6000);
}

// Parse the JSON from the input string and extract the interesting values
bool parseUserData(char* content, struct UserData* userData) {
  // Compute optimal size of the JSON buffer according to what we need to parse.
  // If the memory pool is too big for the stack, use this instead:
   DynamicJsonBuffer jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(content);

  if (!root.success()) {
    Serial.println("JSON parsing failed!");
    return false;
  }
    char x[8];
  // Here were copy the strings we're interested in
  //  sprintf(x, "%f", root["geometry"][0])
  //  sprintf(y, "%f", root["geometry"][1])
  //    strcpy(userData->x,   sprintf(x, "%f", root["geometry"][0]));
  //  strcpy(userData->x, root["geometry"][1]);
  // It's not mandatory to make a copy, you could just use the pointers
  // Since, they are pointing inside the "content" buffer, so you need to make
  // sure it's still in memory when you read the string

  return true;
}

// Print the data extracted from the JSON
void printUserData(const struct UserData* userData) {
  Serial.print("X = ");
  Serial.println(userData->x);
  Serial.print("Y = ");
  Serial.println(userData->y);
}
