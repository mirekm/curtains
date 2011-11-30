(function() {
  var root, test;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  test = function() {
    var actor01, actor02, actor03, actor03_child, theatre,
      _this = this;
    theatre = new curtains.Curtains(24, 100);
    root.theatre = theatre;
    actor01 = new curtains.CssActor(100, '#actor1', {
      opacity: 0
    }, 'Actor01');
    actor01.tweenProperty('top', 1, 100, '3em');
    actor01.tweenProperty('opacity', 1, 100, 1);
    actor01.tweenProperty('background-color', 50, 100, "#FFFF00");
    theatre.dropOnStage(actor01, 1, 100);
    actor02 = new curtains.CssActor(70, '#actor2', {
      'border-radius': 0
    });
    actor02.tweenProperty('left', 1, 70, 100);
    actor02.tweenProperty('background-color', 1, 35, "#FFFF00");
    actor02.tweenProperty('background-color', 35, 70, "#00FFFF");
    actor02.tweenProperty('-moz-transform', 1, 25, "rotate(45deg)");
    actor02.tweenProperty('height', 25, 45, 40);
    actor02.tweenProperty('width', 25, 45, 40);
    actor02.tweenProperty('border-radius', 45, 70, "20px 0 20 0");
    actor02.tweenProperty('-moz-transform', 45, 70, "rotate(45deg)");
    theatre.dropOnStage(actor02, 30, 100);
    actor03 = new curtains.CssActor(50, '#actor3');
    actor03.tweenProperty('left', 1, 50, 100);
    actor03.tweenProperty('top', 1, 50, 100);
    actor03.tweenProperty('opacity', 1, 50, 1);
    actor03.addKeyframe(50, function() {
      actor03.reverse();
      actor03.start();
      if (!root.addOnlyOnce) {
        root.addOnlyOnce = function() {
          return actor03.reverse();
        };
        return actor03.addKeyframe(10, root.addOnlyOnce);
      }
    });
    theatre.dropOnStage(actor03, 50, 100);
    actor03_child = new curtains.CssActor(5, '#actor3_we', {
      left: 25
    }, 'Actor03 We');
    actor03_child.tweenProperty('left', 1, 5, 0);
    actor03.dropOnStage(actor03_child, 25, 50);
    actor03_child = new curtains.CssActor(5, '#actor3_build', {
      left: 50
    }, 'Actor03 Build');
    actor03_child.tweenProperty('left', 1, 5, 32);
    actor03.dropOnStage(actor03_child, 30, 50);
    actor03_child = new curtains.CssActor(5, '#actor3_webapps', {
      left: 75
    }, 'Actor03 WebApps');
    actor03_child.tweenProperty('left', 1, 5, 85);
    actor03.dropOnStage(actor03_child, 35, 50);
    actor03_child = new curtains.CssActor(5, '#actor3_better', {
      left: 200
    }, 'Actor03 Better');
    actor03_child.tweenProperty('left', 1, 5, 175);
    actor03.dropOnStage(actor03_child, 40, 50);
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
