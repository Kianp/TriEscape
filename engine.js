var game = function (gameObj , callback) {
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
    var $retry = $("#retry") ;
    $retry.unbind().click(function () {
        if (gameEndFramePassed > gameEndFrameDuration) {
            isResuming = true ;
            toggleButtons();
        }
    }) ;
    $back.unbind().click(function () {
        isPlaying = false;
        isWon = true;
        var info = {coins: Number(coins.content)};
        toggleMenu();
        toggleButtons() ;
        paper.view.attach('frame', this.onFrame);
        paper.view.remove() ;
        return callback(info);
    }) ;

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
    var isPlaying = true ;
    var isPreview = true ;
    var previewFlag = false ;
    var isResuming = false;
    var isWon = false ;
    var isOnCoin = false ;

    var jumpRotationOffset = gameObj.jumpRotationOffset;
    var jumpHeight = gameObj.jumpHeight;
    var speed = gameObj.speed;

    var framesPlayed = 0 ;
    var jumpSinDegree = 0 ;

    var gameEndFrameDuration = gameObj.gameEndFrameDuration  ;
    var gameResumeFrameDuration = gameObj.gameResumeFrameDuration;

    var gameResumeFramePassed = 0;
    var gameEndFramePassed = 0;
    var currentRectHeight = gameStartHeight + rectWidth / 2;

    // -1 = coin // -3 dark room
    var map = gameObj.map ;

    var canvas = document.getElementById('paper');
    paper.setup(canvas);

    /* ______________________________________________________________________ */
    var firstLayer = paper.project.activelayer;
    var black = true ;

    var c = 10;
    var box = new paper.Path.Rectangle(new paper.Point(0, 0), gameWidth / c, gameWidth / c);
    box.strokeColor = "#34495e";
    box.rotation = 45;
    box.alpha = .5;
    var small = new paper.Path.Rectangle(new paper.Point(100, 100), 25, 25);
    small.strokeColor = "#bcbcbc";
    box.rotation = -45;
    small.alpha = .5;

    var coin = new paper.Path.Rectangle(new paper.Point(0, 0), 10, 10);
    coin.strokeColor = "#f1c40f";
    coin.fillColor = "#f1c40f";
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

    var score = new paper.PointText(new paper.Point(30 , 30)) ;
    score.content = "0"  ;
    var coins = new paper.PointText(new paper.Point(50 , 30)) ;
    coins.fillColor = "#f1c40f" ;
    coins.content = "0" ;

    // path
    var path = new paper.Path();
    path.strokeColor = "black";
    for (var i = 0; i <= gameWidth / rectWidth; i++) {
        path.add(new paper.Point((i) * rectWidth, gameStartHeight + rectWidth))
    }

    // map generation
    for (var idx = 0; idx < map.length-1 ; idx++) {
        var mapBlock = map[idx];
        if (mapBlock == 0) {
            continue;
        }
        else if (mapBlock == 1) {
            var triObject = new paper.Path.RegularPolygon(new paper.Point(( snapPointX + (rectWidth) * idx ) + (rectWidth * .5), 325 - (rectWidth) / 4), 3, rectWidth / 2);
            triObject.fillColor = "#D14233";
            triGp.addChild(triObject);
        }
        else if ( mapBlock == -1 ) {
            var coinObject = paper.Path.Rectangle(snapPointX + (rectWidth * idx), gameStartHeight + (rectWidth) - 10 , 10, 10);
            coinObject.strokeColor = "#f1c40f";
            coinObject.rotation = 45;
            coinGp.addChild(coinObject);
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
                var triObject = new paper.Path.RegularPolygon(new paper.Point(( snapPointX + (rectWidth) * idx ) + (rectWidth * .5), 325 - (rectWidth) / 4 - (mapBlock[mapBlock.length - 2]) * rectWidth), 3, rectWidth / 2);
                triObject.fillColor = "#D14233";
                triGp.addChild(triObject);
            }
            else if (mapBlock[mapBlock.length - 1] == -1) {
                var coinObject = paper.Path.Rectangle(snapPointX + (rectWidth * idx), gameStartHeight + (rectWidth) - ( (mapBlock[mapBlock.length - 2] +1 ) * rectWidth) + 10, 10, 10);
                coinObject.strokeColor = "#f1c40f";
                coinObject.rotation = 45;
                coinGp.addChild(coinObject);
            }
        }
    }

    // text generation
    var Text = new paper.PointText( new paper.Point(gameWidth/2 , 100 ) ) ;
    Text.justification = 'center' ;
    Text.fillColor = 'black';
    Text.content = gameObj.text  ;
    Text.fontFamily = "Ubuntu" ;
    Text.opacity = 0 ;



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
    /* ___________________________________________________________________ */

    // main loop

    paper.view.onFrame = function (evt) {
        if (isPreview ) {
            if (!previewFlag) {
                Text.opacity += .005;
                if ( Text.opacity > 1 ) {
                    previewFlag = true ;
                }
            }
            else {
                Text.opacity -= .01 ;
                if (Text.opacity <.01) {
                    isPreview = false;
                }
            }
            Text.scale(1.001) ;
        }
        else {
            if (isPlaying) {
                framesPlayed += 1;
                score.content = parseInt(framesPlayed / 10);
                coin.content = coins ;
                document.getElementById('score').innerHTML = framesPlayed;
                if (key['space']) {
                    if (isStable) {
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
                            if (rectGp.children[i].position.x > 0 && rectGp.children[i].position.x < gameWidth / 2) {
                                if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth )) {
                                    if (rectGp.children[i].position.y === rectAngle.position.y + rectWidth) {
                                        fallFlag = false;
                                        break;
                                    }
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
                            if (rectGp.children[i].position.x > 0 && rectGp.children[i].position.x < gameWidth / 2) {
                                if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth)) {
                                    if (rectAngle.position.y > (rectGp.children[i].position.y - rectWidth) && rectAngle.position.y < rectGp.children[i].position.y && jumpSinDegree > 40) {
                                        isJumping = false;
                                        isStable = true;
                                        rectAngle.rotation = 0;
                                        rectAngle.position.y = rectGp.children[i].position.y - rectWidth;
                                        currentRectHeight = rectGp.children[i].position.y - rectWidth;
                                        jumpSinDegree = 0;
                                        break;
                                    }
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
                        if (rectGp.children[i].position.x > 0 && rectGp.children[i].position.x < gameWidth / 2) {
                            if (Math.abs(rectGp.children[i].position.x - rectAngle.position.x) < ( rectWidth)) {
                                if (rectAngle.position.y > (rectGp.children[i].position.y - rectWidth) && rectAngle.position.y < rectGp.children[i].position.y) {
                                    isFalling = false;
                                    isStable = true;
                                    rectAngle.position.y = rectGp.children[i].position.y - rectWidth;
                                    currentRectHeight = rectGp.children[i].position.y - rectWidth;
                                    break;
                                }
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
                    if (rectGp.children[j].position.x > 0 && rectGp.children[j].position.x < gameWidth / 2) {
                        if (rectGpPointInsideRect(rectGp.children[j].segments[0].point) ||
                            rectGpPointInsideRect(rectGp.children[j].segments[1].point) ||
                            rectGpPointInsideRect(rectGp.children[j].segments[2].point) ||
                            rectGpPointInsideRect(rectGp.children[j].segments[3].point)) {
                            isPlaying = false;
                            isJumping = false;
                            isFalling = false;
                            isStable = true;
                            jumpSinDegree = 0;
                            rectAngle.rotation = 0;
                            coins.content = "0" ;
                            rectGpStopPoint = rectGp.position.x;
                            triGpStopPoint = triGp.position.x;
                            coinGpStopPoint = coinGp.position.x;
                            currentRectHeight = gameStartHeight + rectWidth / 2;
                            rectAngle.position.y = gameStartHeight + rectWidth / 2;
                            break;
                        }
                    }
                }
                for (var j = 0; j < triGp.children.length; j++) {
                    if (triGp.children[j].position.x > 0 && triGp.children[j].position.x < gameWidth / 2) {
                        if (pointInsideRect(triGp.children[j].segments[0].point) || pointInsideRect(triGp.children[j].segments[1].point) || pointInsideRect(triGp.children[j].segments[2].point)) {
                            isPlaying = false;
                            isJumping = false;
                            isFalling = false;
                            isStable = true;
                            jumpSinDegree = 0;
                            coins.content = "0" ;
                            rectAngle.rotation = 0;
                            rectGpStopPoint = rectGp.position.x;
                            coinGpStopPoint = coinGp.position.x;
                            currentRectHeight = gameStartHeight + rectWidth / 2;
                            triGpStopPoint = triGp.position.x;
                            rectAngle.position.y = gameStartHeight + rectWidth / 2;
                            break;
                        }
                    }
                }
                //coin collection

                for (var g = 0; g < coinGp.children.length; g++) {
                    coinGp.children[g].rotation = 45 * (Math.cos(evt.count / 10));
                    if (pointInsideRect({
                            x: ( coinGp.children[g].bounds.topRight.x) - ( cointGpInitial.x - coinGp.position.x ),
                            y: coinGp.children[g].position.y
                        })) {
                        coins.content = Number(coins.content) + 1 ;
                        isOnCoin = true ;

                    } ;
                }
                if (isOnCoin){
                    gradientPath.fillColor.gradient.stops[0].color = "rgba(241, 196, 15, .1)" ;
                    isOnCoin = false ;
                }
                else {
                    gradientPath.fillColor.gradient.stops[0].color = "rgba(255,255,255,0)"
                }
            }
            else if (!isWon) {
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
                    toggleButtons() ;
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
            // game end
            if (!isWon) {
                if (framesPlayed * speed >= (map.length * 25) + 100) {
                    isPlaying = false;
                    isWon = true;
                    var info = {score : score.content , coins: Number(coins.content)};
                    toggleMenu();
                    paper.view.attach('frame', this.onFrame);
                    paper.view.remove() ;
                    return callback(info);
                }
            }

        }

        //background move
        switch (gameObj.bgType){
            case 1 : {
                boxSymbol.definition.rotation += 1;
                smallSymbol.definition.rotation -= 1;
                gradientPath.fillColor.gradient.stops[1].rampPoint = ( Math.sin(evt.count / 50) + 9 ) / 10;
                break
            }
            case 2 : {
                boxSymbol.definition.rotation  = (Math.sin(evt.count/50)  )*180  ;
                smallSymbol.definition.rotation = - (Math.sin(evt.count/100)  )*180;
                gradientPath.fillColor.gradient.stops[1].rampPoint = ( Math.sin(evt.count / 50) + 9 ) / 10;
            }
        }

    };
} ;