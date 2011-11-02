###
Curtains v0.0.0
Key-frame based & event-driven, general purpose theatre in JavaScript.

Released under MIT Licence.
(C) 2011, Mirek Mencel mirek@mirumee.com | Mirumee Labs
###

Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1
Array::sortBy = (key) -> @sort (a, b) =>
    a.key - b.key

@module = (names, fn) ->
    names = names.split '.' if typeof names is 'string'
    space = @[names.shift()] ||= {}
    space.module ||= @module
    if names.length
        space.module names, fn
    else
        fn.call space

root = exports ? @

@module 'curtains', ->
    class @EventDispatcher
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


    class @Heart extends @EventDispatcher
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
            @dispatchEvent 'beat'
            @tick++


    class @Animation extends @EventDispatcher
        @_objectId = 0
        constructor: (@name, @totalFrames=100) ->
            @id = @_getNextId()
            @currentFrame = 0
            @frames = [] # Keyframes
            @actors = [] # Animations
            @currentActors = [] # Current frame animations
            @parent = null
            @direction = 1
            console.log "Animation #{@name}, id: #{@id} up..."
            super()
        _getNextId: () ->
            Animation._objectId++
        invalidateCrew: (frameNum = @currentFrame) ->
            console.log "Invalidating crew..."
            # TODO: Re-think the sparse array implementation options here
            ret = []
            frames = @actors[0..frameNum]
            for frame of frames
                unless typeof(frame) is 'array' then continue
                for actor in frame
                    if actor.firstFrame <= frameNum <= actor.getLastFrame()
                        actor.stage on
                        ret.push(actor)
            for frame in @actors[(frameNum+1)...]
                unless frame then continue
                for actor in frame
                    if actor.isVisible
                        actor.stage off
            @currentActors = ret
            @isCrewDirty = false
        getLastFrame: () ->
            @firstFrame + @totalFrames
        _onEnterFrame: () ->
            unless @onStage then return
            if @isCrewDirty
                # Set up the new crew - only actors playing in this particular frame
                # should be on the stage (revalidation necessary after jump)
                @invalidateCrew()
            # Call all the key-frame actions
            for action in (@frames[@currentFrame] or [])
                action.apply()
            #console.log "#{@name} in #{@currentFrame}"
            @onEnterFrame(@currentFrame)
        _onExitFrame: () ->
        _beat: () ->
            if @currentFrame
                @dispatchEvent 'exitFrame'
            @setCurrentFrame @currentFrame + @direction
            @dispatchEvent 'enterFrame'
            #console.log "#{@name}: #{@currentFrame} of #{@totalFrames}"
            if @currentFrame >= @totalFrames
                @stop()
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
        # This is where you move your stuff around if you're too lazy to get
        # yourself a proper 'enterFrame' callback
        onEnterFrame: () ->
            #ABSTRACT
        # Some additional 'set-up' in between the scenes
        onExitFrame: () ->
            #ABSTRACT
        #
        visible: (isVisible) ->
            #ABSTRACT
        # It's alive!
        attachHeart: (heart) ->
            if @heart then @heart.removeListener 'beat', @beatCallback
            @heart = heart
        # Go get'em Danny!
        start: (frameNum = @currentFrame) ->
            @goto(frameNum)
            @_startListeners()
            @_beat()
        reverse: () ->
            @direction *= -1
            console.log "#{@name}: Reversing direction #{@direction}"
        # - It's over Johnny. It's over.
        stop: (frameNum) ->
            @_stopListeners()
            if frameNum then @goto frameNum
        # Jumping from one frame to another within a script requires veryfication of a crew.
        # Some actors may have to leave the stage and the other may need to appear.
        # It cannot be handled by regular 'stage on/off' callbacks added by
        # dropOnStage.
        goto: (frameNum) ->
            @setCurrentFrame frameNum
            @isCrewDirty = true
        setCurrentFrame: (frameNum) ->
            @currentFrame = if @totalFrames >= frameNum >= 0 then parseInt frameNum else 0
        addKeyframe: (frameNum, callback) ->
            console.log "Adding keyframe to #{@name} at #{frameNum}"
            unless @frames[frameNum]
                @frames[frameNum] = []
            @frames[frameNum].push callback
        stage: (@onStage) ->
            console.log "#{@name} is on strage: #{@onStage}"
            unless @onStage then @stop()
            @visible @onStage
        detach: () ->
            @stage off
            @firstFrame = null
            @parent?.removeFromStage animation
            @parent = null
        removeFromStage: (animation) ->
            for frame in @actors
                if animation in @actors[frame]
                    @actors[frame].remove animation
        dropOnStage: (animation, frameNum=1, framesDuration=100) ->
            console.log "Adding child #{animation.name} to #{@name} on frame #{frameNum}"
            animation.detach()
            animation.firstFrame = frameNum
            unless @actors[frameNum] then @actors[frameNum] = []
            @actors[frameNum].push animation
            animation.parent = @
            animation.attachHeart @heart
            # Add stage on/off key-frame callbacks to avoid revalidation of the
            # whole crew each time playhead moves to the next frame during
            # normal forward playback.
            stageAction = () =>
                animation.stage on
                animation.start()
            @addKeyframe frameNum, stageAction
            unstageAction = () =>
                animation.stage off
            @addKeyframe frameNum+framesDuration+1, unstageAction


    class @Actor extends @Animation
        constructor: (@name, @totalFrames, @initialProperties={}) ->
            super @name, @totalFrames
        tweenProperty: (propName, fromFrame, toFrame, toValue) ->
            self = @
            tweenCallback = null
            console.log "Creating tween #{propName} #{fromFrame}-#{toFrame}"
            @addKeyframe fromFrame, () =>
                console.log "Starting tween on #{@name}"
                tweenCallback = () =>
                    self.tween(propName, fromFrame, toFrame, toValue)
                self.addListener 'enterFrame', tweenCallback
            @addKeyframe toFrame+1, () =>
                self.removeListener 'enterFrame', tweenCallback
        # TODO: Implement optional tweeneing/easing method(s)
        tween: (propName, fromFrame, toFrame, toValue, method='NOT IMPLEMENTED') ->
            allFrames = toFrame - fromFrame
            tweenFrame = @currentFrame - fromFrame
            totalValue = toValue - @initialProperties[propName]
            whereAmI = tweenFrame / allFrames
            @set(propName, @initialProperties[propName] + whereAmI*totalValue)
        onEnterFrame: () ->
            super()
        set: (propName, value) ->
            @properties[propName] = value
        get: (propName) ->
            @properties[propName]


    class @Curtains extends @Animation
        constructor: (@fps=24, @totalFrames, @autoStart=false) ->
            @attachHeart new curtains.Heart @fps, @autoStart
            @stage on
            console.log 'Curtains up...'
            super 'Curtains', @totalFrames
        up: () ->
            unless @heart.isBeating
                @start(@currentFrame)
                @heart.startPumping()
        down: () ->
            if @heart.isBeating
                @heart.stopPumping()


    class @CssActor extends @Actor
        constructor: (@name, @totalFrames, overrideInitialProperties={}, @selector) ->
            super @name, @totalFrames, @initialProperties
            properties =
                opacity: parseInt(@get 'opacity')
                top: parseInt(@get 'top')
                left: parseInt(@get 'left')
                width: parseInt(@get 'width')
                height: parseInt(@get 'height')
            for prop of overrideInitialProperties
                properties[prop] = overrideInitialProperties[prop]
                @set prop, properties[prop]
            @initialProperties = properties
        get: (propName) ->
            if root.$
                root.$(@selector).css propName
        set: (propName, value) ->
            if root.$
                root.$(@selector).css propName, value
        visible: (isVisible) ->
            visibility = 'none'
            if isVisible then visibility = 'block'
            if root.$
                root.$(@selector).css('display', visibility)
