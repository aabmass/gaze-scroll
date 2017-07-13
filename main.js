(function(window) {
  // start tracking and calibrating immediately
  webgazer
    .setRegression('ridge')
    .setTracker('clmtrackr')
    .begin();

  console.log(webgazer.getRegression());
  console.log(webgazer.getTracker());

  // screen dimensions for calculations
  var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  // the checkbox whether or not to save
  // if data was previously saved, keep it checked
  var saveDataCheckbox = document.getElementById('save-data');
  if (window.localStorage.getItem('webgazerGlobalData')) {
    saveDataCheckbox.checked = true;
  }

  // some other static calculations
  var scrollBorderWidth = 0.10;
  var scrollPercent = 0.30;
  var scrollDurationMs = 800;
  var xScrollOffset = width * scrollPercent;
  var yScrollOffset = height * scrollPercent;

  /**
   * Button callbacks for the UI
   */
  document.getElementById('show-predictions').addEventListener('click', function(e) {
    webgazer.showPredictionPoints(true);
  });
  document.getElementById('hide-predictions').addEventListener('click', function(e) {
    webgazer.showPredictionPoints(false);
  });
  document.getElementById('start-scrolling').addEventListener('click', function(e) {
    webgazer.setGazeListener(scrollGazeListener);
  });
  document.getElementById('stop-scrolling').addEventListener('click', function(e) {
    webgazer.clearGazeListener();
  });

  /**
   * Save the model on exit. See https://webgazer.cs.brown.edu/#usage
   */
  window.addEventListener("beforeunload", function (e) {
    // this saves regression data to localStorage
    if (saveDataCheckbox.checked) {
      webgazer.end();
      console.log('Saving data model to localStorage');
    }
    else {
      window.localStorage.clear();
    }
  });

  /**
   * The gaze listener, checks if you are looking in a border and scrolls for
   * you. Also, takes a moving average of the data, storing measurements in
   * a queue and keeping the average. The queue stores just the contributions
   * i.e. the weight of each measurement in the contribution
   */
  var numToAverage = 10;
  var valuesQueue = [];
  var xPrediction = 0;
  var yPrediction = 0;

  var scrollGazeListener = function(data, elapsedTime) {
    if (data == null) {
      return;
    }
    // values queue doesn't have enough values yet
    else if (valuesQueue.length < numToAverage) {
      var curXContrib = data.x / numToAverage;
      var curYContrib = data.y / numToAverage;

      xPrediction += curXContrib;
      yPrediction += curYContrib;
      valuesQueue.push([curXContrib, curYContrib]);
      return;
    }

    /** Update the moving average */
    // remove the oldest measurement
    var oldest = valuesQueue.shift();
    xPrediction -= oldest[0];
    yPrediction -= oldest[1];

    // add in the new, current measurement
    var curXContrib = data.x / numToAverage;
    var curYContrib = data.y / numToAverage;
    xPrediction += curXContrib;
    yPrediction += curYContrib;
    valuesQueue.push([curXContrib, curYContrib]);

    /** do the computations for the current average */
    // x and y relative coordinates (scaled 0.0 to 1.0), being top left
    var xRel = 1 - (width - xPrediction) / width;
    var yRel = 1 - (height - yPrediction) / height;

    console.log("Collected " + valuesQueue.length + " averages and continuing");
    console.log("(" + xRel + ", " + yRel + ")");

    var xScroll = 0;
    var yScroll = 0;

    // looking near the left border
    if (xRel <= scrollBorderWidth) {
      xScroll = -xScrollOffset;
    }
    // looking near the right border
    else if (xRel >= 1 - scrollBorderWidth) {
      xScroll = xScrollOffset;
    }

    // looking near the top border
    if (yRel <= scrollBorderWidth) {
      yScroll = -yScrollOffset;
    }
    // looking near the bottom border
    else if (yRel >= 1 - scrollBorderWidth) {
      yScroll = yScrollOffset;
    }

    // do the actual window scroll
    if (xScroll || yScroll) {
      scrollBySmooth(xScroll, yScroll, scrollDurationMs);
    }
  };

  /** 
   * Easing function for smoothing the scrolling
   */
  var easeOutCubic = function (t) { return (--t)*t*t+1 };
  var easeOutQuint = function (t) { return 1+(--t)*t*t*t*t };
  var isCurrentlyScrolling = false;

  var scrollBySmooth = function(dx, dy, duration, easeingFunc) {
    // only allow one scrollBySmooth to run at a time
    if (isCurrentlyScrolling) return;

    easeingFunc = easeingFunc || easeOutQuint;
    isCurrentlyScrolling = true;
    var start = null;
    var xStart = window.scrollX;
    var yStart = window.scrollY;

    var animate = function(time) {
      if (!start) start = time;
      var tPerc = (time - start) / duration;

      // calculate next position
      var easePerc = easeingFunc(tPerc);
      var xNext = easePerc * dx + xStart;
      var yNext = easePerc * dy + yStart;

      // scroll to next
      window.scrollTo(xNext, yNext);

      if (tPerc < 1) {
        window.requestAnimationFrame(animate);
      }
      else {
        isCurrentlyScrolling = false;
      }
    };

    window.requestAnimationFrame(animate);
  };
              
}(window));
