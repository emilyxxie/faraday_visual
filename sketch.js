p5.disableFriendlyErrors = true;

var filings = [];
var poleN;
var poleS;
var poleDist = 5;

// distance between each filing
var fDist = 18;

function setup() {
  createCanvas(
    this.windowWidth,
    this.windowHeight
  );
  spawnFilings();
  console.log(filings.length);
  strokeWeight(0.8);
  stroke(255, 150);
  halfHeight = height / 2;
  poleN = mouseY + poleDist;
  poleS = mouseY - poleDist;
}

function draw() {
  background(0);
  for (var i = 0; i < filings.length; i++) {
    filing = filings[i];
    filing.update();
    filing.render();
  }
}

function spawnFilings() {
  for (var y = 0; y <= height; y += fDist) {
    for (var x = 0; x <= width; x += fDist) {
      filings.push(new Filing(x + Math.random() * fDist, y + Math.random() * fDist));
    }
  }
}

function Filing(x, y) {
  this.x = x;
  this.y = y;
  this.nearN;
  this.nearS;
  this.facing = Math.random() * 2;
  this.size = random(6, 10);

  this.render = function() {

    var x1 = this.x + Math.cos(Math.PI * this.facing) * this.size;
    var y1 = this.y + Math.sin(Math.PI * this.facing) * this.size;
    var x2 = this.x + Math.cos(Math.PI * (this.facing + 1)) * this.size;
    var y2 = this.y + Math.sin(Math.PI * (this.facing + 1)) * this.size;

    line(x1, y1, x2, y2);
  }


// Filing.prototype.rotate = function() {
//   var deltaX, deltaY, theta, pX, bias;
//   if (this.x < mouseX) {
//     pX = poleN;
//     this.nearN = 1;
//     this.nearS = 0;
//   } else {
//     pX = poleS;
//     this.nearN = 0;
//     this.nearS = 1;
//   }
//   if (this.x < poleN || this.x > poleS) {
//     deltaX = pX - this.x;
//     deltaY = mouseY - this.y;
//     theta = Math.atan(deltaY / deltaX);
//     if (this.nearS) { theta += Math.PI; }
//   } else {
//     bias = Math.abs((this.x - mouseX)/(pX - mouseX));
//     deltaX = pX - this.x;
//     deltaY = (mouseY - this.y) * bias;
//     theta = Math.atan(deltaY / deltaX) + Math.PI;
//     if (this.nearS) { theta += Math.PI; }
//   }
//   this.facing = theta / Math.PI;
// };


  this.update = function() {
    var deltaX, deltaY, theta, pX, bias;
    if (this.y < mouseY) {
      pY = poleS;
      this.nearN = 0;
      this.nearS = 1;
    } else {
      pY = poleN;
      this.nearN = 1;
      this.nearS = 0;
    }
    if (this.y > poleN || this.y < poleS) {
      deltaY = pY - this.y;
      deltaX = mouseX - this.x;
      theta = Math.atan(deltaX / deltaY);
      if (this.nearS) { theta += Math.PI; }
    } else {
      bias = Math.abs((this.y - mouseY)/(pX - mouseX));
      deltaY = pY - this.y;
      deltaX = (mouseX - this.x) * bias;
      theta = Math.atan(deltaX / deltaY) + Math.PI;
      if (this.nearS) { theta += Math.PI; }
    }
    this.facing = theta / Math.PI;
    // console.log(this.facing);
    // if (frameCount > 10) {
    //   noLoop();
    // }
  }
}


// var u;
// var l;
// var a;
// var mods = [];
// var x;
// var y;
// var count;

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   u = 15;
//   l = 7;
//   var highCount = height/80;
//   var wideCount = width/80;
//   count = int(highCount * wideCount);
//   console.log(count);

//   var index = 0;
//   for (var xc = 0; xc < wideCount; xc++) {
//     for (var yc = 0; yc < highCount; yc++) {
//       mods[index++] = new Module(int(xc)*u,int(yc)*u);
//     }
//    }
// }

// function draw() {


//   if (mouseIsPressed) {
//     background(0);
//     stroke(255,163,163);
//   } else {
//     background(0);
//     stroke(255);
//   }

//   strokeWeight(0.5);

//   translate(20, 20);

//   for (var i = 0; i <= count; i++) {
//     mods[i].update();
//     mods[i].draw2();
//   }

//   // if (frameCount >= 3) {
//   //   noLoop();
//   // }

// }

// function Module(_x, _y) {
//   this.x = _x;
//   this.y = _y;
//   this.a = 0;


// }

// Module.prototype.update = function() {
//   if (mouseIsPressed) {
//     this.a = -20 * (atan2(mouseY-this.y, mouseX-this.x));
//   } else {
//     this.a = atan2(mouseY-this.y, mouseX-this.x);
//   }
// }

// Module.prototype.draw2 = function() {
//   push();
//   translate(this.x, this.y);
//   rotate(this.a);
//   line(-l,0,l,0);
//   pop();
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }




//////////////////// FILINGS CODEPEN /////////////////////




// var canvas = document.getElementById('canvas');
// var ctx = canvas.getContext('2d');

// canvas.width = innerWidth;
// canvas.height = innerHeight;

// window.addEventListener('resize', function(){
//   canvas.width = innerWidth;
//   canvas.height = innerHeight;
// })

// var numFilings = Math.round(innerWidth * 1.5);
// var filingLength = 12;
// var magWidth = innerWidth / 2;
// var magHeight = magWidth / 7;
// var mouseX = innerWidth / 2;
// var mouseY = innerHeight/2;
// var moving = 0;
// var magnetVisible = 1;
// var poleN = mouseX - magWidth/10 + magHeight/5;
// var poleS = mouseX;

// function Filing() {
//   this.x = Math.random() * innerWidth;
//   this.y = Math.random() * innerHeight;
//   this.facing = Math.random() * 2;
//   this.nearN;
//   this.nearS;
//   this.length = Math.random();
//   this.dynamicSpeed = 0.04 + Math.random() * 0.04;
// }

// Filing.prototype.rotate = function() {
//   var deltaX, deltaY, theta, pX, bias;
//   if (this.x < mouseX) {
//     pX = poleN;
//     this.nearN = 1;
//     this.nearS = 0;
//   } else {
//     pX = poleS;
//     this.nearN = 0;
//     this.nearS = 1;
//   }
//   if (this.x < poleN || this.x > poleS) {
//     deltaX = pX - this.x;
//     deltaY = mouseY - this.y;
//     theta = Math.atan(deltaY / deltaX);
//     if (this.nearS) { theta += Math.PI; }
//   } else {
//     bias = Math.abs((this.x - mouseX)/(pX - mouseX));
//     deltaX = pX - this.x;
//     deltaY = (mouseY - this.y) * bias;
//     theta = Math.atan(deltaY / deltaX) + Math.PI;
//     if (this.nearS) { theta += Math.PI; }
//   }
//   this.facing = theta / Math.PI;
// };

// Filing.prototype.drawNormal = function() {
//   ctx.strokeStyle = this.nearN ? '#f00' : '#00f';
//   var x1 = this.x + Math.cos(Math.PI * this.facing) * filingLength;
//   var y1 = this.y + Math.sin(Math.PI * this.facing) * filingLength;
//   var x2 = this.x + Math.cos(Math.PI * (this.facing + 1)) * filingLength;
//   var y2 = this.y + Math.sin(Math.PI * (this.facing + 1)) * filingLength;

//   ctx.beginPath();
//   ctx.moveTo(x1,y1);
//   ctx.lineTo(x2,y2);
//   ctx.stroke();
// };

// Filing.prototype.drawDynamic = function() {
//   this.length + this.dynamicSpeed >= 1 ? (this.length = 0,
//                                           this.x = Math.random() * innerWidth,
//                                           this.y = Math.random() * innerHeight,
//                                           this.rotate()
//                                          ) : this.length += this.dynamicSpeed;
//   var lightness = 60 * this.length;

//   if (this.nearN) {
//     ctx.strokeStyle = 'hsl(0,100%,' + lightness + '%)';
//     var x1 = this.x + Math.cos(Math.PI * this.facing) * (filingLength * this.length * 2);
//     var y1 = this.y + Math.sin(Math.PI * this.facing) * (filingLength * this.length * 2);

//     ctx.beginPath();
//     ctx.moveTo(this.x,this.y);
//     ctx.lineTo(x1,y1);
//     ctx.stroke();
//   } else {
//     ctx.strokeStyle = 'hsl(240,100%,' + lightness + '%)';
//     ctx.strokeStyle = this.nearN ? 'hsl(0,100%,' + lightness + '%)' : 'hsl(240,100%,' + lightness + '%)';
//     var x1 = this.x - Math.cos(Math.PI * this.facing) * (filingLength * this.length * 2);
//     var y1 = this.y - Math.sin(Math.PI * this.facing) * (filingLength * this.length * 2);

//     ctx.beginPath();
//     ctx.moveTo(this.x, this.y);
//     ctx.lineTo(x1, y1);
//     ctx.stroke();
//   }
// };

// var filings = [];

// for (var i = 0; i < numFilings; i++) {
//   filings.push(new Filing);
//   filings[i].rotate();
// }

// document.addEventListener('mousemove', function(e){
//   e.preventDefault();
//   moving = 1;
//   mouseX = e.clientX;
//   mouseY = e.clientY;
//   poleN = mouseX - magWidth/2 + magHeight/2;
//   poleS = mouseX + magWidth/2 - magHeight/2;
// })

// document.addEventListener('touchmove', function(e) {
//   e.preventDefault();
//   mouseX = e.touches[0].pageX;
//   mouseY = e.touches[0].pageY;
//   moving = 1;
//   poleN = mouseX - magWidth/2 + magHeight/2;
//   poleS = mouseX + magWidth/2 - magHeight/2;
// }, false);

// document.addEventListener('click', function(e){
//   e.preventDefault();
//   magnetVisible = magnetVisible ? 0 : 1;
// })

// function drawMagnet() {
//   ctx.fillStyle = '#c00';
//   ctx.fillRect(mouseX - magWidth/2, mouseY - magHeight/2, magWidth/2, magHeight);
//   ctx.fillStyle = "#ddd";
//   ctx.fillRect(mouseX, mouseY - magHeight/2, magWidth/2, magHeight);
// }

// function drawAttrPoints() {
//   ctx.fillStyle = '#fff';
//   ctx.fillRect(poleN - 1, mouseY - 1, 2, 2);
//   ctx.fillRect(poleS - 1, mouseY - 1, 2, 2);
// }

// function animate() {
//   if (magnetVisible) { ctx.clearRect(0, 0, innerWidth, innerHeight); }
//   else {
//     ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
//     ctx.fillRect(0, 0, innerWidth, innerHeight);
//   }

//   for (var i = 0; i < filings.length; i++) {
//     if (magnetVisible) { filings[i].drawNormal(); }
//     else { filings[i].drawDynamic(); }
//     if (moving) { filings[i].rotate(); }
//   }

//   if (mouseX && magnetVisible) {
//     drawMagnet();
//   } else {
//     drawAttrPoints();
//   }

//   moving = 0;
//   window.requestAnimationFrame(animate);
// }

// animate();