var MAX_PARTICLES = 5000;
var FIELD_RESOLUTION = 20;
var MAGNET_RESOLUTION = 50;

// not implemented - attempt to improve performance by skipping simulation steps
var SKIP_PROCESS = 3;

var Magnetism = Magnetism || {};

Magnetism.Utils = (function() {

  "use strict";

  var my = {};

  var _h2r = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  // inverse
  var _r2h = function(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
  };

  my.intCol = function(color1, color2, factor) {
    if (arguments.length < 3) {
      factor = 0.5;
    }
    var result = _h2r(color1).slice();
    for (var i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (_h2r(color2)[i] - _h2r(color1)[i]));
    }
    return _r2h(result);
  };

  my.extend = function(){
      for(var i=1; i<arguments.length; i++)
          for(var key in arguments[i])
              if(arguments[i].hasOwnProperty(key))
                  arguments[0][key] = arguments[i][key];
      return arguments[0];
  }

  return my;

})();

Magnetism.Filing = (function() {

  "use strict";

  var my = {};

  function Filing(field) {
    PIXI.Sprite.call(this);
    this.field = field;
    this.init();
  }

  var f = Filing.prototype = Object.create(PIXI.Sprite.prototype);

  f.init = function(config) {
    // Initialise the graphics from the specific canvas
    // for 'type'
    var defaults = {
      x: null,
      y: null
    }

    this.scale = new PIXI.Point(0.6, 0.4);
    //this.alpha = Math.random() * 0.5;

    config = Magnetism.Utils.extend({}, defaults, config);

    this.texture = PIXI.Texture.fromImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAJUlEQVR42mNgGAWjYBSMAtqAKVOm/KcmHrWEcktGwSgYBSMAAADzetpx95LB1QAAAABJRU5ErkJggg==');
  }

  f.setPosition = function(x, y) {
    // place the filing in a random location
    this.position.x = x;
    this.position.y = y;
  }


  f.step = function(t)
  {

    // get field strength at this point
    var field = this.field;

    this.position.x += (Math.random() - 0.5);
    this.position.y += (Math.random() - 0.5);

    var magnet = field.magnet();

    // move filings away from magnet with randomness
    /*if(   this.position.x > magnet.x - magnet.w/2
       && this.position.x < magnet.x + magnet.w/2
       && this.position.y > magnet.y - magnet.h/2
       && this.position.y < magnet.y + magnet.h/2 ) {
      this.position.x += (Math.random() - 0.5) * 80;
      this.position.y += (Math.random() - 0.5) * 80;
    }*/

    var fieldData = field.pointData(this.position.x, this.position.y);

    if(fieldData) {
      this.rotation = fieldData.dir * Math.PI;
      var a = (Math.abs(fieldData.strength) * 100000) + 0.2;
      if(a > 1) {
        a = 1;
      }
      this.alpha = a/2;
    }

  }

  return Filing;

})();


Magnetism.Field = (function(){

  var _fieldData = [];

  var _magnets = [];

  function Field() {
  };

  var f = Field.prototype;

  f.init = function(container) {
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
  }

  f.step = function(t) {
    for(var m in _magnets) {
      var magnet = _magnets[m];
      magnet.step(t);
    }
  }

  f.render = function() {
    console.log(_magnets)
    if(!_magnets.length) {
      throw('No magnets have been added into this field');
    }
    // get max abs value held in fielddata
    for(var m in _magnets) {
      var magnet = _magnets[m];
      var _fieldData = magnet.fieldData();
      for (var i in _fieldData) {
        for (var j in _fieldData[i]) {
          var val = _fieldData[i][j].strength / magnet.maxFieldStrength() * 1000;
          if(val > 1) {
            val = 1;
          }
          if(val < -1) {
            val = -1;
          }
          // -1 -> 1
          // we need 0 -> 1
          val = (val + 1) / 2;
          //if(val < 0) {

          var col = Magnetism.Utils.intCol('#884444', '#444488', val);

          col = parseInt(col.replace('#', '0x'));

          graphics.lineStyle(1, 0xFFFFFF, 0);
          graphics.beginFill(col, 0.75);
          graphics.drawRect(i * FIELD_RESOLUTION - FIELD_RESOLUTION, j * FIELD_RESOLUTION - FIELD_RESOLUTION, FIELD_RESOLUTION, FIELD_RESOLUTION);
          graphics.endFill();
        }
      }
    }
  }

  f.getStrength = function(x, y) {
    return 1;
    // todo fix bug with out-of-bounds
    //return 1 - _fieldData[Math.ceil(x/FIELD_RESOLUTION)][Math.ceil(y/FIELD_RESOLUTION)] / _maxStrength;
  }

  f.addMagnet = function(magnet) {
    if(magnet.constructor.name != "Magnet") {
      throw('Need to add a Magnet constructor to a field!');
    }
    _magnets.push(magnet);
  }

  f.pointData = function(x, y) {
    // temporary
    var data = _magnets[0].fieldData();
    var i = Math.floor(x / FIELD_RESOLUTION);
    var j = Math.floor(y / FIELD_RESOLUTION);
    if(data[i] != undefined) {
      if(data[i][j] != undefined) {
        return data[i][j];
      }
    }
    return false;
  }

  f.magnet = function() {
    // temporary
    return _magnets[0];
  }

  return Field;

})();

Magnetism.Magnet = (function(){

  var _i_max, _j_max;

  function Magnet(x, y, w, h, rot) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rot = rot;
    this.graphics = new PIXI.Graphics();
    _i_max = this.w / MAGNET_RESOLUTION;
    _j_max = this.h / MAGNET_RESOLUTION;
    this.init();

    this.direction = 1;
  }

  var m = Magnet.prototype;

  var _magneticStrength = [];
  var _fieldData = [];
  var _maxFieldStrength = [];

  var _skipCount = 0;

  /**
   * Get the X and Y coords of a specific i*j location on the magnet
   * @return {[type]} [description]
   */
  m.getXY = function(i, j) {
    var x = this.x + (_i_max * MAGNET_RESOLUTION / 2) - (i * MAGNET_RESOLUTION);
    var y = this.y + (_j_max * MAGNET_RESOLUTION / 2) - (j * MAGNET_RESOLUTION);
    return new PIXI.Point(x, y);
  }

  /**
   * Calculate the field strength of the magnet at the various
   * points along the magnet's surface (2D)
   * @return {[type]} [description]
   */
  m.init = function() {

    this.offset = new PIXI.Point(0, 0);

    for(var i = 0; i < _i_max; i++) {
      _magneticStrength[i] = [];
      for(var j = 0; j < _j_max; j++) {
        // for each point on the magnet, calculate the relative magnitude
        // Since we're only modelling a bar magnet, we can do this pretty easily
        // by just taking the i*j co-ordinates and assuming magnetic polarity
        // progresses linearly left-right and up-down.
        // Is this how magnets work? I seriously have no idea...
        // Strongest north = 1, strongest south = -1

        // Distance along the bipole, from -1 -> 1
        var dist = - (i / _i_max - 0.5) * 2

        dist = Math.pow(dist, 3);



        // Very simple initial model - based on y-axis, full north = left, full south = right
        _magneticStrength[i][j] = dist;
      }
    }
  }

  m.step = function() {



    // For testing movement
    this.rotation += Math.PI / 10;
    // for demo - move the magnet back if it hits the edge
    if(this.x >= window.innerWidth * 0.65) {
      this.direction = 0;
    }
    if(this.x <= window.innerWidth * 0.35) {
      this.direction = 1;
    }
    if(this.direction == 1) {
      this.y += 2;
      this.x += 2;
    } else {

      this.y -= 2;
      this.x -= 2;
    }
    this.calculateField();
  }

  m.calculateField = function() {
    var count = 0;
    // Now need to calculate what effect this magnet has on the surrounding field
    for(var i = 0; i < window.innerWidth / FIELD_RESOLUTION; i++) {
      _fieldData[i] = [];
      for(var j = 0; j < window.innerHeight / FIELD_RESOLUTION; j++) {

        var x = i * FIELD_RESOLUTION;
        var y = j * FIELD_RESOLUTION;

        // First, need to determine the effect that each point (based on resolution)
        // of the magnet has on this specific region of space in the field

        // Loop through all points of the magnet and calculate the distance
        var tot_B = 0;
        var tot_dir = 0;
        var tot_dist = 0;
        var tot_dy = 0;
        for(var _i = 0; _i < _magneticStrength.length; _i++) {
          for(var _j = 0; _j < _magneticStrength[_i].length; _j++) {

            // get the x, y coords of this point on the magnet
            var magnet_pos = this.getXY(_i, _j);

            // Get the distance from this point to the center of the dipole
            var _dx = magnet_pos.x - x;
            var _dy = magnet_pos.y - y;
            // The distance from this point in the field to point i*y on the magnet
            var distance = Math.sqrt(_dx * _dx + _dy * _dy);
            var angle = Math.atan(_dy / distance);
            if(x < this.x) {
              tot_dist += distance;
            } else {
              tot_dist -= distance;
            }

            // from https://books.google.co.uk/books?id=IryMtwHHngIC&pg=PA708&lpg=PA708&dq=javascript+calculate+magnetic+field&source=bl&ots=sy_hkgPqaF&sig=CRQJfY2CDdyMDi81br2CWsvefUM&hl=en&sa=X&ved=0CEQQ6AEwB2oVChMIkPvm4JjsxwIVQskUCh3mnwIZ#v=onepage&q=javascript%20calculate%20magnetic%20field&f=false
            var B = (Math.pow(10, -7) * Math.sqrt(1 + 3 * Math.pow(Math.cos(angle), 2))) / Math.pow(distance/1000, 3);

            tot_dy += _dy;

            var point_strength = _magneticStrength[_i][_j];
            // div d by the number of points on the magnet
            //strength = strength / (_i_max * _j_max);


            // Multiply this by the strength of this point on the magnet,
            // i.e. the "significance" of the distance from this point
            // to the point on the magnet
            tot_B += B * point_strength;
          }
        }
        var cells = (_i_max * _j_max);
        _fieldData[i][j] = {
          strength: tot_B / cells,
          // I don't think this works properly...
          dir: Math.atan(tot_dy*2 / tot_dist)
        }
      }
    }
    _skipCount++;
    if(_skipCount > SKIP_PROCESS) {
      _skipCount = 0;
    }
    // get the maximum strength
    _maxFieldStrength = 0;
    for(var i in _fieldData) {
      for(var j in _fieldData[i]) {
        if(_maxFieldStrength < Math.abs(_fieldData[i][j].strength)) {
          _maxFieldStrength = Math.abs(_fieldData[i][j].strength);
        }
      }
    }
  }

  m.fieldData = function() {
    return _fieldData;
  }

  m.render = function(container) {
    var graphics = new PIXI.Graphics();
    container.addChild(graphics);
    var col = 0xFFFFFF;
    graphics.beginFill(col);
    graphics.drawRect(
      this.x - this.w / 2,
      this.y - this.h / 2,
      this.w,
      this.h
    );
    graphics.endFill();
  }

  m.maxFieldStrength = function() {
    return _maxFieldStrength;
  }

  return Magnet;

})();

// initialise
(function(window) {
  var app = function() {

    var container = new PIXI.Container();

    var field_container = new PIXI.Container();
    var filings_container = new PIXI.ParticleContainer(MAX_PARTICLES, {
      scale: true,
      alpha: true,
      rotation: true
    });

    container.addChild(field_container);
    container.addChild(filings_container);

    var rendererOptions = {
      antialiasing: false,
      transparent: true,
      resolution: 1
    };

    var renderer = PIXI.autoDetectRenderer(
      window.innerWidth,
      window.innerHeight,
      rendererOptions
    );

    document.body.appendChild(renderer.view);

    var handleResize = function() {
      renderer.view.width = window.innerWidth;
      renderer.view.height = window.innerHeight;
    }

    window.onresize = handleResize;

    handleResize();

    var elap = Date.now();

    var timer = 0;

    _filings = [];

    var field = new Magnetism.Field();
    field.init(field_container);
    var magnet = new Magnetism.Magnet(
      window.innerWidth / 2,
      window.innerHeight / 2,
      600,
      100,
      0
    );
    field.addMagnet(magnet);
    //magnet.render(field_container);
    field.render();

    while(_filings.length < MAX_PARTICLES) {
      var f = new Magnetism.Filing(field);
      f.setPosition(
        window.innerWidth * Math.random(),
        window.innerHeight * Math.random()
      );
      _filings.push(f);
      filings_container.addChild(f);
    }

    var run = function(t) {
      var now = Date.now();
      elap = now;
      field.step(t);
      for(var i in _filings) {
        _filings[i].step(t);
      }
      renderer.render(container);
      requestAnimationFrame(run);
      timer += t;
    }

    run(0);

  }

  window.app = app;

}(window));

 new app();