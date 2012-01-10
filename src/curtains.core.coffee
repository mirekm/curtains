###
Curtains v0.0.0
Keyframe & event-driven, general purpose theatre in JavaScript.

Released under MIT Licence.
(C) 2011, Mirek Mencel mirek@mirumee.com | Mirumee Labs
###

Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1

@module = (names, fn) ->
    names = names.split '.' if typeof names is 'string'
    space = @[names.shift()] ||= {}
    space.module ||= @module
    if names.length
        space.module names, fn
    else
        fn.call space

root = exports ? @


@module 'curtains.utils', ->
    class @Color
        @hsv2rgb: (h, s, v) ->
            unless s
                r = g = b = v
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
            h /= 60
            i  = Math.floor(h)
            f = h - i
            p = v *  (1 - s)
            q = v * (1 - s * f)
            t = v * (1 - s * (1 - f))
            switch i
                when 0 then [r, g, b] = [v, t, p]
                when 1 then [r, g, b] = [q, v, p]
                when 2 then [r, g, b] = [p, v ,t]
                when 3 then [r, g, b] = [p, q, v]
                when 4 then [r, g, b] = [t, p, v]
                else [r, g, b] = [v, p, q]
            [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]


    class @ValueFactory
        @parseUnitValue: (raw) ->
            value =
                value: raw.replace(/([a-zA-Z]+)/gi, ''),
                unit: (raw.match(/([a-zA-Z]+)/gi) or ['']).join('')
            return value
        @getValue: (raw, propName='') ->
            if isNaN raw
                if typeof(raw) is 'string' and raw.length
                    if propName.indexOf('origin') < 0 and propName.indexOf('trans') >= 0
                        transform = new curtains.utils.MatrixValue raw
                        if transform.ok
                            return transform
                    # Color?
                    if raw.indexOf('rgb') is 0 or raw.indexOf('#') is 0
                        color = new curtains.utils.ColorValue raw
                        if color.color and color.color.ok
                            return color
                    raw = raw.split(/\s+/).filter (x) -> x.length
                    if raw.length > 1
                        # Complex value ie. '1px 2px 3px'
                        complex = []
                        for value in raw
                            complex.push(curtains.utils.ValueFactory.getValue(value))
                        return new curtains.utils.ComplexValue complex
                    else
                        # Single value: non-tweenable string, color or value with unit
                        raw = raw[0]
                        val = curtains.utils.ValueFactory.parseUnitValue(raw)
                        unless isNaN val.value
                            return new curtains.utils.NumberValue val.value, val.unit
                    return new curtains.utils.StringValue raw
            else
                # It is a plain number with no units
                return new curtains.utils.NumberValue raw

    class @Value
        constructor: (@raw) ->
        tweenTo: (time, duration, to, method) ->
            throw "Not implemented."
        render: () ->
            @raw

    class @NumberValue extends @Value
        constructor: (value, @unit) ->
            @val = Number(value)
        render: (toRender=@val) ->
            if @unit
                "#{toRender}#{@unit}"
            else
                toRender
        tweenTo: (time, duration, to, method) ->
            @render(method(time, @val, to.val - @val, duration))

    class @ColorValue extends @Value
        constructor: (raw) ->
            super raw
            try
                @color = new RGBColor raw
            catch err
                console.log "Error: Cannot find RGBColor object."
        render: () ->
            @color?.toHex()
        tweenTo: (time, duration, to, method) ->
            if @color and to.color
                rDelta = to.color.r - @color.r
                gDelta = to.color.g - @color.g
                bDelta = to.color.b - @color.b
                color = new RGBColor ''
                color.r = Math.round method(time, @color.r, rDelta, duration)
                color.g = Math.round method(time, @color.g, gDelta, duration)
                color.b = Math.round method(time, @color.b, bDelta, duration)
                color.ok = true
                color.toHex()

    class @StringValue extends @Value
        constructor: (raw) ->
            super raw

    class @ComplexValue extends @Value
        constructor: (@values) ->
        render: (toRender=@values) ->
            [item.render() for item in toRender].join(' ')
        tweenTo: (time, duration, to, method) ->
            ret = []
            for item, index in @values
                ret.push(item.tweenTo time, duration, to.values[index], method)
            ret.join(' ')


    class @MatrixValue extends @Value
        constructor: (raw) ->
            @ok = true
            val = raw.match /[-+]?[0-9]*\.?[0-9]+/gi
            transform = raw[0..2]
            @matrix = new curtains.geom.Matrix2D()
            @rotation = 0
            switch transform
                when 'mat'
                    # |(0) cos(rot), (1) -sin(rot)| |(4) tx|
                    # |(2) sin(rot), (3)  cos(rot)| |(5) ty|
                    @matrix = new curtains.geom.Matrix2D [[Number(val[0]), Number(val[1])],
                                                          [Number(val[2]), Number(val[3])]]
                    @rotation = @matrix.rotation
                when 'rot'
                    @rotate(val[0])
                when 'tra'
                    @translate = Number(val)
                when 'ske'
                    @skew = Number(val)
                when 'sca'
                    @scale = Number(val)
                when 'non'
                else
                    @ok = false
        render: (toRender=@matrix) ->
            return "matrix(#{toRender.mat[0][0].toFixed(6)},
                           #{toRender.mat[0][1].toFixed(6)},
                           #{toRender.mat[1][0].toFixed(6)},
                           #{toRender.mat[1][1].toFixed(6)},
                           #{+toRender.tx}pt,
                           #{+toRender.ty}pt)"
        tweenTo: (time, duration, to, method) ->
            interpolated = method(time,
                                  @rotation,
                                  to.rotation,
                                  duration)
            rotated = @matrix.rotate interpolated
            @render rotated

        # Deprecated
        interpolateMatrix: (time, duration, to, method) ->
            aDelta = to.matrix.mat[0][0] - @matrix.mat[0][0]
            bDelta = to.matrix.mat[0][1] - @matrix.mat[0][1]
            cDelta = to.matrix.mat[1][0] - @matrix.mat[1][0]
            dDelta = to.matrix.mat[1][1] - @matrix.mat[1][1]
            a = method(time, @matrix.mat[0][0], aDelta, duration)
            b = method(time, @matrix.mat[0][1], bDelta, duration)
            c = method(time, @matrix.mat[1][0], cDelta, duration)
            d = method(time, @matrix.mat[1][1], dDelta, duration)
            ret = new curtains.geom.Matrix2D([[a, b], [c, d]])
            @render ret
        rotate: (deg=@rot) ->
            @rotation = curtains.geom.Utils.deg2rad(deg)
        translate: (x, y) ->
            @matrix.tx = x
            @matrix.ty = y
        skew: (x, y) ->
            # TODO:
        scale: (x, y) ->
            # TODO:


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
            event = @listeners[event]
            listeners = if event then event[0...event.length] else []
            for l, i in listeners
                l?.apply @, {event: event, sender: @}


    class @Heart extends @EventDispatcher
        constructor: (@bps=24, @autoStart=false) ->
            super()
            @isBeating = false
            @tick = 1
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
        constructor: (@totalFrames=100, @name) ->
            super()
            @id = @_getNextId()
            @currentFrame = 0
            @frames = [] # Keyframes
            @actors = [] # Animations
            @currentActors = [] # Current frame animations
            @parent = null
            @direction = 1
        _getNextId: () ->
            Animation._objectId++
        invalidateCrew: (frameNum = @currentFrame) ->
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
            @onEnterFrame(@currentFrame)
        _onExitFrame: () ->
        _beat: () ->
            if @currentFrame
                @dispatchEvent 'exitFrame'
            @setCurrentFrame @currentFrame + @direction
            @dispatchEvent 'enterFrame'
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
            @dispatchEvent 'heartAttach'
        # Go get'em Danny!
        start: (frameNum = @currentFrame) ->
            @goto(frameNum)
            @_startListeners()
            @_beat()
            @dispatchEvent 'start'
        reverse: () ->
            @direction *= -1
            @dispatchEvent 'reverse'
        # - It's over Johnny. It's over.
        stop: (frameNum) ->
            @_stopListeners()
            @dispatchEvent 'stop'
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
            #console.log "Adding keyframe to #{@name} at #{frameNum}"
            unless @frames[frameNum]
                @frames[frameNum] = []
            @frames[frameNum].push callback
        stage: (@onStage) ->
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
        dropOnStage: (animation, frameNum=1, framesDuration) ->
            #console.log "Adding child #{animation.name} to #{@name} on frame #{frameNum}"
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
                if @direction > 0
                    animation.stage on
                    animation.start()
                else
                    animation.stage off
                    animation.stop(0)
            @addKeyframe frameNum, stageAction
            if framesDuration
                unstageAction = () =>
                    if @direction > 0
                        animation.stage off
                    else
                        animation.stage on
                @addKeyframe frameNum+framesDuration, unstageAction
        tweenActor: (actor, propName, propValue, fromFrame, toFrame, method=curtains.ease.Quad.inOut) ->
            unless toFrame
                toFrame = fromFrame
            self = @
            tweenCallback = null
            @addKeyframe fromFrame, () =>
                if self.direction is -1 then return
                self.removeListener 'enterFrame', tweenCallback
                from = actor.get propName
                to = new curtains.utils.ValueFactory.getValue propValue, propName
                from.unit = to.unit
                tweenCallback = () =>
                    tweenFrame = self.currentFrame - fromFrame
                    if tweenFrame is -1
                        self.removeListener 'enterFrame', tweenCallback
                        return
                    allFrames = toFrame - fromFrame
                    newVal = from.tweenTo tweenFrame, allFrames, to, method
                    actor.set propName, newVal
                self.addListener 'enterFrame', tweenCallback
            @addKeyframe toFrame+1, () =>
                if self.direction < 1
                    self.addListener 'enterFrame', tweenCallback
                else
                    self.removeListener 'enterFrame', tweenCallback


    class @Actor extends @Animation
        constructor: (totalFrames, @initialProperties={}, name) ->
            super totalFrames, name
        stage: (onStage) ->
            super onStage
            unless onStage
                parent.detach
                do @reset
        reset: () ->
            for prop of @initialProperties
                @set prop, @initialProperties[prop]
        onEnterFrame: () ->
            super()
        set: (propName, value) ->
            @properties[propName] = value
        get: (propName) ->
            @properties[propName]


    class @Curtains extends @Animation
        constructor: (@fps=24, totalFrames, @autoStart=false) ->
            super totalFrames, 'Curtains'
            @attachHeart new curtains.Heart @fps, @autoStart
            @stage on
            console.log 'Curtains up...'
        up: () ->
            unless @heart.isBeating
                @start(@currentFrame)
                @heart.startPumping()
        down: () ->
            if @heart.isBeating
                @heart.stopPumping()


    class @CssActor extends @Actor
        constructor: (totalFrames, @selector, overrideInitialProperties={}, name) ->
            super totalFrames, null, name
            @reattachChildren = true
            @html = @getOrCreate @selector
            # Resetable initial properties (only these + overriden will be
            # reset to the original state when needed ie. actor is staged/ustaged
            properties =
                opacity: @get 'opacity'
                top: @get 'top'
                left: @get 'left'
                width: @get 'width'
                height: @get 'height'
            for prop of overrideInitialProperties
                @set prop, overrideInitialProperties[prop]
                properties[prop] = curtains.utils.ValueFactory.getValue overrideInitialProperties[prop]
            @initialProperties = properties
        $: (selector) ->
            root.$ selector
        getOrCreate: (selector) ->
            if selector
                return @$(selector)
            else
                html = @$("<div id=\"#{@id}\"</div>")
                if @reattachChildren
                    @parent?.append(html)
                return html
        get: (propName) ->
            if propName is 'border-radius'
                tl = @html.css 'border-top-left-radius'
                tr = @html.css 'border-top-right-radius'
                br = @html.css 'border-bottom-right-radius'
                bl = @html.css 'border-bottom-left-radius'
                raw = [tl, tr, br, bl].join(' ')
            else
                if propName.indexOf('trans') >= 0 and propName.indexOf('origin') < 0
                    raw = @html.css('-moz-transform') or
                          @html.css('-webkit-transform') or
                          @html.css('-o-transform') or
                          @html.css('-ms-transform')
                    matrixVal = curtains.utils.ValueFactory.getValue raw, propName
                    return matrixVal
                else
                    raw = @html.css propName
            curtains.utils.ValueFactory.getValue raw, propName
        set: (propName, value) ->
            if propName.indexOf('origin') >= 0
                @html.css '-moz-transform-origin', value
                @html.css '-webkit-transform-origin', value
                @html.css '-o-transform-origin', value
                @html.css '-ms-transform-origin', value
            else if propName.indexOf('trans') >= 0
                @html.css '-moz-transform', value
                @html.css '-webkit-transform', value
                @html.css '-o-transform', value
                @html.css '-ms-transform', value
            else
                @html.css propName, value

        visible: (isVisible) ->
            visibility = 'none'
            if isVisible then visibility = 'block'
            @html.css 'display', visibility
        dropOnStage: (animation, frameNum=1, framesDuration) ->
            super animation, frameNum, framesDuration
            if @reattachChildren
                @html.append(animation.html)
                @html.css 'position', 'relative'
                animation.html.css 'position', 'absolute'
