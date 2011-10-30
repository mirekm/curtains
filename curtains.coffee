###
Curtains v0.0.1
Keyframe based & event-driven general purpose theatre in JavaScript.

Released under MIT Licence.
(C) 2011. Mirek Mencel mirek@mirumee.com | Mirumee Labs.
###

Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1
Array::sortBy = (key) -> @sort (a, b) =>
    a.key - b.key

root = exports ? @

class EventDispatcher
    constructor: () ->
        @listeners = {}
    addListener: (event, callback) ->
        unless event of @listeners
            @listeners[event] = []
        @listeners[event].push callback
    removeListener: (event, callback) ->
        if event of @listeners
            @listeners[event].remove callback
    dispatchEvent: (event) ->
        listeners = @listeners[event] or []
        for l, i in listeners
            l?.apply {event: event, sender: @}


class Heart extends EventDispatcher
    bps: 24
    isBeating: false
    tick: 1
    constructor: (@bps, @autoStart=false) ->
        super()
        console.log "Hurray, new heart created (autoStart=#{autoStart})"
        if @autoStart then @startPumping()
    startPumping: () ->
        unless @isBeating
            console.log 'Start pumping...'
            self = @
            @cardiacMuscle = setInterval () =>
                self.beat()
            , 1000/@bps
            @isBeating = true
    stopPumping: () ->
        console.log 'Stop pumping...'
        clearInterval @cardiacMuscle
        @isBeating = false
    beat: ->
        console.log "8<------------------------ Entering tick #{@tick}"
        @dispatchEvent 'beat'
        @tick++


class Animation extends EventDispatcher
    @_objectId = 0
    constructor: (@name, @totalFrames=100) ->
        @currentFrame = 0
        @currentAnimations = []
        @frames = []
        @repeat = false
        @id = @_getNextObjectId()
        @_objects = []

        console.log "Animation #{@name}, id: #{@id} up..."
        super()
    _getNextObjectId: () ->
        Animation._objectId++
    _onEnterFrame: () ->
        for action in (@frames[@currentFrame] or [])
            action.apply()
        @onEnterFrame(@currentFrame)
        if @currentFrame == @totalFrames
            if @repeat
                @goto(1)
            else
                @stop()
    _onExitFrame: () ->
    _beat: () ->
        if @currentFrame
            @dispatchEvent 'exitFrame'
        @currentFrame++
        @dispatchEvent 'enterFrame'
    _startListeners: () ->
        @_stopListeners()
        @enterFrameCallback = () => @_onEnterFrame()
        @addListener 'enterFrame', @enterFrameCallback
        @exitFrameCallback = () => @_onExitFrame()
        @addListener 'exitFrame', @exitFrameCallback
        @beatCallback = () => @_beat()
        @heart.addListener 'beat', @beatCallback
    _stopListeners: () ->
        @removeListener 'enterFrame', @enterFrameCallback
        @removeListener 'exitFrame', @exitFrameCallback
        if @heart then @heart.removeListener 'beat', @beatCallback
    onEnterFrame: () ->
        #ABSTRACT
    onExitFrame: () ->
        #ABSTRACT
    attachHeart: (heart) ->
        if @heart then @heart.removeListener 'beat', @beatCallback
        @heart = heart
    reset: () ->
        stop(1)
    start: (frameNum=1) ->
        @goto(frameNum)
        @_startListeners()
        @_beat()
    stop: (frameNum) ->
        @_stopListeners()
        if frameNum then @goto frameNum
    goto: (frameNum) ->
        @currentFrame = frameNum
    invalidate: () ->
        ###
        It invalidate visibility state of all objects on a timeline
        ###
        for obj in @_objects
           obj.visible(obj.firstFrame <= @currentFrame <= (obj.firstFrame+obj.totalFrames))
    dispose: () ->
        @stop()
        @attachHeart(null)
    addKeyframe: (frameNum, callback) ->
        console.log "Adding keyframe to #{@name} at #{frameNum}"
        unless @frames[frameNum]
            @frames[frameNum] = []
        @frames[frameNum].push callback
    dropOnStage: (animation, frameNum=1, framesDuration=10000) ->
        ###
        Convenience method creating 2 keyframes: one reveling new animatoin on
        the timeline, the second removing it from it once the framesDuration
        is satisfied.
        ###
        self = @
        animation.firstFrame = frameNum
        addAction = () =>
            unless animation in self._objects
                console.log "Adding child #{animation.name} to #{@name} on frame #{frameNum}"
                animation.attachHeart @heart
                self._objects.push(animation)
            animation.visible true
            animation.start(@currentFrame - frameNum)
        @addKeyframe frameNum, addAction
        disposeAction = () =>
            animation.stop()
            animation.visible false
            #animation.dispose()
        @addKeyframe frameNum+framesDuration+1, disposeAction


class Actor extends Animation
    constructor: (@name, @totalFrames, @initialProperties={}) ->
        super @name, @totalFrames
        for prop of @initialProperties
            if prop of @properties
                @properties[prop] = @initialProperties[prop]
    tweenProperty: (propName, fromFrame, toFrame, toValue) ->
        self = @
        tweenCallback = null
        console.log "Creating tween #{propName} #{fromFrame}-#{toFrame}"
        @addKeyframe fromFrame, () =>
            console.log "Starting tween on #{@name}"
            tweenCallback = () =>
                self.tween(propName, toFrame, toValue)
            self.addListener 'enterFrame', tweenCallback
        @addKeyframe toFrame+1, () =>
            self.removeListener 'enterFrame', tweenCallback
    tween: (propName, toFrame, toValue) ->
        framesDelta = 1 + toFrame - @currentFrame
        valueDelta = toValue - @properties[propName]
        step = valueDelta / framesDelta
        @set(propName, @get(propName) + step)
    onEnterFrame: () ->
        super
    set: (propName, value) ->
        @properties[propName] = value
    get: (propName) ->
        @properties[propName]


class Curtains extends Animation
    constructor: (@fps=24, @totalFrames, @autoStart=false) ->
        @attachHeart new Heart @fps, @autoStart
        console.log 'Curtains up...'
        super 'Curtains', @totalFrames
    up: () ->
        unless @heart.isBeating
            @start(@currentFrame)
            @heart.startPumping()
    down: () ->
        if @heart.isBeating
            @heart.stopPumping()


class Actor2D extends Actor
    constructor: (@name, @totalFirames, @initialProperties={}, @selector) ->
        @properties =
            opacity: 0
            top: 0
            left: 0
            width: 20
            height: 20
        super @name, @totalFrames, @initialProperties
    set: (propName, value) ->
        super propName, value
        if root.$
            root.$(@selector).css(propName, value)
    visible: (isVisible) ->
        v = 'none'
        if isVisible then v = 'block'
        if root.$
            root.$(@selector).css('display', v)


test = () ->
    theatre = new Curtains 24, 100
    root.theatre = theatre
    actor01 = new Actor2D 'Actor01', 100, {}, '#actor1'
    actor01.tweenProperty('top', 1, 100, 100)
    theatre.dropOnStage actor01, 1, 100

    actor02 = new Actor2D 'Actor02', 10, {}, '#actor2'
    actor02.tweenProperty('left', 1, 1+theatre.fps*1, 50)
    actor02.tweenProperty('width', 12, 1+theatre.fps*1, 20)
    actor02.tweenProperty('height', 12, 1+theatre.fps*1, 20)
    theatre.dropOnStage actor02, 50, 100

    actor03 = new Actor2D 'Actor03', 10, {}, '#actor3'
    actor03.tweenProperty('left', 12, 1+theatre.fps*1, 100)
    actor03.tweenProperty('top', 12, 1+theatre.fps*1, 100)
    actor03.tweenProperty('opacity', 1, 1+theatre.fps*1, 1)
    theatre.dropOnStage actor03, 10, 100

    theatre.up()

test()

# Terminate the show
#setTimeout(() =>
#    theatre.down()
#, 10000)
