var p5      = require('p5');
var io = require('socket.io-client');
var socket = io.connect();
var utils = require('./utils.js');
var data = require("./us-states.json");
var tb = require('turf-bbox');
var SphericalMercator = require('sphericalmercator');
var me = require('mercator-projection');


var context, coords, point, latitude, longitude, xScale, yScale, scale, firstPoint, newPoint, oldPoint
// var merc = new SphericalMercator({
//     size: 256
// });


function sketch(p) {


  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(240);
  }

  p.draw = function() {
      // socket.on('newGeoJSONtoDraw', function (data) {
      // console.log('receiving data');


      // EXTERNAL BOUNDING BOX
      // -----------------------------------
      // calculate extension
      var bounds = tb(data)
      // console.log('bounds',bounds);
      // convert into xy
      // see https://gis.stackexchange.com/questions/34276/whats-the-difference-between-epsg4326-and-epsg900913
      // var xy_bounds = merc.convert(bounds, '900913')
      var sw = me.fromLatLngToPoint({lat: bounds[1], lng: bounds[0]});
      var ne = me.fromLatLngToPoint({lat: bounds[3], lng: bounds[2]});

      // console.log('ne', ne);
      // console.log('sw', sw);
      // console.log(xy_bounds)
      // console.log(bounds, xy_bounds, xy_bounds2);
      // conv_boundsMin = merc.forward([bounds[0],bounds[1]])
      // conv_boundsMAX = merc.forward([bounds[2],bounds[3]])
      // console.log("conv_bounds",conv_boundsMin)
      // console.log("conv_bounds",conv_boundsMAX)

      // CALULCATE SCALING FACTOR
      //------------------------------------
      // var scale = utils.scalingFactorObject(xy_bounds, p.windowWidth, p.windowHeight)
      var scale = utils.scalingFactorObject(sw, ne, p.windowWidth, p.windowHeight)
      // console.log("scale is ", scale);
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
          // convert each point line in x/y
          // console.log(merc.forward([latitude, longitude]));
          // newPoint = utils.coordinateToPoint(latitude,longitude, bounds, p.windowWidth, p.windowHeight)
          // console.log(longitude,latitude);
          // newPoint = merc.forward([longitude,latitude])
          newPoint = {
            x: (p.windowWidth/360.0) * (180 + longitude),
            y: (p.windowHeight/180.0) * (90 - latitude)
          }
          console.log('newPoint', newPoint);

          // If this is the first coordinate in a shape, store the intial point
          if (j === 0 ) {

            firstPoint = {
              x: (p.windowWidth/360.0) * (180 + longitude),
              y: (p.windowHeight/180.0) * (90 - latitude)
            }
            // firstPoint =me.fromLatLngToPoint({lat: latitude, lng: longitude});
            console.log('firstPoint',firstPoint);
            // firstPoint = utils.coordinateToPoint(latitude,longitude, bounds, p.windowWidth, p.windowHeight)
          // then start drawing from the second round
        } else if (j ===1 ) {
            oldPoint = firstPoint
            console.log(oldPoint.x , oldPoint.y, newPoint.x, newPoint.y);
            p.line(oldPoint.x , oldPoint.y, newPoint.x, newPoint.y);
            // p.line(oldPoint[0] , oldPoint[1], newPoint[0], newPoint[1]);
            // p.line(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
            // Otherwise just keep drawing
          }else{
            oldPoint = newPoint
            p.line(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
            // console.log( oldPoint.x*scale, oldPoint.y*scale, newPoint.x*scale, newPoint.y*scale);
            // p.line(oldPoint[0]*scale, oldPoint[1]*scale, newPoint[0]*scale, newPoint[1]*scale);
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
