var p5      = require('p5');
var io = require('socket.io-client');
var socket = io.connect();
var utils = require('./utils.js');
var data = require("./us-states.json");

var context, coords, point, latitude, longitude, xScale, yScale, scale, firstPoint, newPoint, oldPoint
function sketch(p) {

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240);
  }

  p.draw = function() {
      // socket.on('newGeoJSONtoDraw', function (data) {
      // console.log('receiving data');

      var bounds = utils.getBoundingBox(data);
      // Again, we want to use the “features” key of
      // the FeatureCollection
      // Loop over the features…
      var origData = data.features;
      for (var i = 0; i < origData.length; i++) {
        // …pulling out the coordinates…
        coords = origData[i].geometry.coordinates[0];
        // …and for each coordinate…
        for (var j = 0; j < coords.length; j++) {
          longitude = coords[j][0];
          latitude = coords[j][1];
          newPoint = utils.coordinateToPoint(latitude,longitude, bounds, p.windowWidth, p.windowHeight)

          // If this is the first coordinate in a shape, store the intial point
          if (j === 0 ) {
            firstPoint = utils.coordinateToPoint(latitude,longitude, bounds, p.windowWidth, p.windowHeight)
          // then start drawing from the second round
        } else if (j ===1 ) {
            oldPoint = firstPoint
            p.line(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
            // Otherwise just keep drawing
          }else{
            oldPoint = newPoint
            p.line(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
          }
        }
      }
    // })
    // --------------------------
    // divertissment
    // --------------------------
    //   if (p.mouseIsPressed) {
    //     p.fill(0);
    //   } else {
    //     p.fill(255);
    //   }
    // p.ellipse(p.mouseX, p.mouseY, 80, 80);
    // --------------------------
  }
}

var app = new p5(sketch, document.body);
