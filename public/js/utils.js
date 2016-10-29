// var canvas = document.createElement('canvas');

function getBoundingBox (data) {
  var bounds = {}, coords, point, latitude, longitude;

  // We want to use the “features” key of the FeatureCollection (see above)
  data = data.features;

  // Loop through each “feature”
  for (var i = 0; i < data.length; i++) {

    // Pull out the coordinates of this feature
    coords = data[i].geometry.coordinates[0];

    // For each individual coordinate in this feature's coordinates…
    for (var j = 0; j < coords.length; j++) {

      longitude = coords[j][0];
      latitude = coords[j][1];

      // Update the bounds recursively by comparing the current
      // xMin/xMax and yMin/yMax with the coordinate
      // we're currently checking
      bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
      bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
      bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
      bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
    }

  }

  // Returns an object that contains the bounds of this GeoJSON
  // data. The keys of this object describe a box formed by the
  // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
  return bounds;
}

function mercator (longitude, latitude) {
  var radius = 6378137;
  var max = 85.0511287798;
  var radians = Math.PI / 180;
  var point = {};

  point.x = radius * longitude * radians;
  point.y = Math.max(Math.min(max, latitude), -max) * radians;
  point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

  return point;
}

function drawGeoJSON (width, height, bounds, data, canvas) {
  var context, coords, point, latitude, longitude, xScale, yScale, scale;

  // Get the drawing context from our <canvas> and
  // set the fill to determine what color our map will be.
  context = canvas.getContext('2d');
  context.fillStyle = '#333';
  console.log('canvas ',canvas);
  console.log('this ',this);

  // Determine how much to scale our coordinates by
  xScale = width / Math.abs(bounds.xMax - bounds.xMin);
  yScale = height / Math.abs(bounds.yMax - bounds.yMin);
  scale = xScale < yScale ? xScale : yScale;

  // Again, we want to use the “features” key of
  // the FeatureCollection
  data = data.features;

  // Loop over the features…
  for (var i = 0; i < data.length; i++) {

    // …pulling out the coordinates…
    coords = data[i].geometry.coordinates[0];

    // …and for each coordinate…
    for (var j = 0; j < coords.length; j++) {

      longitude = coords[j][0];
      latitude = coords[j][1];
      point = mercator(longitude, latitude);

      // Scale the points of the coordinate
      // to fit inside our bounding box
      point = {
        x: (point.x - bounds.xMin) * scale,
        y: (bounds.yMax - point.y) * scale
      };

      // If this is the first coordinate in a shape, start a new path
      if (j === 0) {
        this.context.beginPath();
        this.context.moveTo(point.x, point.y);

      // Otherwise just keep drawing
      } else {
        this.context.lineTo(point.x, point.y);
      }
    }

    // Fill the path we just finished drawing with color
    this.context.fill();
  }
}


module.exports = {
  getBoundingBox: getBoundingBox,
  drawGeoJSON: drawGeoJSON,
  mercator: mercator
}
