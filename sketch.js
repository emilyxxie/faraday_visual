p5.disableFriendlyErrors = true;

const MAGNETIC_MOMENT = 1000000;
const MAXIMUM_FILING_OPACITY = 90;
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
  intensityMultiplier = width / 5;
  spawnFilings();
}

function draw() {
  background(0);
  for (var i = 0; i < filings.length; i++) {
    filing = filings[i];
    filing.calculateIntensity();
    filing.render(i);
  }
  // noLoop();
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
    theta = Math.atan(deltaY / deltaX);

    // set theta for use by render function
    this.theta = theta;
    var hypoteneuse = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    // in the original equation, the hypoteneuse is raised to the power of 3, but quadratic looks a bit better.
    var intensity = (MAGNETIC_MOMENT * Math.sqrt(3 * Math.pow(Math.cos(theta), 2) + 1)) / Math.pow(hypoteneuse, 2);
    this.intensity = map(intensity, 0, 50, 0, MAXIMUM_FILING_OPACITY);
  }

  /*
    Now that we have theta, we can use it to calculate the rotation of each filing using another equation, which we'll set to phi.
  */
  this.render = function(i) {
    var tilt= 0.5;
    var phi = this.theta + Math.atan(0.5 * Math.tan(this.theta));
    var x1 = this.x + Math.cos(phi + tilt) * this.size;
    var y1 = this.y + Math.sin(phi + tilt) * this.size;
    var x2 = this.x + Math.cos(phi + Math.PI + tilt) * this.size;
    var y2 = this.y + Math.sin(phi + Math.PI + tilt) * this.size;

    // give the final intensity a floor and ceiling so that no filing is
    // either too bright or too dim/
    var finalIntensity = this.intensity;
    if (this.intensity > MAXIMUM_FILING_OPACITY) {
      finalIntensity = MAXIMUM_FILING_OPACITY
    }
    if (this.intensity < MINIMUM_FILING_OPACITY) {
      finalIntensity = MINIMUM_FILING_OPACITY
    }

    strokeWeight(this.strokeWeight);
    stroke(255, 255, 255, finalIntensity * this.opacityVarianceMultiplier);
    line(x1, y1, x2, y2);
  }

}
