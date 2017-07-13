gaze-scroll
===========

Scroll by looking around a page. Uses [WebGazer.js](https://webgazer.cs.brown.edu/) to track your eyes.

### [Example](https://aabmass.github.io/gaze-scroll/)
First, calibrate WebGazer by following your mouse cursor with your eyes and
clicking a few different points in the page. Focus on the corners and borders
where you must look to scroll! Then click on the control buttons to start auto
scrolling or disable the red prediction dot.

### Try it out
Clone this repository, run `npm install` (or use yarn), then run `npm run start`
to start the dev server with HTTPS. Since WebGazer.js uses WebRTC to get a video stream,
this example must be served over HTTPS.
