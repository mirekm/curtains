@module = (names, fn) ->
    names = names.split '.' if typeof names is 'string'
    space = @[names.shift()] ||= {}
    space.module ||= @module
    if names.length
        space.module names, fn
    else
        fn.call space

root = exports ? @


@module 'curtains.ease', ->
    class @Linear
        @in = (t, b, c, d) ->
            b + c * t/d
        @out = (t, b, c, d) ->
            ease.Linear.in t, b, c, d
        @inOut = (t, b, c, d) ->
            ease.Linear.in t, b, c, d

    class @Quad
        @in = (t, b, c, d) ->
            b + c * (t/=d) * t
        @out = (t, b, c, d) ->
            b - c * (t/=d) * (t-2)
        @inOut = (t, b, c, d) ->
            if (t/=d/2) < 1
                b + c/2 * t * t
            else
                b - c/2 * ((--t)*(t-2) - 1)
    class @Cubic
        @in = (t, b, c, d) ->
            b + c * Math.pow(t/d, 3)
        @out = (t, b, c, d) ->
            b + c * (Math.pow(t/d-1, 3) + 1)
        @inOut = (t, b, c, d) ->
            if (t/=d/2) < 1
                b + c/2 * Math.pow(t, 3)
            else
                b + c/2 * (Math.pow(t-2, 3) + 2)
    class @Sine
        @in = (t, b, c, d) ->
            b + c * (1 - Math.cos(t/d * (Math.PI/2)))
        @out = (t, b, c, d) ->
            b + c * Math.sin(t/d * (Math.PI/2))
        @inOut = (t, b, c, d) ->
            b + c/2 * (1 - Math.cos(Math.PI * t/d))

    class @Circ
        @in = (t, b, c, d) ->
            b + c * (1 - Math.sqrt(1 - (t/=d)*t))
        @out = (t, b, c, d) ->
            b + c * Math.sqrt(1 - (t=t/d-1)*t)
        @inOut = (t, b, c, d) ->
            if (t/=d/2) < 1
                b + c/2 * (1 - Math.sqrt(1 - t*t))
            else
                b + c/2 * (Math.sqrt(1 - (t-=2) * t) + 1)

    class @Expo
        @in = (t, b, c, d) ->
            b + c * Math.pow(2, 10 * (t/d - 1))
        @out = (t, b, c, d) ->
            b + c * (-Math.pow(2, -10 * t/d) + 1)
        @inOut = (t, b, c, d) ->
            if (t/=d/2) < 1
                b + c/2 * Math.pow(2, 10 * (t - 1))
            else
                b + c/2 * (-Math.pow(2, -10 * --t) + 2)
