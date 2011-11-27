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

  this.module('ease', function() {
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

  this.module('curtains.utils', function() {
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

      ValueFactory.getValue = function(raw) {
        var color, complex, val, value, _i, _len;
        if (isNaN(raw)) {
          if (typeof raw === 'string' && raw.length) {
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
    return this.ComplexValue = (function() {

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
        listeners = this.listeners[event] || [];
        _results = [];
        for (i = 0, _len = listeners.length; i < _len; i++) {
          l = listeners[i];
          _results.push(l != null ? l.apply({
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
        console.log("Invalidating crew...");
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
        return this._beat();
      };

      Animation.prototype.reverse = function() {
        this.direction *= -1;
        return console.log("" + this.id + ": Reversing direction " + this.direction);
      };

      Animation.prototype.stop = function(frameNum) {
        this._stopListeners();
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
        console.log("Adding keyframe to " + this.name + " at " + frameNum);
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
        console.log("Adding child " + animation.name + " to " + this.name + " on frame " + frameNum);
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
        return this.addKeyframe(frameNum + framesDuration + 1, unstageAction);
      };

      return Animation;

    }).call(this);
    this.Actor = (function() {

      __extends(Actor, this.Animation);

      function Actor(totalFrames, initialProperties, name) {
        this.initialProperties = initialProperties != null ? initialProperties : {};
        Actor.__super__.constructor.call(this, totalFrames, name);
      }

      Actor.prototype.tweenProperty = function(propName, fromFrame, toFrame, toValue) {
        var self, tweenCallback,
          _this = this;
        self = this;
        tweenCallback = null;
        console.log("Creating tween " + propName + " " + fromFrame + "-" + toFrame);
        this.addKeyframe(fromFrame, function() {
          var from, to;
          console.log("Starting tween on " + _this.name + " / " + propName);
          self.removeListener('enterFrame', tweenCallback);
          from = _this.get(propName);
          to = new curtains.utils.ValueFactory.getValue(toValue);
          from.unit = to.unit;
          tweenCallback = function() {
            return self.tween(propName, fromFrame, toFrame, from, to);
          };
          return self.addListener('enterFrame', tweenCallback);
        });
        return this.addKeyframe(toFrame + 1, function() {
          return self.removeListener('enterFrame', tweenCallback);
        });
      };

      Actor.prototype.tween = function(propName, fromFrame, toFrame, fromValue, toValue, method) {
        var allFrames, newVal, tweenFrame;
        if (method == null) method = ease.Quad.inOut;
        allFrames = toFrame - fromFrame;
        tweenFrame = this.currentFrame - fromFrame;
        newVal = fromValue.tweenTo(tweenFrame, allFrames, toValue, method);
        return this.set(propName, newVal);
      };

      Actor.prototype.stage = function(onStage) {
        Actor.__super__.stage.call(this, onStage);
        if (!onStage) return this.reset();
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
        var bl, br, raw, tl, tr;
        switch (propName) {
          case 'border-radius':
            tl = this.html.css('border-top-left-radius');
            tr = this.html.css('border-top-right-radius');
            br = this.html.css('border-bottom-right-radius');
            bl = this.html.css('border-bottom-left-radius');
            raw = [tl, tr, br, bl].join(' ');
            break;
          default:
            raw = this.html.css(propName);
        }
        return curtains.utils.ValueFactory.getValue(raw);
      };

      CssActor.prototype.set = function(propName, value) {
        return this.html.css(propName, value);
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
