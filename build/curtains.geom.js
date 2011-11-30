(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

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

  Array.prototype.compare = function(to) {
    var e, index, _len;
    for (index = 0, _len = this.length; index < _len; index++) {
      e = this[index];
      if (e.compare) {
        if (!e.compare(to[index])) return false;
      } else {
        if (e !== to[index]) return false;
      }
    }
    return true;
  };

  this.module('curtains.geom', function() {
    this.Utils = (function() {

      function Utils() {}

      Utils.deg2rad = function(angle) {
        return (angle / 180) * Math.PI;
      };

      Utils.rad2deg = function(angle) {
        return angle * 180 / Math.PI;
      };

      Utils.DEG_TO_RAD = Math.PI / 180;

      return Utils;

    })();
    return this.Matrix2D = (function() {

      Matrix2D.identity2x2 = function() {
        return [[1, 0], [0, 1]];
      };

      function Matrix2D(mat) {
        var _ref;
        this.mat = mat != null ? mat : curtains.geom.Matrix2D.identity2x2();
        this.height = this.mat.length;
        this.width = (_ref = this.mat) != null ? _ref[0].length : void 0;
        this.w = this.width - 1;
        this.h = this.height - 1;
        this.decompose();
      }

      Matrix2D.prototype.calculateRotation = function() {
        return Math.atan(this.mat[1][0] / this.mat[1][1]);
      };

      Matrix2D.prototype.decompose = function() {
        var a, b, c, d, rot, skewX, skewY;
        a = this.mat[0][0];
        b = this.mat[0][1];
        c = this.mat[1][0];
        d = this.mat[1][1];
        this.scaleX = Math.sqrt(a * a + b * b);
        this.scaleY = Math.sqrt(c * c + d * b);
        skewX = Math.atan2(-c, d);
        skewY = Math.atan2(b, a);
        if (skewX === skewY) {
          rot = skewY / curtains.geom.Utils.DEG_TO_RAD;
          this.rotation = curtains.geom.Utils.deg2rad(rot);
          if (a < 0 && d >= 0) {
            this.rotation += this.rotation <= 0 ? Math.PI : -Math.PI;
          }
          return this.skewX = this.skewY = 0;
        } else {
          this.skewX = skewX / curtains.geom.Utils.DEG_TO_RAD;
          return this.skewY = skewY / curtains.geom.Utils.DEG_TO_RAD;
        }
      };

      Matrix2D.prototype.rotationInDegrees = function() {
        return curtains.geom.Utils.rad2deg(this.rotation);
      };

      Matrix2D.prototype.multiply = function(mulBy) {
        var i, j, k, ret, sum, _ref, _ref2, _ref3;
        if (this.width !== mulBy.height) {
          throw "Cannot multiply matrices: incompatible dimensions.";
        }
        ret = [];
        for (i = 0, _ref = this.h; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          ret[i] = [];
          for (j = 0, _ref2 = mulBy.w; 0 <= _ref2 ? j <= _ref2 : j >= _ref2; 0 <= _ref2 ? j++ : j--) {
            sum = 0;
            for (k = 0, _ref3 = this.w; 0 <= _ref3 ? k <= _ref3 : k >= _ref3; 0 <= _ref3 ? k++ : k--) {
              sum += this.mat[i][k] * mulBy.mat[k][j];
            }
            ret[i][j] = sum;
          }
        }
        return new curtains.geom.Matrix2D(ret);
      };

      Matrix2D.prototype.compare = function(matrix) {
        return this.mat.compare(matrix.mat);
      };

      Matrix2D.prototype.rotate = function(angle, inDegrees) {
        var a1, c1, cos, na, nb, nc, nd, sin;
        if (inDegrees) angle = curtains.geom.Utils.deg2rad(angle);
        sin = Math.sin(angle);
        cos = Math.cos(angle);
        a1 = this.mat[0][0];
        c1 = this.mat[1][0];
        na = a1 * cos - this.mat[0][1] * sin;
        nb = a1 * sin + this.mat[0][1] * cos;
        nc = c1 * cos - this.mat[1][1] * sin;
        nd = c1 * sin + this.mat[1][1] * cos;
        return this.multiply(new curtains.geom.Matrix2D([[na, nb], [nc, nd]]));
      };

      return Matrix2D;

    })();
  });

}).call(this);
