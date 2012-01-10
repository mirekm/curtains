root = exports ? @

xrandom = (to) ->
    Math.floor(Math.random()*(to+1))


theatre = new curtains.Curtains 24, 1
root.theatre = theatre
stage = new curtains.CssActor 300, '#stage'
theatre.dropOnStage stage, 1, 1


animateFlower = (frame=1, x=50, y=50) ->
    initialProps =
        opacity: 0
    originX = frame/25 + xrandom(190)
    originY = frame/25 + xrandom(190)
    leafNum = 3 + xrandom(8)
    w = 20 + xrandom(20)
    rotDir = if xrandom(1)%2 then -1 else 1
    border = w / 2 + xrandom(w)
    initRadius = xrandom(20)
    for i in [0..leafNum-1]
        hue = Math.random()*255
        initialProps.top = y + xrandom(10)
        initialProps.left = x + xrandom(10)
        initialProps.width = xrandom(10)
        initialProps.height = xrandom(10)
        initialProps['border-radius'] = initRadius
        c = curtains.utils.Color.hsv2rgb(hue, 0.5 + Math.random(), 1)
        initialProps['background-color'] = "rgb(#{c[0]}, #{c[1]}, #{c[2]})"
        leaf = new curtains.CssActor 1, null, initialProps, i
        from = frame
        to = frame + 50
        stage.dropOnStage leaf, frame
        stage.tweenActor leaf, 'left', x - originX, from, to
        stage.tweenActor leaf,'top', y - originY, from, to
        stage.tweenActor leaf, 'width', w, from, to
        stage.tweenActor leaf, 'height', w, from, to
        if rotDir > 0
            stage.tweenActor leaf, 'border-radius', "#{border} 0 #{border} 0", from, to
        else
            stage.tweenActor leaf, 'border-radius', "#{border} 0 #{border} 0", from, to
        stage.tweenActor leaf, 'transform', "rotate(#{rotDir*i*360/leafNum}deg)", from, to
        stage.tweenActor leaf, 'opacity', 0.6, from, to
        leaf.set 'origin', "#{originX}px #{originY}px"

test = () ->
    for frame in [0..4]
        animateFlower(frame*(15+xrandom(10)) + 1,
                      $(document).width() / 2,
                      $(document).height() / 2,
                      50)
    callback = () =>
        stage.reverse()
        stage.start()
        unless root.reverseLoop
            root.reverseLoop = () =>
                stage.reverse()
            stage.addKeyframe 1, root.reverseLoop
    stage.addKeyframe 150, callback

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

