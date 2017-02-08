var osmStream = require('osm-stream'),
    reqwest = require('reqwest'),
    request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    LRU = require('lru-cache'),
    query_string = require('querystring');

var io = require('socket.io-client');
var socket = io.connect();


var bboxString = ["-90.0", "-180.0", "90.0", "180.0"];
var changeset_comment_match = null;
if (location.hash) {
    var parsed_hash = query_string.parse(location.hash.replace('#', ''));
    if (parsed_hash.length == 1 && parsed_hash[Object.keys(parsed_hash)[0]] === null) {
        // To be backwards compatible with pages that assumed the only
        // item in the hash would be the bbox
        bboxString = Object.keys(parsed_hash)[0].split(',');
    } else {
        if (parsed_hash.bounds) {
            bboxString = parsed_hash.bounds.split(',');
        }
        if (parsed_hash.comment) {
            changeset_comment_match = parsed_hash.comment;
        }
    }
}

var ignore = ['bot-mode'];
var BING_KEY = 'Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU';

var map = L.map('map', {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false
}).setView([51.505, -0.09], 13);

var overview_map = L.map('overview_map', {
    zoomControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false
}).setView([51.505, -0.09], 1);

var bing = new L.BingLayer(BING_KEY, 'Aerial').addTo(map);

var osm = new L.TileLayer('//a.tiles.mapbox.com/v3/saman.map-f8nluy8d/{z}/{x}/{y}.jpg70', {
    minZoom: 4,
    maxZoom: 8,
    attribution: '<a href="https://mapbox.com/about/maps/">Terms &amp; Conditions</a>'
}).addTo(overview_map);

var lineGroup = L.featureGroup().addTo(map);

var changeset_info = document.getElementById('changeset_info');
var changeset_tmpl = _.template(document.getElementById('changeset-template').innerHTML);
var queue = [];
var changeset_cache = LRU(50);

// Remove Leaflet shoutouts
map.attributionControl.setPrefix('');
overview_map.attributionControl.setPrefix('');

var bbox = new L.LatLngBounds(
    new L.LatLng(+bboxString[0], +bboxString[1]),
    new L.LatLng(+bboxString[2], +bboxString[3]));


changeset_info.innerHTML = '<div class="loading">loading...</div>';

var lastLocation = L.latLng(0, 0);

function farFromLast(c) {
    try {
        return lastLocation.distanceTo(c) > 1000;
    } finally {
        lastLocation = c;
    }
}

function showLocation(ll) {
    var nominatim_tmpl = '//nominatim.openstreetmap.org/reverse?format=json' +
        '&lat={lat}&lon={lon}&zoom=5';
    reqwest({
        url: nominatim_tmpl.replace('{lat}', ll.lat).replace('{lon}', ll.lng),
        crossOrigin: true,
        type: 'json'
    }, function (resp) {
        document.getElementById('reverse-location').innerHTML =
            '' + resp.display_name + '';
    });
}

function fetchChangesetData(id, callback) {
    cached_changeset_data = changeset_cache.get(id);

    if (!cached_changeset_data) {
        var changeset_url_tmpl = '//www.openstreetmap.org/api/0.6/changeset/{id}';
        reqwest({
            url: changeset_url_tmpl.replace('{id}', id),
            crossOrigin: true,
            type: 'xml'
        }, function (resp) {
            var changeset_data = {};
            var tags = resp.getElementsByTagName('tag');
            for (var i = 0; i < tags.length; i++) {
                var key = tags[i].getAttribute('k');
                var value = tags[i].getAttribute('v');
                changeset_data[key] = value;
            }
            changeset_cache.set(id, changeset_data);
            callback(null, changeset_data);
        });
    } else {
        callback(null, cached_changeset_data);
    }
}

function showComment(id) {
    fetchChangesetData(id, function (err, changeset_data) {
        document.getElementById('comment').innerHTML = changeset_data.comment + ' in ' + changeset_data.created_by;
    });
}

function makeBbox(bounds_array) {
    return new L.LatLngBounds(
        new L.LatLng(bounds_array[0], bounds_array[1]),
        new L.LatLng(bounds_array[2], bounds_array[3])
    );
}

var runSpeed = 2000;

osmStream.runFn(function (err, data) {
    queue = _.filter(data, function (f) {
        var is_a_way = (f.old && f.old.type === 'way') || (f.neu && f.neu.type === 'way');
        if (is_a_way) {
            var bbox_intersects_old = (f.old && f.old.bounds && bbox.intersects(makeBbox(f.old.bounds)));
            var bbox_intersects_new = (f.neu && f.neu.bounds && bbox.intersects(makeBbox(f.neu.bounds)));
            var happened_today = moment((f.neu && f.neu.timestamp) || (f.neu && f.neu.timestamp)).format("MMM Do YY") === moment().format("MMM Do YY");
            var user_not_ignored = (f.old && ignore.indexOf(f.old.user) === -1) || (f.neu && ignore.indexOf(f.neu.user) === -1);
            var way_long_enough = (f.old && f.old.linestring && f.old.linestring.length > 4) || (f.neu && f.neu.linestring && f.neu.linestring.length > 4);
            return is_a_way &&
                (bbox_intersects_old || bbox_intersects_new) &&
                happened_today &&
                user_not_ignored &&
                way_long_enough;
        } else {
            return false;
        }
    }).sort(function (a, b) {
        return (+new Date((a.neu && a.neu.timestamp) || (a.neu && a.neu.timestamp))) -
            (+new Date((b.neu && b.neu.timestamp) || (b.neu && b.neu.timestamp)));
    });
    // if (queue.length > 2000) queue = queue.slice(0, 2000);
    runSpeed = 1500;
});

function doDrawWay() {


    document.getElementById('queuesize').innerHTML = queue.length;
    if (queue.length) {
        var change = queue.pop();
        var way = change.neu || change.old;

        // Skip ways that are part of a changeset we don't care about
        if (changeset_comment_match && way.changeset) {
            fetchChangesetData(way.changeset, function (err, changeset_data) {
                if (err) {
                    console.log("Error filtering changeset: " + err);
                    doDrawWay();
                    return;
                }

                if (changeset_data.comment && changeset_data.comment.indexOf(changeset_comment_match) > -1) {
                    console.log("Drawing way " + way.id);
                    drawWay(change, function () {
                        doDrawWay();
                    });
                } else {
                    console.log("Skipping way " + way.id + " because changeset " + way.changeset + " didn't match " + changeset_comment_match);
                    doDrawWay();
                }
            });
        } else {
            drawWay(change, function () {
                doDrawWay();
            });
        }
    } else {
        window.setTimeout(doDrawWay, runSpeed);
    }
}

function pruneLines() {
    var mb = map.getBounds();
    lineGroup.eachLayer(function (l) {
        if (!mb.intersects(l.getBounds())) {
            lineGroup.removeLayer(l);
        } else {
            l.setStyle({
                opacity: 0.5
            });
        }
    });
}

function setTagText(change) {
    var showTags = ['building', 'natural', 'leisure', 'waterway',
        'barrier', 'landuse', 'highway', 'power'
    ];
    for (var i = 0; i < showTags.length; i++) {
        var tags = change.type === 'delete' ? change.old.tags : change.neu.tags;
        if (tags[showTags[i]]) {
            change.tagtext = showTags[i] + '=' + tags[showTags[i]];
            return change;
        }
    }
    change.tagtext = 'a way';
    return change;
}

function drawWay(change, cb) {
    pruneLines();

    var way = change.type === 'delete' ? change.old : change.neu;
    change.meta = {
        id: way.id,
        type: way.type,
        // Always pull in the new side user, timestamp, and changeset info
        user: change.neu.user,
        changeset: change.neu.changeset
    };

    // Zoom to the area in question
    var bounds = makeBbox(way.bounds);

    if (farFromLast(bounds.getCenter())) showLocation(bounds.getCenter());
    showComment(change.neu.changeset);

    var timedate = moment(change.neu.timestamp);
    change.timetext = timedate.fromNow();

    map.fitBounds(bounds);
    overview_map.panTo(bounds.getCenter());
    setTagText(change);
    changeset_info.innerHTML = changeset_tmpl({
        change: change
    });

    var color = {
        'create': '#B7FF00',
        'modify': '#FF00EA',
        'delete': '#FF0000'
    }[change.type];
    if (way.tags.building || way.tags.area) {
        newLine = L.polygon([], {
            opacity: 1,
            color: color,
            fill: color
        }).addTo(lineGroup);
    } else {
        newLine = L.polyline([], {
            opacity: 1,
            color: color
        }).addTo(lineGroup);
    }
    // This is a bit lower than 3000 because we want the whole way
    // to stay on the screen for a bit before moving on.
    var perPt = runSpeed / way.linestring.length;

    function drawPt(pt) {
        newLine.addLatLng(pt);
        if (way.linestring.length) {
            window.setTimeout(function () {
                drawPt(way.linestring.pop());
            }, perPt);
        } else {
            window.setTimeout(cb, perPt * 2);
        }
    }

    newLine.addLatLng(way.linestring.pop());

    drawPt(way.linestring.pop());

    // -------------------------------------------
    // CONVERSION TIME!
    // Go over each feature..
    // and convert its coords from lat/long to XY
    // -------------------------------------------

    var mapWidth = 200;
    var mapHeight = 100;


    // go thorugh every couple of coords in the coordinates array
    // construct an array of XY values from its coordinates
    // ---------------------------------------------------
    function geojson2XYArray(data) {
        var newCoords = {
            "geometry": []
        };
        var x, y;
        //   var initX, initY;
        //   var latitude    = 41.145556; // (φ)
        //   var longitude   = -73.995;   // (λ)

        f = Math.PI / 180
        data.map(function (d) {
            latitude = d[0]; // (φ)
            longitude = d[1]; // (λ)
            // our own scaling            
            bboxLatMin = map.getBounds()._southWest.lat
            bboxLatMax = map.getBounds()._northEast.lat
            bboxLongMin = map.getBounds()._southWest.lng
            bboxLongMax = map.getBounds()._northEast.lng
            initLong = (100/(bboxLongMax - bboxLongMin  ) ) * (longitude - bboxLongMin)
            initLat = (100/(bboxLatMax - bboxLatMin  ) ) * (latitude - bboxLatMin)
            rad_lon = f * initLong
            rad_lat = f * initLat
            y = 0.90630778703664996 * Math.sin(rad_lat)
            theta = Math.asin(y)
            ct = Math.cos(theta)
            lon_t = rad_lon / 3.0
            D = 1 / (Math.sqrt(0.5 * (1 + ct * Math.cos(lon_t))))
            x = 2.66723 * ct * Math.sin(lon_t)
            y *= 1.24104 * D
            x *= D
            //   original scaling     
            // x = (x * 25.892745506)
            // y = (y * 24.585971767)            
            x = initLong.toFixed(2)
            y = initLat.toFixed(2)
            newCoords.geometry.push([x, y]);
            





            // ORIGINAL IMPLEMENTATION W/ MERCATOR
            //   ---------------------------------
            //   latitude    = d[0]; // (φ)
            //   longitude   = d[1];   // (λ)
            //   // scaling stuff        
            //     console.log("bbox ", map.getBounds()._southWest.lat);
            //     console.log("bbox ", map.getBounds()._northEast.lat);
            //     console.log("bbox ", map.getBounds()._southWest.lng);
            //     console.log("bbox ", map.getBounds()._northEast.lng);
            //     bboxLatMin = map.getBounds()._southWest.lat
            //     bboxLatMax = map.getBounds()._northEast.lat
            //     bboxLongMin = map.getBounds()._southWest.lng
            //     bboxLongMax = map.getBounds()._northEast.lng

            //     initLong = (100/(bboxLongMax - bboxLongMin  ) ) * (longitude - bboxLongMin)
            //     initLat = (100/(bboxLatMax - bboxLatMin  ) ) * (latitude - bboxLatMin)
            //     console.log("this are the middle value", initLong, " ", initLat)
            //   // get x value
            //   x = (initLong+180)*(mapWidth/360)
            //   // convert from degrees to radians
            //   var latRad = initLat*Math.PI/180;

            //   // get y value
            //   var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
            //   y = (mapHeight/2)-(mapWidth*mercN/(2*Math.PI));


            //   // store converted values in new array
            //   // to scale stuff eventually you can use this function: .toFixed(2)
            //   newCoords.geometry.push( [x,y] );
            // //   console.log(y)
            // //   console.log(newCoords);
        })

        return newCoords
    }

    // Using inestring as input instead of the geojson from lineGroup.toGeoJSON()
    // as it's more immediate
    // sending data to node server.
    // from there to arduino?
    // or maybe directly from client to arduino?
    socket.emit('newGeoJSONtoDraw', geojson2XYArray(way.linestring));




}

doDrawWay();