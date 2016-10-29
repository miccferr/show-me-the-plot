var p5      = require('p5');
var io = require('socket.io-client');
var socket = io.connect();
var utils = require('./utils.js');



var data = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -5.2734375,
              61.10078883158897
            ],
            [
              -29.8828125,
              45.82879925192134
            ],
            [
              -16.5234375,
              18.312810846425442
            ],
            [
              -0.703125,
              42.293564192170095
            ],
            [
              24.609375,
              19.973348786110602
            ],
            [
              20.0390625,
              57.136239319177434
            ],
            [
              37.265625,
              67.06743335108298
            ],
            [
              8.0859375,
              67.7427590666639
            ],
            [
              5.625,
              52.696361078274485
            ],
            [
              -5.2734375,
              61.10078883158897
            ]
          ]
        ]
      }
    }
  ]
}
var canvas = document.createElement('canvas');
function sketch(p) {

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
  }

  p.draw = function() {
    // socket.on('newGeoJSONtoDraw', function (data) {

      // console.log("this is the message from the other client: ", JSON.stringify(data));
      // TODO geojsonToCanvas() goes here
      var box = utils.getBoundingBox(data);
      // console.log("BBOX: " + JSON.stringify(box));
      // var canvas = document.createElement('canvas');
      console.log('canvas fuori ', canvas);
      console.log('canvas get ', canvas.getContext('2d'));
      utils.drawGeoJSON(p.windowWidth, p.windowHeight,box,data, canvas)

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
  console.log('this dovrebbe essere il cazzo di scketch', this);
}

var app = new p5(sketch, document.body);
