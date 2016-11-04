var d3     = require('d3');
var io = require('socket.io-client');
var socket = io.connect();

// var data = require("./us-states.json")


width = window.innerWidth;
height =  window.innerHeight;

var projection = d3.geo.albers()
.scale(1)
.translate([0, 0]);

var path = d3.geo.path()
    .projection(projection)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

socket.on('newGeoJSONtoDraw', function (data) {
  console.log(data);

  // Compute the bounds of a feature of interest, then derive scale & translate.
  var b = path.bounds(data),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  // Update the projection to use computed scale & translate.
  projection
      .scale(s)
      .translate(t);

  svg.selectAll("path")
   .data(data.features)
   .enter()
   .append("path")
   .attr("d", path)
  .attr( "fill", "#d1c9b8" )

  // svg.append("circle")        // attach a circle
  //   .attr("cx", 200)           // position the x-center
  //   .attr("cy", 100)           // position the y-center
  //   .attr("r", 50);            // set the radius


  })
