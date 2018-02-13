p5.disableFriendlyErrors = true;

var tilt = 0.5;
var phi;
var x1;
var y1;
var x2;
var y2;
var strokeOpacity;
var newStrokeOpacity;
var args; // TODO: COME UP WITH BETTER NAME

var deltaX;
var deltaY;
var theta;
var hypoteneuse;

const MAGNETIC_MOMENT = 1000000;
const MAXIMUM_FILING_OPACITY = 100;
const MINIMUM_FILING_OPACITY = 12;

// distance between each filing
var fDist = 16;
var filings = [];
var intensityMultiplier;

function setup() {
  createCanvas(
    this.windowWidth,
    this.windowHeight
  );
  frameRate(30);
  intensityMultiplier = width / 2;
  spawnFilings();
  strokeOpacity = 255;

  // stroke(255, 255, 255);
}

function draw() {
  background(0);
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
      filings.push(new Filing(x + Math.random() * fDist, y + Math.random() * fDist));
    }
  }
}

function Filing(x, y, i) {
  this.x = x;
  this.y = y;
  this.size = random(5, 7.5);
  this.intensity = 0;
  this.theta = 0;
  this.i = i;
  this.strokeWeight = random(0.5, 2.5)

  // varying each filing's intensity gives some illusion of texture.
  this.opacityVarianceMultiplier = random(0.9, 1.5)

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
    this.intensity = map(intensity, 0, 50, 0, MAXIMUM_FILING_OPACITY);
  }

  /*
    Now that we have theta, we can use it to calculate the rotation of each filing using another equation, which we'll set to phi.
  */
  this.render = function(i) {
    phi = this.theta + Math.atan(0.5 * Math.tan(this.theta));
    x1 = this.x + Math.cos(phi + tilt) * this.size;
    y1 = this.y + Math.sin(phi + tilt) * this.size;

    args = phi + Math.PI + tilt * frameCount / 3.5;
    x2 = this.x + Math.cos(args) * this.size;
    y2 = this.y + Math.sin(args) * this.size;

    // give the final intensity a floor and ceiling so that no filing is
    // either too bright or too dim/
    // var finalIntensity = this.intensity;
    if (this.intensity > MAXIMUM_FILING_OPACITY) {
      this.intensity = MAXIMUM_FILING_OPACITY
    }

    if (this.intensity < MINIMUM_FILING_OPACITY) {
      this.intensity = MINIMUM_FILING_OPACITY
    }


    if ((Math.abs(this.x - mouseX) <= 200) && (Math.abs(this.y - mouseY) <= 200)) {
      // strokeWeight(this.strokeWeight);
    }
    newStrokeOpacity = this.intensity * this.opacityVarianceMultiplier;
    if (Math.abs(newStrokeOpacity - strokeOpacity) > 10) {
        strokeOpacity = newStrokeOpacity;
        stroke(255, 255, 255, strokeOpacity);
    }

    // if (strokeOpacity < 15) {
    // } else {
    line(x1, y1, x2, y2);
    // }
  }

}
