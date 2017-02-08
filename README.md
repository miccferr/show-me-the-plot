# show-me-the-plot
An Arduino-controlled polarbot that plots real-time OSM edits

Inspired by: [https://osmlab.github.io/show-me-the-way/](https://osmlab.github.io/show-me-the-way/)

## Architecture

OpenStreetMap API (changeset endpoint)  <---HTTP GET---> ShowMetheWay instance (on a local server, maybe runningn on a RaspberryPi?) <--Websockets--> Arduino

## NOTES:

#### Install dependencies

`npm i && npm run build`

#### Run dev environment

`npm run dev`

It basically starts the local `show-me-the-way` fork on `localhost:8080`.

Then you can open the Arduino IDE, load the `arduino-sketch/SerialEvent2/SerialCallResponseString.ino` sketch and start hacking! :)
