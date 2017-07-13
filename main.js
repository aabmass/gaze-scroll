(function(window) {
  // start tracking and calibrating immediately
  webgazer
    .begin()
    .showPredictionPoints(true);

  // screen dimensions for calculations
  var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  // some other static calculations
  var scrollBorderWidth = 0.20;

  var scrollPercent = 0.05;
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
   * The gaze listener, checks if you are looking in a border and scrolls for
   * you.
   */
  var scrollGazeListener = function(data, elapsedTime) {
    if (data == null) {
      return;
    }

    // x and y relative coordinates (scaled 0.0 to 1.0), being top left
    var xRel = 1 - (width - data.x) / width;
    var yRel = 1 - (height - data.y) / height;

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
    // looking near the right border
    else if (yRel >= 1 - scrollBorderWidth) {
      yScroll = yScrollOffset;
    }

    // finally cause the window to scroll
    if (xScroll || yScroll) {
      scrollBy(xScroll, yScroll);
    }
  };
              
}(window));
