function getBoundingBox(data) {
  var bounds = {},
      coords,
      point,
      latitude,
      longitude;
  // We want to use the “features” key of the FeatureCollection (see above)
  var data = data.features;
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

function mercator(longitude, latitude) {
  var radius = 6378137;
  var max = 85.0511287798;
  var radians = Math.PI / 180;
  var point = {};

  point.x = radius * longitude * radians;
  point.y = Math.max(Math.min(max, latitude), -max) * radians;
  point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

  return point;
};

function coordinateToPoint(latitude, longitude, bounds, width, height) {
    // project the boundaries in meters
    var boundsPrjMAX = mercator(bounds.yMax, bounds.xMax)
    var boundsPrjMIN = mercator(bounds.yMin, bounds.yMin)

    // calc the scaling factor:
    // how many times the geojson bbox max wdith(height) fits into the drawing area widht(height)?
    // note: that's why you had to project the geojson bbox first
    var xScale = width / Math.abs(boundsPrjMAX.x - boundsPrjMIN.x);
    var yScale = height / Math.abs(boundsPrjMAX.y - boundsPrjMIN.y);
    var scale = xScale < yScale ? xScale : yScale;

    var point = mercator(latitude, longitude)

    return {
      x: (point.x - bounds.xMin) * scale ,
      y: (bounds.yMax - point.y) * scale
    };
  };




  module.exports = {
    getBoundingBox: getBoundingBox,
    mercator: mercator,
    coordinateToPoint: coordinateToPoint
  }
