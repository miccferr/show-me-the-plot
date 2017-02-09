# show-me-the-plot
An Arduino-controlled polarbot that plots real-time OSM edits

Inspired by: [https://osmlab.github.io/show-me-the-way/](https://osmlab.github.io/show-me-the-way/)

## Architecture

OpenStreetMap API (changeset endpoint)  <---HTTP GET---> ShowMetheWay instance (on a local server, maybe runningn on a RaspberryPi?) <--Websockets--> Arduino

## SET-UP:

#### Install dependencies

`npm i`

#### Bundle all the things

`npm run build`

#### Run dev environment

`npm run dev`

It basically starts the local `show-me-the-way` fork on `localhost:8080`.

Then you can open the Arduino IDE, load the `arduino-sketch/SerialCallResponseString/SerialCallResponseString.ino` sketch and start hacking! :)


## NOTES:

It's a bit tedious but always remember to unplug/plug back in the arduino USB cable after uploading a sketching and before restarting the server.
Also, focus the browser on the active `show-me-the-way` instance otherviwse the script won't start fetching new resources from the remote OSM db.
