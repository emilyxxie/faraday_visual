// a p5 project by Emily Xie. http://xie-emily.com

p5.disableFriendlyErrors = true;

const MAGNETIC_MOMENT = 1000000;
const MAXIMUM_INTENSITY = 80;
const MINIMUM_INTENSITY = 8;

/* Bring out variables to reduce the number of variables being set.
This is to decrease the total number of calls to garbage collection
for performance increase. */

var tilt = 0.5;
var phi;
var x1;
var y1;
var x2;
var y2;
var strokeOpacity;
var newStrokeOpacity;
var radians;

var deltaX;
var deltaY;
var theta;
var hypoteneuse;
var prevStrokeWeight;
var prevStrokeOpacity;

var strokeWeights = [0.1, 0.2, 0.3, 0.5, 1.0, 1.2,
1.3, 1.4, 1.5, 1.6, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0];

var opacityVariances = [0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

// distance between each filing
var fDist = 16;
var filings = [];
var intensityMultiplier;

function setup() {
  createCanvas(
    this.windowWidth,
    this.windowHeight
  );
  if (height * width < 900000) {
    // if the screen is small enough,
    // we can afford to have more filings without a noticeable
    // performance hit.
    fDist = 13;
  } else {
    fDist = 16;
  }
  intensityMultiplier = width / 1.5;
  strokeOpacity = 255;
  spawnFilings();
  mouseX = width / 2;
  mouseY = height / 2;
}

function sortByStrokeWeight(filingA, filingB) {
  /* Sort by the stroke weight to minimize the number of times that
     we need to call stroke weight. */
  return filingA.strokeWeight - filingB.strokeWeight;
}

function draw() {
  background(2);
  for (var i = 0; i < filings.length; i++) {
    filing = filings[i];
    filing.calculateIntensity();
    filing.render(i);
  }
}


function compareFunction(filingA, filingB) {
  return filingA.intensity - filingB.intensity;
}

function spawnFilings() {
  for (var y = 0; y <= height; y += fDist) {
    for (var x = 0; x <= width; x += fDist) {
      var filing = new Filing(x + Math.random() * fDist, y + Math.random() * fDist);
      filing.getRandomStrokeWeight();
      filing.getRandomOpacityVariance();
      filings.push(filing);
    }
  }
}

function Filing(x, y, i) {
  this.x = x;
  this.y = y;
  this.size = random(5, 7);
  this.intensity = 0;
  this.theta = 0;
  this.i = i;
  this.strokeWeight;
  this.opacityVarianceMultiplier;
  this.appearIfFaded = Math.floor(Math.random() * 1.4);

  this.getRandomStrokeWeight = function() {
    this.strokeWeight = strokeWeights[Math.floor(Math.random() * strokeWeights.length)];
  }

  // varying each filing's intensity gives some illusion of texture.
  this.getRandomOpacityVariance = function() {
    this.opacityVarianceMultiplier = opacityVariances[Math.floor(Math.random() * opacityVariances.length)];
  }
  /*
    This calculates the intensity of the magnetic field for any given filing, assuming that the mouse acts as the magnet's center. This uses the magnetic flux density equation.
  */
  this.calculateIntensity = function() {
    deltaX = (mouseX - this.x);
    deltaY = (mouseY - this.y);
    this.theta = Math.atan(deltaY / deltaX);

    hypoteneuse = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    // in the original equation, the hypoteneuse is raised to the power of 3, but quadratic looks a bit better.
    intensity = (MAGNETIC_MOMENT * Math.sqrt(3 * Math.pow(Math.cos(this.theta), 2) + 1)) / Math.pow(hypoteneuse, 2);
    // maybe I can adjust this intensity based on screen size too.
    this.intensity = map(intensity, 0, 45, 0, MAXIMUM_INTENSITY);
  }

  /*
    Now that we have theta, we can use it to calculate the rotation of each filing using another equation, which we'll set to phi.
  */
  this.render = function(i) {
    phi = this.theta + Math.atan(0.5 * Math.tan(this.theta));
    x1 = this.x + Math.cos(phi + tilt) * this.size;
    y1 = this.y + Math.sin(phi + tilt) * this.size;

    radians = phi + Math.PI + tilt * frameCount / 10;
    x2 = this.x + Math.cos(radians) * this.size;
    y2 = this.y + Math.sin(radians) * this.size;

    // give the final intensity a floor and ceiling so that no filing is
    // either too bright or too dim.
    if (this.intensity > MAXIMUM_INTENSITY) {
      this.intensity = MAXIMUM_INTENSITY;
    }

    if (this.intensity < MINIMUM_INTENSITY) {
      this.intensity = MINIMUM_INTENSITY;
    }

    /* Only set the stroke weight when necessary. This drastially cuts down on the calls to StrokeWeight. */
    if (prevStrokeWeight !== this.strokeWeight) {
      prevStrokeWeight = this.strokeWeight;
      strokeWeight(this.strokeWeight);
    }

    strokeOpacity = Math.floor(this.intensity * this.opacityVarianceMultiplier);

    if (this.intensity > MINIMUM_INTENSITY) {
      if (prevStrokeOpacity != strokeOpacity) {
        /* Only set the stroke opacity is the prior one is
        different than the current. This should give us a small performance increase.
        With 6000 filings, this if statement will reduce the number of calls to stroke()
        up to half per frame. */
        prevStrokeOpacity = strokeOpacity;
        stroke(255, 255, 255, strokeOpacity);
      }
      line(x1, y1, x2, y2);
    } else {
      if (this.appearIfFaded) {
        if (prevStrokeOpacity > MINIMUM_INTENSITY) {
          /* Only set the strokeOpacity if it's any different from the last frame.
             This will cut down the calls to stroke() from hundreds of times per
             frame to < 50. */
          stroke(255, 255, 255, MINIMUM_INTENSITY);
          prevStrokeOpacity = MINIMUM_INTENSITY;
        }
        line(x1, y1, x2, y2);
      }
    }
  }
}

function windowResized() {
  filings = [];
  setup();
}

