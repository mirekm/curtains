(function() {

  /*
  Curtains v0.0.0
  Keyframe & event-driven, general purpose theatre in JavaScript.
  
  Released under MIT Licence.
  (C) 2011, Mirek Mencel mirek@mirumee.com | Mirumee Labs
  */

  var root,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };

  Array.prototype.sortBy = function(key) {
    var _this = this;
    return this.sort(function(a, b) {
      return a.key - b.key;
    });
  };

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

  this.module('curtains.utils', function() {
    this.Color = (function() {

      function Color() {}

      Color.hsv2rgb = function(h, s, v) {
        var b, f, g, i, p, q, r, t, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
        if (!s) {
          r = g = b = v;
          return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        h /= 60;
        i = Math.floor(h);
        f = h - i;
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));
        switch (i) {
          case 0:
            _ref = [v, t, p], r = _ref[0], g = _ref[1], b = _ref[2];
            break;
          case 1:
            _ref2 = [q, v, p], r = _ref2[0], g = _ref2[1], b = _ref2[2];
            break;
          case 2:
            _ref3 = [p, v, t], r = _ref3[0], g = _ref3[1], b = _ref3[2];
            break;
          case 3:
            _ref4 = [p, q, v], r = _ref4[0], g = _ref4[1], b = _ref4[2];
            break;
          case 4:
            _ref5 = [t, p, v], r = _ref5[0], g = _ref5[1], b = _ref5[2];
            break;
          default:
            _ref6 = [v, p, q], r = _ref6[0], g = _ref6[1], b = _ref6[2];
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      };

      return Color;

    })();
    this.ValueFactory = (function() {

      function ValueFactory() {}

      ValueFactory.parseUnitValue = function(raw) {
        var value;
        value = {
          value: raw.replace(/([a-zA-Z]+)/gi, ''),
          unit: (raw.match(/([a-zA-Z]+)/gi) || ['']).join('')
        };
        return value;
      };

      ValueFactory.getValue = function(raw, propName) {
        var color, complex, transform, val, value, _i, _len;
        if (propName == null) propName = '';
        if (isNaN(raw)) {
          if (typeof raw === 'string' && raw.length) {
            if (propName.indexOf('origin') < 0 && propName.indexOf('trans') >= 0) {
              transform = new curtains.utils.MatrixValue(raw);
              if (transform.ok) return transform;
            }
            if (raw.indexOf('rgb') === 0 || raw.indexOf('#') === 0) {
              color = new curtains.utils.ColorValue(raw);
              if (color.color && color.color.ok) return color;
            }
            raw = raw.split(/\s+/).filter(function(x) {
              return x.length;
            });
            if (raw.length > 1) {
              complex = [];
              for (_i = 0, _len = raw.length; _i < _len; _i++) {
                value = raw[_i];
                complex.push(curtains.utils.ValueFactory.getValue(value));
              }
              return new curtains.utils.ComplexValue(complex);
            } else {
              raw = raw[0];
              val = curtains.utils.ValueFactory.parseUnitValue(raw);
              if (!isNaN(val.value)) {
                return new curtains.utils.NumberValue(val.value, val.unit);
              }
            }
            return new curtains.utils.StringValue(raw);
          }
        } else {
          return new curtains.utils.NumberValue(raw);
        }
      };

      return ValueFactory;

    })();
    this.Value = (function() {

      function Value(raw) {
        this.raw = raw;
      }

      Value.prototype.tweenTo = function(time, duration, to, method) {
        throw "Not implemented.";
      };

      Value.prototype.render = function() {
        return this.raw;
      };

      return Value;

    })();
    this.NumberValue = (function() {

      __extends(NumberValue, this.Value);

      function NumberValue(value, unit) {
        this.unit = unit;
        this.val = Number(value);
      }

      NumberValue.prototype.render = function(toRender) {
        if (toRender == null) toRender = this.val;
        if (this.unit) {
          return "" + toRender + this.unit;
        } else {
          return toRender;
        }
      };

      NumberValue.prototype.tweenTo = function(time, duration, to, method) {
        return this.render(method(time, this.val, to.val - this.val, duration));
      };

      return NumberValue;

    }).call(this);
    this.ColorValue = (function() {

      __extends(ColorValue, this.Value);

      function ColorValue(raw) {
        ColorValue.__super__.constructor.call(this, raw);
        try {
          this.color = new RGBColor(raw);
        } catch (err) {
          console.log("Error: Cannot find RGBColor object.");
        }
      }

      ColorValue.prototype.render = function() {
        var _ref;
        return (_ref = this.color) != null ? _ref.toHex() : void 0;
      };

      ColorValue.prototype.tweenTo = function(time, duration, to, method) {
        var bDelta, color, gDelta, rDelta;
        if (this.color && to.color) {
          rDelta = to.color.r - this.color.r;
          gDelta = to.color.g - this.color.g;
          bDelta = to.color.b - this.color.b;
          color = new RGBColor('');
          color.r = Math.round(method(time, this.color.r, rDelta, duration));
          color.g = Math.round(method(time, this.color.g, gDelta, duration));
          color.b = Math.round(method(time, this.color.b, bDelta, duration));
          color.ok = true;
          return color.toHex();
        }
      };

      return ColorValue;

    }).call(this);
    this.StringValue = (function() {

      __extends(StringValue, this.Value);

      function StringValue(raw) {
        StringValue.__super__.constructor.call(this, raw);
      }

      return StringValue;

    }).call(this);
    this.ComplexValue = (function() {

      __extends(ComplexValue, this.Value);

      function ComplexValue(values) {
        this.values = values;
      }

      ComplexValue.prototype.render = function(toRender) {
        var item;
        if (toRender == null) toRender = this.values;
        return [
          (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = toRender.length; _i < _len; _i++) {
              item = toRender[_i];
              _results.push(item.render());
            }
            return _results;
          })()
        ].join(' ');
      };

      ComplexValue.prototype.tweenTo = function(time, duration, to, method) {
        var index, item, ret, _len, _ref;
        ret = [];
        _ref = this.values;
        for (index = 0, _len = _ref.length; index < _len; index++) {
          item = _ref[index];
          ret.push(item.tweenTo(time, duration, to.values[index], method));
        }
        return ret.join(' ');
      };

      return ComplexValue;

    }).call(this);
    return this.MatrixValue = (function() {

      __extends(MatrixValue, this.Value);

      function MatrixValue(raw) {
        var transform, val;
        this.ok = true;
        val = raw.match(/[-+]?[0-9]*\.?[0-9]+/gi);
        transform = raw.slice(0, 3);
        this.matrix = new curtains.geom.Matrix2D();
        this.rotation = 0;
        switch (transform) {
          case 'mat':
            this.matrix = new curtains.geom.Matrix2D([[Number(val[0]), Number(val[1])], [Number(val[2]), Number(val[3])]]);
            this.rotation = this.matrix.rotation;
            break;
          case 'rot':
            this.rotate(val[0]);
            break;
          case 'tra':
            this.translate = Number(val);
            break;
          case 'ske':
            this.skew = Number(val);
            break;
          case 'sca':
            this.scale = Number(val);
            break;
          case 'non':
            break;
          default:
            this.ok = false;
        }
      }

      MatrixValue.prototype.render = function(toRender) {
        if (toRender == null) toRender = this.matrix;
        return "matrix(" + (toRender.mat[0][0].toFixed(6)) + ",                           " + (toRender.mat[0][1].toFixed(6)) + ",                           " + (toRender.mat[1][0].toFixed(6)) + ",                           " + (toRender.mat[1][1].toFixed(6)) + ",                           " + (+toRender.tx) + "pt,                           " + (+toRender.ty) + "pt)";
      };

      MatrixValue.prototype.tweenTo = function(time, duration, to, method) {
        var interpolated, rotated;
        interpolated = method(time, this.rotation, to.rotation, duration);
        rotated = this.matrix.rotate(interpolated);
        return this.render(rotated);
      };

      MatrixValue.prototype.interpolateMatrix = function(time, duration, to, method) {
        var a, aDelta, b, bDelta, c, cDelta, d, dDelta, ret;
        aDelta = to.matrix.mat[0][0] - this.matrix.mat[0][0];
        bDelta = to.matrix.mat[0][1] - this.matrix.mat[0][1];
        cDelta = to.matrix.mat[1][0] - this.matrix.mat[1][0];
        dDelta = to.matrix.mat[1][1] - this.matrix.mat[1][1];
        a = method(time, this.matrix.mat[0][0], aDelta, duration);
        b = method(time, this.matrix.mat[0][1], bDelta, duration);
        c = method(time, this.matrix.mat[1][0], cDelta, duration);
        d = method(time, this.matrix.mat[1][1], dDelta, duration);
        ret = new curtains.geom.Matrix2D([[a, b], [c, d]]);
        return this.render(ret);
      };

      MatrixValue.prototype.rotate = function(deg) {
        if (deg == null) deg = this.rot;
        return this.rotation = curtains.geom.Utils.deg2rad(deg);
      };

      MatrixValue.prototype.translate = function(x, y) {
        this.matrix.tx = x;
        return this.matrix.ty = y;
      };

      MatrixValue.prototype.skew = function(x, y) {};

      MatrixValue.prototype.scale = function(x, y) {};

      return MatrixValue;

    }).call(this);
  });

  this.module('curtains', function() {
    this.EventDispatcher = (function() {

      function EventDispatcher() {
        this.listeners = {};
      }

      EventDispatcher.prototype.addListener = function(event, callback) {
        if (!(event in this.listeners)) this.listeners[event] = [];
        return this.listeners[event].push(callback);
      };

      EventDispatcher.prototype.removeListener = function(event, callback) {
        if (event in this.listeners) return this.listeners[event].remove(callback);
      };

      EventDispatcher.prototype.dispatchEvent = function(event) {
        var i, l, listeners, _len, _results;
        event = this.listeners[event];
        listeners = event ? event.slice(0, event.length) : [];
        _results = [];
        for (i = 0, _len = listeners.length; i < _len; i++) {
          l = listeners[i];
          _results.push(l != null ? l.apply(this, {
            event: event,
            sender: this
          }) : void 0);
        }
        return _results;
      };

      return EventDispatcher;

    })();
    this.Heart = (function() {

      __extends(Heart, this.EventDispatcher);

      function Heart(bps, autoStart) {
        this.bps = bps != null ? bps : 24;
        this.autoStart = autoStart != null ? autoStart : false;
        Heart.__super__.constructor.call(this);
        this.isBeating = false;
        this.tick = 1;
        console.log("Hurray, new heart created (autoStart=" + autoStart + ")");
        if (this.autoStart) this.startPumping();
      }

      Heart.prototype.startPumping = function() {
        var self,
          _this = this;
        if (!this.isBeating) {
          console.log('Start pumping...');
          self = this;
          this.cardiacMuscle = setInterval(function() {
            return self.beat();
          }, 1000 / this.bps);
          return this.isBeating = true;
        }
      };

      Heart.prototype.stopPumping = function() {
        console.log('Stop pumping...');
        clearInterval(this.cardiacMuscle);
        return this.isBeating = false;
      };

      Heart.prototype.beat = function() {
        this.dispatchEvent('beat');
        return this.tick++;
      };

      return Heart;

    }).call(this);
    this.Animation = (function() {

      __extends(Animation, this.EventDispatcher);

      Animation._objectId = 0;

      function Animation(totalFrames, name) {
        this.totalFrames = totalFrames != null ? totalFrames : 100;
        this.name = name;
        Animation.__super__.constructor.call(this);
        this.id = this._getNextId();
        this.currentFrame = 0;
        this.frames = [];
        this.actors = [];
        this.currentActors = [];
        this.parent = null;
        this.direction = 1;
      }

      Animation.prototype._getNextId = function() {
        return Animation._objectId++;
      };

      Animation.prototype.invalidateCrew = function(frameNum) {
        var actor, frame, frames, ret, _i, _j, _k, _len, _len2, _len3, _ref;
        if (frameNum == null) frameNum = this.currentFrame;
        ret = [];
        frames = this.actors.slice(0, frameNum + 1 || 9e9);
        for (frame in frames) {
          if (typeof frame !== 'array') continue;
          for (_i = 0, _len = frame.length; _i < _len; _i++) {
            actor = frame[_i];
            if ((actor.firstFrame <= frameNum && frameNum <= actor.getLastFrame())) {
              actor.stage(true);
              ret.push(actor);
            }
          }
        }
        _ref = this.actors.slice(frameNum + 1);
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          frame = _ref[_j];
          if (!frame) continue;
          for (_k = 0, _len3 = frame.length; _k < _len3; _k++) {
            actor = frame[_k];
            if (actor.isVisible) actor.stage(false);
          }
        }
        this.currentActors = ret;
        return this.isCrewDirty = false;
      };

      Animation.prototype.getLastFrame = function() {
        return this.firstFrame + this.totalFrames;
      };

      Animation.prototype._onEnterFrame = function() {
        var action, _i, _len, _ref;
        if (!this.onStage) return;
        if (this.isCrewDirty) this.invalidateCrew();
        _ref = this.frames[this.currentFrame] || [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          action = _ref[_i];
          action.apply();
        }
        return this.onEnterFrame(this.currentFrame);
      };

      Animation.prototype._onExitFrame = function() {};

      Animation.prototype._beat = function() {
        if (this.currentFrame) this.dispatchEvent('exitFrame');
        this.setCurrentFrame(this.currentFrame + this.direction);
        this.dispatchEvent('enterFrame');
        if (this.currentFrame >= this.totalFrames) return this.stop();
      };

      Animation.prototype._startListeners = function() {
        var _this = this;
        this._stopListeners();
        this.enterFrameCallback = function() {
          return _this._onEnterFrame();
        };
        this.addListener('enterFrame', this.enterFrameCallback);
        this.exitFrameCallback = function() {
          return _this._onExitFrame();
        };
        this.addListener('exitFrame', this.exitFrameCallback);
        this.beatCallback = function() {
          return _this._beat();
        };
        return this.heart.addListener('beat', this.beatCallback);
      };

      Animation.prototype._stopListeners = function() {
        this.removeListener('enterFrame', this.enterFrameCallback);
        this.removeListener('exitFrame', this.exitFrameCallback);
        if (this.heart) {
          return this.heart.removeListener('beat', this.beatCallback);
        }
      };

      Animation.prototype.onEnterFrame = function() {};

      Animation.prototype.onExitFrame = function() {};

      Animation.prototype.visible = function(isVisible) {};

      Animation.prototype.attachHeart = function(heart) {
        if (this.heart) this.heart.removeListener('beat', this.beatCallback);
        this.heart = heart;
        return this.dispatchEvent('heartAttach');
      };

      Animation.prototype.start = function(frameNum) {
        if (frameNum == null) frameNum = this.currentFrame;
        this.goto(frameNum);
        this._startListeners();
        this._beat();
        return this.dispatchEvent('start');
      };

      Animation.prototype.reverse = function() {
        this.direction *= -1;
        return this.dispatchEvent('reverse');
      };

      Animation.prototype.stop = function(frameNum) {
        this._stopListeners();
        this.dispatchEvent('stop');
        if (frameNum) return this.goto(frameNum);
      };

      Animation.prototype.goto = function(frameNum) {
        this.setCurrentFrame(frameNum);
        return this.isCrewDirty = true;
      };

      Animation.prototype.setCurrentFrame = function(frameNum) {
        return this.currentFrame = (this.totalFrames >= frameNum && frameNum >= 0) ? parseInt(frameNum) : 0;
      };

      Animation.prototype.addKeyframe = function(frameNum, callback) {
        if (!this.frames[frameNum]) this.frames[frameNum] = [];
        return this.frames[frameNum].push(callback);
      };

      Animation.prototype.stage = function(onStage) {
        this.onStage = onStage;
        if (!this.onStage) this.stop();
        return this.visible(this.onStage);
      };

      Animation.prototype.detach = function() {
        var _ref;
        this.stage(false);
        this.firstFrame = null;
        if ((_ref = this.parent) != null) _ref.removeFromStage(animation);
        return this.parent = null;
      };

      Animation.prototype.removeFromStage = function(animation) {
        var frame, _i, _len, _ref, _results;
        _ref = this.actors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          frame = _ref[_i];
          if (__indexOf.call(this.actors[frame], animation) >= 0) {
            _results.push(this.actors[frame].remove(animation));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Animation.prototype.dropOnStage = function(animation, frameNum, framesDuration) {
        var stageAction, unstageAction,
          _this = this;
        if (frameNum == null) frameNum = 1;
        if (framesDuration == null) framesDuration = 100;
        animation.detach();
        animation.firstFrame = frameNum;
        if (!this.actors[frameNum]) this.actors[frameNum] = [];
        this.actors[frameNum].push(animation);
        animation.parent = this;
        animation.attachHeart(this.heart);
        stageAction = function() {
          if (_this.direction > 0) {
            animation.stage(true);
            return animation.start();
          } else {
            animation.stage(false);
            return animation.stop(0);
          }
        };
        this.addKeyframe(frameNum, stageAction);
        unstageAction = function() {
          if (_this.direction > 0) {
            return animation.stage(false);
          } else {
            return animation.stage(true);
          }
        };
        return this.addKeyframe(frameNum + framesDuration, unstageAction);
      };

      Animation.prototype.tweenActor = function(actor, propName, propValue, fromFrame, toFrame, method) {
        var self, tweenCallback,
          _this = this;
        if (method == null) method = curtains.ease.Quad.inOut;
        if (!toFrame) toFrame = fromFrame;
        self = this;
        tweenCallback = null;
        this.addKeyframe(fromFrame, function() {
          var from, to;
          if (self.direction === -1) return;
          self.removeListener('enterFrame', tweenCallback);
          from = actor.get(propName);
          to = new curtains.utils.ValueFactory.getValue(propValue, propName);
          from.unit = to.unit;
          tweenCallback = function() {
            var allFrames, newVal, tweenFrame;
            tweenFrame = self.currentFrame - fromFrame;
            if (tweenFrame === -1) {
              self.removeListener('enterFrame', tweenCallback);
              return;
            }
            allFrames = toFrame - fromFrame;
            newVal = from.tweenTo(tweenFrame, allFrames, to, method);
            return actor.set(propName, newVal);
          };
          return self.addListener('enterFrame', tweenCallback);
        });
        return this.addKeyframe(toFrame + 1, function() {
          if (self.direction < 1) {
            return self.addListener('enterFrame', tweenCallback);
          } else {
            return self.removeListener('enterFrame', tweenCallback);
          }
        });
      };

      return Animation;

    }).call(this);
    this.Actor = (function() {

      __extends(Actor, this.Animation);

      function Actor(totalFrames, initialProperties, name) {
        this.initialProperties = initialProperties != null ? initialProperties : {};
        Actor.__super__.constructor.call(this, totalFrames, name);
      }

      Actor.prototype.stage = function(onStage) {
        Actor.__super__.stage.call(this, onStage);
        if (!onStage) {
          parent.detach;
          return this.reset();
        }
      };

      Actor.prototype.reset = function() {
        var prop, _results;
        _results = [];
        for (prop in this.initialProperties) {
          _results.push(this.set(prop, this.initialProperties[prop]));
        }
        return _results;
      };

      Actor.prototype.onEnterFrame = function() {
        return Actor.__super__.onEnterFrame.call(this);
      };

      Actor.prototype.set = function(propName, value) {
        return this.properties[propName] = value;
      };

      Actor.prototype.get = function(propName) {
        return this.properties[propName];
      };

      return Actor;

    }).call(this);
    this.Curtains = (function() {

      __extends(Curtains, this.Animation);

      function Curtains(fps, totalFrames, autoStart) {
        this.fps = fps != null ? fps : 24;
        this.autoStart = autoStart != null ? autoStart : false;
        Curtains.__super__.constructor.call(this, totalFrames, 'Curtains');
        this.attachHeart(new curtains.Heart(this.fps, this.autoStart));
        this.stage(true);
        console.log('Curtains up...');
      }

      Curtains.prototype.up = function() {
        if (!this.heart.isBeating) {
          this.start(this.currentFrame);
          return this.heart.startPumping();
        }
      };

      Curtains.prototype.down = function() {
        if (this.heart.isBeating) return this.heart.stopPumping();
      };

      return Curtains;

    }).call(this);
    return this.CssActor = (function() {

      __extends(CssActor, this.Actor);

      function CssActor(totalFrames, selector, overrideInitialProperties, name) {
        var prop, properties;
        this.selector = selector;
        if (overrideInitialProperties == null) overrideInitialProperties = {};
        CssActor.__super__.constructor.call(this, totalFrames, null, name);
        this.reattachChildren = true;
        this.html = this.getOrCreate(this.selector);
        properties = {
          opacity: this.get('opacity'),
          top: this.get('top'),
          left: this.get('left'),
          width: this.get('width'),
          height: this.get('height')
        };
        for (prop in overrideInitialProperties) {
          this.set(prop, overrideInitialProperties[prop]);
          properties[prop] = curtains.utils.ValueFactory.getValue(overrideInitialProperties[prop]);
        }
        this.initialProperties = properties;
      }

      CssActor.prototype.$ = function(selector) {
        return root.$(selector);
      };

      CssActor.prototype.getOrCreate = function(selector) {
        var html, _ref;
        if (selector) {
          return this.$(selector);
        } else {
          html = this.$("<div id=\"" + this.id + "\"</div>");
          if (this.reattachChildren) {
            if ((_ref = this.parent) != null) _ref.append(html);
          }
          return html;
        }
      };

      CssActor.prototype.get = function(propName) {
        var bl, br, matrixVal, raw, tl, tr;
        if (propName === 'border-radius') {
          tl = this.html.css('border-top-left-radius');
          tr = this.html.css('border-top-right-radius');
          br = this.html.css('border-bottom-right-radius');
          bl = this.html.css('border-bottom-left-radius');
          raw = [tl, tr, br, bl].join(' ');
        } else {
          if (propName.indexOf('trans') >= 0 && propName.indexOf('origin') < 0) {
            raw = this.html.css('-moz-transform') || this.html.css('-webkit-transform') || this.html.css('-o-transform') || this.html.css('-ms-transform');
            matrixVal = curtains.utils.ValueFactory.getValue(raw, propName);
            return matrixVal;
          } else {
            raw = this.html.css(propName);
          }
        }
        return curtains.utils.ValueFactory.getValue(raw, propName);
      };

      CssActor.prototype.set = function(propName, value) {
        if (propName.indexOf('origin') >= 0) {
          this.html.css('-moz-transform-origin', value);
          this.html.css('-webkit-transform-origin', value);
          this.html.css('-o-transform-origin', value);
          return this.html.css('-ms-transform-origin', value);
        } else if (propName.indexOf('trans') >= 0) {
          this.html.css('-moz-transform', value);
          this.html.css('-webkit-transform', value);
          this.html.css('-o-transform', value);
          return this.html.css('-ms-transform', value);
        } else {
          return this.html.css(propName, value);
        }
      };

      CssActor.prototype.visible = function(isVisible) {
        var visibility;
        visibility = 'none';
        if (isVisible) visibility = 'block';
        return this.html.css('display', visibility);
      };

      CssActor.prototype.dropOnStage = function(animation, frameNum, framesDuration) {
        if (frameNum == null) frameNum = 1;
        if (framesDuration == null) framesDuration = 100;
        CssActor.__super__.dropOnStage.call(this, animation, frameNum, framesDuration);
        if (this.reattachChildren) {
          this.html.append(animation.html);
          this.html.css('position', 'relative');
          return animation.html.css('position', 'absolute');
        }
      };

      return CssActor;

    }).call(this);
  });

}).call(this);
