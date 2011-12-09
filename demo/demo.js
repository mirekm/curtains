(function() {
  var root, test;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  test = function() {
    var actor, better, build, mirumee, theatre, we, webapps,
      _this = this;
    theatre = new curtains.Curtains(24, 100);
    root.theatre = theatre;
    actor = new curtains.CssActor(1, '#actor2', {
      'border-radius': 0
    });
    theatre.dropOnStage(actor, 1, 100);
    theatre.tweenActor(actor, 'left', 100, 40, 100);
    theatre.tweenActor(actor, 'background-color', "#FFFF00", 1, 70);
    theatre.tweenActor(actor, 'transform', "rotate(90deg)", 30, 70);
    theatre.tweenActor(actor, 'border-radius', "20px 0 20 0", 40, 70);
    mirumee = new curtains.CssActor(20, '#actor3');
    theatre.dropOnStage(mirumee, 20, 100);
    theatre.tweenActor(mirumee, 'left', 100, 40, 100);
    theatre.tweenActor(mirumee, 'top', 100, 20, 100);
    theatre.tweenActor(mirumee, 'opacity', 1, 1, 80);
    we = new curtains.CssActor(1, '#actor3_we', {
      left: 25
    }, 'Actor03 We');
    mirumee.dropOnStage(we, 1, 20);
    mirumee.tweenActor(we, 'left', 0, 1, 20);
    build = new curtains.CssActor(1, '#actor3_build', {
      left: 50
    }, 'Actor03 Build');
    mirumee.dropOnStage(build, 1, 20);
    mirumee.tweenActor(build, 'left', 32, 1, 20);
    webapps = new curtains.CssActor(1, '#actor3_webapps', {
      left: 75
    }, 'Actor03 WebApps');
    mirumee.dropOnStage(webapps, 1, 20);
    mirumee.tweenActor(webapps, 'left', 85, 1, 20);
    better = new curtains.CssActor(1, '#actor3_better', {
      left: 200
    }, 'Actor03 Better');
    mirumee.dropOnStage(better, 1, 20);
    mirumee.tweenActor(better, 'left', 175, 1, 20);
    theatre.addKeyframe(100, function() {
      if (!root.addOnlyOnce) {
        root.addOnlyOnce = function() {
          return theatre.reverse();
        };
        theatre.addKeyframe(40, root.addOnlyOnce);
      }
      theatre.reverse();
      return theatre.start();
    });
    return theatre.up();
  };

  if (root.$) {
    root.$(function() {
      return test();
    });
  } else {
    test();
  }

}).call(this);
