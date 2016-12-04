# show-me-the-plot
An Arduino-controlled polarbot that plots real-time OSM edits

Inspired by: [https://osmlab.github.io/show-me-the-way/](https://osmlab.github.io/show-me-the-way/)

### NOTES:


- Setup:  `node server-p5.js` and then go to `localhost:8080/p5.html`
- Develop: `watchify public/js/p5script.js -o public/js/bundle-p5.js`
- TODO: Once 1) the alg. for geojson to canvas works 2) shapes fit the canvas then you can integrate real-time data by going to `localhost:8080` to start fetching data and pass them via socket.io


- moved the stepper logic to C++/Arduino. Enough Jhonny-five. Use node to fetch data and convert it and send it to the Arduino. Now run `watchify public/js/site.js -o public/js/bundle.js -v` instead (while also doing step1 above but going directly to localsho:080)
