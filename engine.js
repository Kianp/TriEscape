var game = function (gameObj) {
    var key = {space: 0} ;
    window.onkeydown = function (k) {
        if (k.which == 80) {
            if (speed) speed = 0;
            else speed = 4;
        }
        if (k.which == 32) {
            key['space'] = 1
        }
    } ;
    window.onkeyup = function (k) {
        if (k.which == 32) {
            key['space'] = 0
        }
    } ;

    var gameStartHeight = gameObj.gameStartHeight;
    var snapPointX = gameObj.snapPointX;
    var gameWidth = gameObj.gameWidth;
    var gameHeight = gameObj.gameHeight;
    var rectWidth = gameObj.rectWidth ;

    var bottomLeft = new paper.Point(0, gameHeight);
    var topLeft = new paper.Point(0, 0);
    var topRight = new paper.Point(gameWidth, 0);
    var bottomRight = new paper.Point(gameWidth, gameHeight);

    var isJumping = false;
    var isFalling = false;
    var isStable = true;
    var isPlaying = true;
    var isResuming = false;

    var jumpRotationOffset = gameObj.jumpRotationOffset; // jump speed
    var jumpHeight = gameObj.jumpHeight;
    var speed = gameObj.speed;

    var framesPlayed = 0 ;
    var jumpSinDegree = 0 ;

    var gameEndFrameDuration = gameObj.gameEndFrameDuration  ;
    var gameResumeFrameDuration = gameObj.gameResumeFrameDuration;

    var gameResumeFramePassed = 0;
    var gameEndFramePassed = 0;
    var currentRectHeight = gameStartHeight + rectWidth / 2;

    console.log(gameObj) ;
    // -1 = coin // -3 dark room
    var map = gameObj.map ;

    var canvas = document.getElementById('paper');
    paper.setup(canvas);

    /* ______________________________________________________________________ */
    var firstLayer = paper.project.activelayer;
    var black = true;

    var c = 10;
    var box = new paper.Path.Rectangle(new paper.Point(0, 0), gameWidth / c, gameWidth / c);
    box.strokeColor = "#34495e";
    box.rotation = 45;
    box.alpha = .5;
    var small = new paper.Path.Rectangle(new paper.Point(100, 100), 25, 25);
    small.strokeColor = "#e2e2e2";
    box.rotation = -45;
    small.alpha = .5;

    var coin = new paper.Path.Rectangle(new paper.Point(0, 0), 10, 10);
    coin.strokeColor = "#f1c40f";
    coin.rotation = 45;
    var coinSymbol = new paper.Symbol(coin);

    var boxSymbol = new paper.Symbol(box);
    var smallSymbol = new paper.Symbol(small);

    for (var i = 0; i < c; i++) {
        for (var j = 0; j < 3; j++) {
            boxSymbol.place(new paper.Point(1.5 * (gameWidth / c) * i, ( gameWidth / c ) * j * 1.5));
            smallSymbol.place(new paper.Point(1.5 * (gameWidth / c) * i, 1.5 * ( gameWidth / c ) * j));
        }
    }


    /* ______________________________________________________________________ */
    var secondLayer = new paper.Layer();
    var rectGp = new paper.Group([]);
    var triGp = new paper.Group([]);
    var coinGp = new paper.Group([]);
    coinGp.applyMatrix = false;
    // path
    var path = new paper.Path();
    path.strokeColor = "black";
    for (var i = 0; i <= gameWidth / rectWidth; i++) {
        path.add(new paper.Point((i) * rectWidth, gameStartHeight + rectWidth))
    }

    // map generation
    for (var idx = 0; idx < map.length; idx++) {
        var mapBlock = map[idx];
        if (mapBlock == 0) {
            continue;
        }
        else if (mapBlock == 1) {
            var triObject = new paper.Path.RegularPolygon(new paper.Point(( snapPointX + (rectWidth) * idx ) + (rectWidth * .5), 325 - (rectWidth) / 4), 3, rectWidth / 2);
            triObject.fillColor = "#D14233";
            triGp.addChild(triObject);
        }
        else if (typeof mapBlock === 'object') {
            if (mapBlock[0] == 1) {
                var triObject = new paper.Path.RegularPolygon(new paper.Point(( snapPointX + (rectWidth) * idx ) + (rectWidth * .5), 325 - (rectWidth) / 4), 3, rectWidth / 2);
                triObject.fillColor = "#D14233";
                triGp.addChild(triObject);
            }
            for (var h = 1; h < mapBlock.length - 1; h++) {
                var rectObject = new paper.Path.Rectangle(snapPointX + (rectWidth * idx), gameStartHeight + (rectWidth) - (mapBlock[h] * rectWidth), rectWidth, rectWidth);
                rectObject.fillColor = "#7F8C8D";
                rectGp.addChild(rectObject);
            }
            if (mapBlock[mapBlock.length - 1] == 1) {
                var triObject = new paper.Path.RegularPolygon(new paper.Point(( snapPointX + (rectWidth) * idx ) + (rectWidth * .5), 325 - (rectWidth) / 4 - (mapBlock.length - 1) * rectWidth), 3, rectWidth / 2);
                triObject.fillColor = "#D14233";
                triGp.addChild(triObject);
            }
            else if (mapBlock[mapBlock.length - 1] == -1) {
                var coinObject = paper.Path.Rectangle(snapPointX + (rectWidth * idx), gameStartHeight + (rectWidth) - (mapBlock.length * rectWidth) + 10, 10, 10);
                coinObject.strokeColor = "#f1c40f";
                coinObject.rotation = 45;
                coinGp.addChild(coinObject);
            }
        }
    }
    var rectGpInitial = rectGp.position;
    var triGpInitial = triGp.position;
    var cointGpInitial = coinGp.position;
    var rectGpStopPoint, triGpStopPoint, coinGpStopPoint;


    var rectAngle = new paper.Path.Rectangle(snapPointX, gameStartHeight, rectWidth, rectWidth);
    rectAngle.fillColor = "#2c3e50";
    rectAngle.applyMatrix = false;
    var rectAngleTransfrormVectors = [
        new paper.Point(bottomLeft.x - rectAngle.segments[0].point.x, bottomLeft.y - rectAngle.segments[0].point.y),
        new paper.Point(topLeft.x - rectAngle.segments[1].point.x, topLeft.y - rectAngle.segments[1].point.y),
        new paper.Point(topRight.x - rectAngle.segments[2].point.x, topRight.y - rectAngle.segments[2].point.y),
        new paper.Point(bottomRight.x - rectAngle.segments[3].point.x, bottomRight.y - rectAngle.segments[3].point.y)
    ];
    /* ______________________________________________________________________ */
    var thirdLayer = new paper.Layer();

    var gradientPath = new paper.Path([
        new paper.Point(0, 0),
        new paper.Point(gameWidth + 10, 0),
        new paper.Point(gameWidth + 10, gameHeight + 10),
        new paper.Point(0, gameHeight + 10)
    ]);
    gradientPath.fillColor = {
        gradient: {
            stops: [[new paper.Color(1, 1, 1, 0), 0.1], [new paper.Color(0, 0, 0, 1), 1]],
            radial: true
        },
        origin: new paper.Point(snapPointX + 150, gameHeight / 2),
        destination: gradientPath.bounds.rightCenter
    };


    /* ______________________________________________________________________ */
    var pointInsideRect = function (p) {
//            console.log(rectAngle.position) ;
        if (p.x >= (rectAngle.position.x - rectWidth / 2) && p.x <= (rectAngle.position.x + rectWidth / 2)) {
            if (p.y >= (rectAngle.position.y - rectWidth / 2) && p.y <= (rectAngle.position.y + rectWidth / 2)) {
                return true
            }
        }
        return false;
    };

    var rectGpPointInsideRect = function (p) {
        if (p.x > (rectAngle.position.x - rectWidth / 2) && p.x < (rectAngle.position.x + rectWidth / 2)) {
            if (p.y > (rectAngle.position.y - rectWidth / 2) && p.y < (rectAngle.position.y + rectWidth / 2)) {
                return true
            }
        }
        return false;
    };
    var createMap = function () {

    };
    //var calculateRectOffsetVectors = function () {
    //    rectAngleTransfrormVectors = [
    //        new paper.Point(bottomLeft.x - rectAngle.segments[0].point.x, bottomLeft.y - rectAngle.segments[0].point.y),
    //        new paper.Point(topLeft.x - rectAngle.segments[1].point.x, topLeft.y - rectAngle.segments[1].point.y),
    //        new paper.Point(topRight.x - rectAngle.segments[2].point.x, topRight.y - rectAngle.segments[2].point.y),
    //        new paper.Point(bottomRight.x - rectAngle.segments[3].point.x, bottomRight.y - rectAngle.segments[3].point.y)
    //    ];
    //};
    /* ___________________________________________________________________ */

    console.log(paper.projects);
    // main loop

    console.log(rectGp.children);
    paper.view.onFrame = function (evt) {
        if (isPlaying) {
            framesPlayed += 1;
            gradientPath.fillColor.gradient.stops[1].rampPoint = ( Math.sin(framesPlayed / 20) + 9 ) / 10;

            document.getElementById('score').innerHTML = framesPlayed;
            if (key['space']) {
                if (isStable) {
                    console.log('jumping');
                    isStable = false;
                    isJumping = true;
                }
            }

            triGp.position.x -= speed;
            rectGp.position.x -= speed;
            coinGp.position.x -= speed;

            // should fall when on top of others
            if (!isJumping && !isFalling) {
                var fallFlag = true;
                if (rectAngle.position.y < (gameStartHeight + rectWidth / 2)) {
                    for (var i = 0; i < rectGp.children.length; i++) {
                        if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth )) {
                            if (rectGp.children[i].position.y === rectAngle.position.y + rectWidth) {
                                fallFlag = false;
                                break;
                            }
                        }
                    }
                    if (fallFlag) {
                        isFalling = true;
                        isStable = false;
                    }
                    else {
                        isFalling = false;
                        isStable = true;
                    }
                }
            }
            else if (isJumping) {
                // casual jump
                rectAngle.rotate(jumpRotationOffset);
                jumpSinDegree += jumpRotationOffset;
                rectAngle.position.y = ( -Math.sin((Math.PI / 180) * jumpSinDegree) * jumpHeight ) + currentRectHeight;
                // check if should go on top of a block while jumping
                if (jumpSinDegree != jumpRotationOffset) {
                    for (var i = 0; i < rectGp.children.length; i++) {
                        if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth)) {
                            if (rectAngle.position.y > (rectGp.children[i].position.y - rectWidth) && rectAngle.position.y < rectGp.children[i].position.y && jumpSinDegree > 40) {
                                isJumping = false;
                                isStable = true;
                                rectAngle.rotation = 0;
                                rectAngle.position.y = rectGp.children[i].position.y - rectWidth;
                                currentRectHeight = rectGp.children[i].position.y - rectWidth;
                                jumpSinDegree = 0;
                            }
                        }
                    }
                    // jump end
                    if (jumpSinDegree === 180) {
                        isJumping = false;
                        rectAngle.rotation = 0;
                        jumpSinDegree = 0;
                        if (Math.abs(rectAngle.position.y - (gameStartHeight + rectWidth / 2)) < 1) {
                            isStable = true;
                            rectAngle.position.y = (gameStartHeight + rectWidth / 2).toFixed();
                        }
                    }
                }
            }

            // fall routine - check if should stop falling on ground or on another block
            if (isFalling) {
                rectAngle.position.y += 5;
                for (var i = 0; i < rectGp.children.length; i++) {
                    if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth)) {
                        if (rectAngle.position.y > (rectGp.children[i].position.y - rectWidth) && rectAngle.position.y < rectGp.children[i].position.y) {
                            isFalling = false;
                            isStable = true;
                            rectAngle.position.y = rectGp.children[i].position.y - rectWidth;
                            currentRectHeight = rectGp.children[i].position.y - rectWidth;
                        }
                    }
                }
                if (rectAngle.position.y > (gameStartHeight + rectWidth / 2 )) {
                    rectAngle.position.y = gameStartHeight + rectWidth / 2;
                    currentRectHeight = gameStartHeight + rectWidth / 2;
                    isStable = true;
                    isFalling = false;
                }
            }

            // collision
            for (var j = 0; j < rectGp.children.length; j++) {
                if (rectGpPointInsideRect(rectGp.children[j].segments[0].point) ||
                    rectGpPointInsideRect(rectGp.children[j].segments[1].point) ||
                    rectGpPointInsideRect(rectGp.children[j].segments[2].point) ||
                    rectGpPointInsideRect(rectGp.children[j].segments[3].point)) {
                    console.log("collisiosn rect");
                    isPlaying = false;
                    isJumping = false;
                    isFalling = false;
                    isStable = true;
                    jumpSinDegree = 0;
                    rectAngle.rotation = 0;
                    rectGpStopPoint = rectGp.position.x;
                    triGpStopPoint = triGp.position.x;
                    coinGpStopPoint = coinGp.position.x;
                    currentRectHeight = gameStartHeight + rectWidth / 2;
                    rectAngle.position.y = gameStartHeight + rectWidth / 2;
                }
            }
            for (var j = 0; j < triGp.children.length; j++) {
                if (pointInsideRect(triGp.children[j].segments[0].point) || pointInsideRect(triGp.children[j].segments[1].point) || pointInsideRect(triGp.children[j].segments[2].point)) {
                    console.log("collision tri");
                    isPlaying = false;
                    isJumping = false;
                    isFalling = false;
                    isStable = true;
                    jumpSinDegree = 0;
                    rectAngle.rotation = 0;
                    rectGpStopPoint = rectGp.position.x;
                    coinGpStopPoint = coinGp.position.x;
                    currentRectHeight = gameStartHeight + rectWidth / 2;
                    triGpStopPoint = triGp.position.x;
                    rectAngle.position.y = gameStartHeight + rectWidth / 2;
                }
            }

            // optimize
//                if (rectGp.children.length) {
//                    if (rectGp.children[0].position.x < -rectWidth) {
//                        rectGp.removeChildren(0, 1);
//                    }
//                }
//                if ( triGp.children.length) {
//                    if (triGp.children[0].position.x < -rectWidth) {
//                        triGp.removeChildren(0, 1);
//                    }
//                }

        }
        else {
            if (!( gameEndFramePassed > gameEndFrameDuration)) {
                rectAngle.segments[0].point.x += ( rectAngleTransfrormVectors[0].x / gameEndFrameDuration);
                rectAngle.segments[0].point.y += ( rectAngleTransfrormVectors[0].y / gameEndFrameDuration);
                rectAngle.segments[1].point.x += ( rectAngleTransfrormVectors[1].x / gameEndFrameDuration);
                rectAngle.segments[1].point.y += ( rectAngleTransfrormVectors[1].y / gameEndFrameDuration);
                rectAngle.segments[2].point.x += ( rectAngleTransfrormVectors[2].x / gameEndFrameDuration);
                rectAngle.segments[2].point.y += ( rectAngleTransfrormVectors[2].y / gameEndFrameDuration);
                rectAngle.segments[3].point.x += ( rectAngleTransfrormVectors[3].x / gameEndFrameDuration);
                rectAngle.segments[3].point.y += ( rectAngleTransfrormVectors[3].y / gameEndFrameDuration);
//                    rectAngle.rotate(360 / (gameEndFrameDuration+1) , secondLayer.center );
                gameEndFramePassed += 1;
            }
            if (isResuming) {
                if (!(gameResumeFramePassed > gameResumeFrameDuration)) {
                    rectAngle.segments[0].point.x -= ( rectAngleTransfrormVectors[0].x / gameResumeFrameDuration);
                    rectAngle.segments[0].point.y -= ( rectAngleTransfrormVectors[0].y / gameResumeFrameDuration);
                    rectAngle.segments[1].point.x -= ( rectAngleTransfrormVectors[1].x / gameResumeFrameDuration);
                    rectAngle.segments[1].point.y -= ( rectAngleTransfrormVectors[1].y / gameResumeFrameDuration);
                    rectAngle.segments[2].point.x -= ( rectAngleTransfrormVectors[2].x / gameResumeFrameDuration);
                    rectAngle.segments[2].point.y -= ( rectAngleTransfrormVectors[2].y / gameResumeFrameDuration);
                    rectAngle.segments[3].point.x -= ( rectAngleTransfrormVectors[3].x / gameResumeFrameDuration);
                    rectAngle.segments[3].point.y -= ( rectAngleTransfrormVectors[3].y / gameResumeFrameDuration);
                    triGp.position.x += ( rectGpInitial.x - rectGpStopPoint ) / ( gameResumeFrameDuration + 1);
                    rectGp.position.x += ( triGpInitial.x - triGpStopPoint ) / ( gameResumeFrameDuration + 1);
                    coinGp.position.x += ( cointGpInitial.x - coinGpStopPoint ) / ( gameResumeFrameDuration + 1);
                    gameResumeFramePassed += 1;
                    if (gameResumeFramePassed == ( gameResumeFrameDuration + 1)) {
                        framesPlayed = 0;
                        rectAngle.position.y = (gameStartHeight + rectWidth / 2).toFixed();
                        rectAngle.rotation = 0;
                        isPlaying = true;
                        isResuming = false;
                        gameEndFramePassed = 0;
                        gameResumeFramePassed = 0;
                    }
                }
            }
        }

        for (var g = 0; g < coinGp.children.length; g++) {
            coinGp.children[g].rotation = 45 * (Math.cos(evt.count / 10));
            if (pointInsideRect({
                    x: ( coinGp.children[g].bounds.topRight.x) - ( cointGpInitial.x - coinGp.position.x ),
                    y: coinGp.children[g].position.y
                })) {

            }
        }
        //background move
        boxSymbol.definition.rotation += 1;
        smallSymbol.definition.rotation -= 1;
    };
} ;