/*
 *  Manage a string by using a generic, dynamic queue data structure.
 *
 *  Copyright (C) 2010  Efstathios Chatzikyriakidis (contact@efxa.org)
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// include queue library header.
#include <QueueArray.h>
#include <ArduinoJson.h>

// declare a string message.
//const String msg = "[[98.83576322222223,30.111594289567424],[98.835763,30.111593488481503],[98.83576311111112,30.111592620638405],[98.8357633888889,30.111591819552462],[98.83576388888889,30.111591218737992],[98.83576450000001,30.111590818195005],[98.83576522222222,30.111590684680678],[98.83576594444445,30.111590818195005],[98.83576655555555,30.111591285495155],[98.835767,30.111591953066785],[98.83576727777778,30.111592754152728],[98.83576733333334,30.11159355523866],[98.83576711111112,30.111594423081737],[98.83576672222223,30.111595090653335],[98.83576616666667,30.11159562471059],[98.8357655,30.11159582498208],[98.83576483333334,30.11159582498208],[98.83576416666666,30.111595557953432]]";
//const String msg = "hallo";
//const String msg = "{  \"type\": \"FeatureCollection\",  \"features\": [    {      \"type\": \"Feature\",      \"properties\": {},      \"geometry\": {        \"type\": \"Polygon\",        \"coordinates\": [          [            [              -36.2109375,              54.16243396806779            ],            [              -36.2109375,              61.77312286453146            ],            [              -21.4453125,              61.77312286453146            ],            [              -21.4453125,              54.16243396806779            ],            [              -36.2109375,              54.16243396806779            ]          ]        ]      }    },    {      \"type\": \"Feature\",      \"properties\": {},      \"geometry\": {        \"type\": \"Polygon\",        \"coordinates\": [          [            [              -13.7109375,              35.746512259918504            ],            [              -13.7109375,              47.27922900257082            ],            [              -3.515625,              47.27922900257082            ],            [              -3.515625,              35.746512259918504            ],            [              -13.7109375,              35.746512259918504            ]          ]        ]      }    }  ]}";
//const String msg = "{ \"features\": [[45],[13]] }";
// create a queue of characters.
QueueArray <char> queue;
String text;
int endResponse = 0;
boolean startJson = false;

// startup point entry (runs once).
void setup () { 
  Serial.begin (115200);
}

// loop the main sketch.
void loop () {
   char c = 0;  
   DynamicJsonBuffer jsonBuffer;
  // start serial communication.
  
  if (Serial.available()) {
    c = Serial.read(); 
//     for (int i ; i< msg.length(); i++ ){
      
    // json contains equal number of open and close curly brackets, therefore by counting
    // the open and close occurences, we can determine when a json is completely received
    // endResponse == 0 means equal number of open and close curly brackets reached
    
    
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
//  }

  if (endResponse == 0 && startJson == true) {
          parseJson(text.c_str());  // parse c string text in parseJson function
      JsonObject& root = jsonBuffer.parseObject(text);
      if (!root.success()){
        Serial.println ("fail!");        
      }
        
      for (int i=0; i < sizeof(root["geometry"][0]); i++ ){
         String latitude = root["geometry"][0][i][1];
         String longitude = root["geometry"][0][i][0];
          Serial.println(latitude);
        }
      Serial.println(text);
      text = "";                // clear text string for the next time
      startJson = false;        // set startJson to false to indicate that a new message has not yet started      
    } 

  }
  
}



