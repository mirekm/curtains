root = exports ? @

@module = (names, fn) ->
    names = names.split '.' if typeof names is 'string'
    space = @[names.shift()] ||= {}
    space.module ||= @module
    if names.length
        space.module names, fn
    else
        fn.call space

Array::compare = (to) ->
    for e, index in @
        if e.compare
            if not e.compare(to[index]) then return false
        else
            if e isnt to[index] then return false
    return true


@module 'curtains.geom', ->
    class @Utils
        @deg2rad = (angle) ->
            (angle/180) * Math.PI
        @rad2deg = (angle) ->
            angle * 180/Math.PI
        @DEG_TO_RAD = Math.PI/180
    class @Matrix2D
        @identity2x2 = () ->
            [[1, 0],
             [0, 1]]
        constructor: (@mat=curtains.geom.Matrix2D.identity2x2(), @tx = 0, @ty = 0) ->
            #console.log "Creating new matrix #{@mat}"
            @height = @mat.length
            @width = @mat?[0].length
            @w = @width - 1
            @h = @height - 1
            @decompose()
        calculateRotation: () ->
            Math.atan @mat[1][0]/@mat[1][1]
        decompose: () ->
            a = @mat[0][0]
            b = @mat[0][1]
            c = @mat[1][0]
            d = @mat[1][1]
            @scaleX = Math.sqrt(a * a + b * b)
            @scaleY = Math.sqrt(c * c + d * b)
            skewX = Math.atan2(-c, d)
            skewY = Math.atan2(b, a)
            if skewX is skewY
                rot = skewY/curtains.geom.Utils.DEG_TO_RAD
                @rotation = curtains.geom.Utils.deg2rad(rot)
                if a < 0 and d >= 0
                    @rotation += if @rotation <= 0 then Math.PI else -Math.PI
                @skewX = @skewY = 0
            else
                @skewX = skewX/curtains.geom.Utils.DEG_TO_RAD
                @skewY = skewY/curtains.geom.Utils.DEG_TO_RAD
        rotationInDegrees: () ->
            return curtains.geom.Utils.rad2deg(@rotation)
        multiply: (mulBy) ->
            if @width isnt mulBy.height
                throw "Cannot multiply matrices: incompatible dimensions."
            ret = []
            for i in [0..@h]
                ret[i] = []
                for j in [0..mulBy.w]
                    sum = 0
                    for k in [0..@w]
                        sum += @mat[i][k] * mulBy.mat[k][j]
                    ret[i][j] = sum
            new curtains.geom.Matrix2D ret, @tx, @ty
        compare: (matrix) ->
            @mat.compare(matrix.mat)
        rotate: (angle, inDegrees) ->
            if inDegrees
                angle = curtains.geom.Utils.deg2rad(angle)
            sin = Math.sin angle
            cos = Math.cos angle
            a1 = @mat[0][0]
            c1 = @mat[1][0]
            na = a1*cos-@mat[0][1]*sin
            nb = a1*sin+@mat[0][1]*cos
            nc = c1*cos-@mat[1][1]*sin
            nd = c1*sin+@mat[1][1]*cos
            tx1 = @tx
            ntx = tx1*cos-@ty*sin
            nty = tx1*sin+@ty*cos
            ret = @multiply new curtains.geom.Matrix2D [[na, nb], [nc, nd]]
            ret.tx = ntx
            ret.ty = nty
            ret
        translate: (x, y) ->
            @tx += x
            @ty += y
