    @module 'mirumee', ->
        class @MirumeeSparkle extends curtains.CssActor
            constructor: (col, initialProperties) ->
                super 1, null, initialProperties
                color = col or '#00FF00'
                bgColor = '#FFF'
                radius = "12px"
                @html.css 'background', bgColor
                s1 = new curtains.CssActor 50, null, {background: color, top: 0, left: 0, width: 40, height: 40}
                s1.tweenProperty 'border-radius', 1, 50, "#{radius} #{radius} 0 #{radius}"
                s2 = new curtains.CssActor 50, null, {background: color, top: 0, left: 40, width: 40, height: 40}
                s3 = new curtains.CssActor 50, null, {background: color, top: 40, left: 40, width: 40, height: 40}
                s3.tweenProperty 'border-radius', 1, 50, "0 #{radius} #{radius} #{radius}"
                s4 = new curtains.CssActor 50, null, {background: color, top: 40, left: 0, width: 40, height: 40}
                onAttachHeart = () =>
                    @dropOnStage s1, 1, 1
                    @dropOnStage s2, 1, 1
                    @dropOnStage s3, 1, 1
                    @dropOnStage s4, 1, 1
                @addListener 'heartAttach', onAttachHeart
                onAttachHeart2 = () =>
                    s2Curve = new curtains.CssActor 50, null, {background: bgColor, top: 0, left: 0, width: 40, height: 40}
                    s2Curve.tweenProperty 'border-radius', 1, 50, "0 0 0 #{radius}"
                    s2.dropOnStage s2Curve, 1, 50
                s2.addListener 'heartAttach', onAttachHeart2
                onAttachHeart4 = () =>
                    s4Curve = new curtains.CssActor 50, null, {background: bgColor, top: 0, left: 0, width: 40, height: 40}
                    s4Curve.tweenProperty 'border-radius', 1, 50, "0 #{radius} 0 0"
                    s4.dropOnStage s4Curve, 1, 50
                s4.addListener 'heartAttach', onAttachHeart4


    sparkle3 = new mirumee.MirumeeSparkle "#0000FF", {top: 50, left: 130, '-moz-transform': 'rotate(90deg)' }
    actor01.dropOnStage sparkle3, 1, 100
    sparkle1 = new mirumee.MirumeeSparkle null, {top: 10, left: 10}
    actor01.dropOnStage sparkle1, 1, 100
    sparkle2 = new mirumee.MirumeeSparkle "#FF0000", {top: 10, left: 10 + 80}
    actor01.dropOnStage sparkle2, 1, 100

