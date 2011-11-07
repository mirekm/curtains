root = exports ? @

test = () ->
    theatre = new curtains.Curtains 24, 100
    root.theatre = theatre

    actor01 = new curtains.CssActor 'Actor01', 100, {opacity: 0}, '#actor1'
    actor01.tweenProperty 'top', 1, 100, 100
    actor01.tweenProperty 'opacity', 1, 100, 1
    theatre.dropOnStage actor01, 1, 100

    actor02 = new curtains.CssActor 'Actor02', 50, {}, '#actor2'
    actor02.tweenProperty 'left', 1, 50, 100
    actor02.tweenProperty 'width', 25, 50, 40
    actor02.tweenProperty 'height', 25, 50, 40
    theatre.dropOnStage actor02, 50, 100

    actor03 = new curtains.CssActor 'Actor03', 50, {}, '#actor3'
    actor03.tweenProperty 'left', 1, 50, 100
    actor03.tweenProperty 'top', 1, 50, 100
    actor03.tweenProperty 'opacity', 1, 50, 1
    actor03.addKeyframe 50, () =>
        actor03.reverse()
        actor03.start()
        unless root.addOnlyOnce
            root.addOnlyOnce = () =>
                actor03.reverse()
            actor03.addKeyframe 10, root.addOnlyOnce
    theatre.dropOnStage actor03, 50, 100

    actor03_child = new curtains.CssActor 'Actor03 Decor', 25, {left: 0}, '#actor3_decor'
    actor03_child.tweenProperty 'left', 1, 25, 50
    actor03.dropOnStage actor03_child, 25, 50

    theatre.up()

if root.$
    root.$ ->
        test()
else
    test()

# Terminate the show
# setTimeout(() =>
#    theatre.down()
#, 10000)
