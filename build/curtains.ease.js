(function() {
  var root;

  this.module = function(names, fn) {
    var space, _name;
    if (typeof names === 'string') names = names.split('.');
    space = this[_name = names.shift()] || (this[_name] = {});
    space.module || (space.module = this.module);
    if (names.length) {
      return space.module(names, fn);
    } else {
      return fn.call(space);
    }
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  this.module('curtains.ease', function() {
    this.Linear = (function() {

      function Linear() {}

      Linear["in"] = function(t, b, c, d) {
        return b + c * t / d;
      };

      Linear.out = function(t, b, c, d) {
        return ease.Linear["in"](t, b, c, d);
      };

      Linear.inOut = function(t, b, c, d) {
        return ease.Linear["in"](t, b, c, d);
      };

      return Linear;

    })();
    this.Quad = (function() {

      function Quad() {}

      Quad["in"] = function(t, b, c, d) {
        return b + c * (t /= d) * t;
      };

      Quad.out = function(t, b, c, d) {
        return b - c * (t /= d) * (t - 2);
      };

      Quad.inOut = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
          return b + c / 2 * t * t;
        } else {
          return b - c / 2 * ((--t) * (t - 2) - 1);
        }
      };

      return Quad;

    })();
    this.Cubic = (function() {

      function Cubic() {}

      Cubic["in"] = function(t, b, c, d) {
        return b + c * Math.pow(t / d, 3);
      };

      Cubic.out = function(t, b, c, d) {
        return b + c * (Math.pow(t / d - 1, 3) + 1);
      };

      Cubic.inOut = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
          return b + c / 2 * Math.pow(t, 3);
        } else {
          return b + c / 2 * (Math.pow(t - 2, 3) + 2);
        }
      };

      return Cubic;

    })();
    this.Sine = (function() {

      function Sine() {}

      Sine["in"] = function(t, b, c, d) {
        return b + c * (1 - Math.cos(t / d * (Math.PI / 2)));
      };

      Sine.out = function(t, b, c, d) {
        return b + c * Math.sin(t / d * (Math.PI / 2));
      };

      Sine.inOut = function(t, b, c, d) {
        return b + c / 2 * (1 - Math.cos(Math.PI * t / d));
      };

      return Sine;

    })();
    this.Circ = (function() {

      function Circ() {}

      Circ["in"] = function(t, b, c, d) {
        return b + c * (1 - Math.sqrt(1 - (t /= d) * t));
      };

      Circ.out = function(t, b, c, d) {
        return b + c * Math.sqrt(1 - (t = t / d - 1) * t);
      };

      Circ.inOut = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
          return b + c / 2 * (1 - Math.sqrt(1 - t * t));
        } else {
          return b + c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }
      };

      return Circ;

    })();
    return this.Expo = (function() {

      function Expo() {}

      Expo["in"] = function(t, b, c, d) {
        return b + c * Math.pow(2, 10 * (t / d - 1));
      };

      Expo.out = function(t, b, c, d) {
        return b + c * (-Math.pow(2, -10 * t / d) + 1);
      };

      Expo.inOut = function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
          return b + c / 2 * Math.pow(2, 10 * (t - 1));
        } else {
          return b + c / 2 * (-Math.pow(2, -10 * --t) + 2);
        }
      };

      return Expo;

    })();
  });

}).call(this);
