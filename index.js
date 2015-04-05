window.onload = function () {
    /*
     TODO : Optimize : if x > 0
     TODO : Optimize : store in a list / remove from layer                            - DONE
     --------------------------------
     TODO : replace collision with paperjs Intersection
     TODO : Jump fom under a block / box collision /                                    - DONE
     */
    /* ---------------------------------------------- INITIAL STYLING ------------------------------------------------------ */
    var wrapperElem = document.getElementById('wrapper') ;
    var menuElem = document.getElementById('menu') ;
    var canvasElem = document.getElementById('paper') ;
    var $canvas = $("#paper") ;
    var $spinner = $(".spinner") ;
    var retry = $("#retry") ;
    $back = $("#back") ;
    $('input, button').focus(function() {
        this.blur();
    });
    for (var i=1 ;i < 5 ;  i++ ) {
        console.log(i in localStorage);
        if (! (i in localStorage)) {
            localStorage[i] = "0|0" ;
            alert(localStorage[i])
        }
    }

    wrapperElem.style.height = window.innerHeight + "px" ;
    canvasElem.style.left = ((window.innerWidth - 600)/2) + "px" ;
    canvasElem.style.top = ((window.innerHeight- 400) /2) + "px" ;
    menuElem.style.top = ((window.innerHeight- 400) /2) + "px" ;
    menuElem.style.left =  ((window.innerWidth - 600)/2) + "px" ;
    $spinner.css('left', ((window.innerWidth -100)/2) + "px") ;
    $spinner.css('top', ((window.innerHeight-450) /2) + "px") ;
    $back.css({
        top : window.innerHeight/2 + 220 ,
        left : window.innerWidth/2 - 200
    }) ;
    retry.css({
        top : window.innerHeight/2 + 220 ,
        left : window.innerWidth/2
    }) ;

    toggleMenu = function () {
        if ( canvasElem.style.transform == "rotateY(0deg)" ) {
            menuElem.style.transform = "rotateY(0deg)" ;
            menuElem.style.opacity = "1" ;
            canvasElem.style.opacity = "0" ;
            canvasElem.style.transform = "rotateY(180deg)" ;
        }
        else {
            canvasElem.style.transform = "rotateY(0deg)" ;
            menuElem.style.opacity = "0" ;
            canvasElem.style.opacity = "1" ;
            menuElem.style.transform = "rotateY(180deg)" ;
        }
    } ;

    toggleButtons = function () {
        if (retry.css('top') == window.innerHeight/2 + "px") {
            $back.css({
                top : window.innerHeight/2 + 220 ,
                left : window.innerWidth/2 - 200
            }).attr("disabled", true);
            retry.css({
                top : window.innerHeight/2 + 220 ,
                left : window.innerWidth/2
            }).attr("disabled", true);
        }
        else {
            $back.css({
                top : window.innerHeight/2
            }).attr("disabled", false);
            retry.css({
                top : window.innerHeight/2
            }).attr("disabled", false);
        }
    } ;

    var setScore = function () {
        for (var i=1  ; i < 5 ; i ++ ) {
            $("button[data-level=" + i + "]").html("Level " + i + " |<span style='font-size: 9px'> Score : <span class='badge'>" + localStorage[i].split("|")[0] + " </span>| " + localStorage[i].split("|")[1] + " Attempts </span>") ;
        }
    }() ;

    setTimeout(function () {
        $spinner.css('opacity' , '0') ;
        setTimeout(function () {
            menuElem.style.opacity = 1 ;
        } , 500)
    } , 1000 ) ;

    $('.level').click(function () {
        $(this).blur() ;
        $('.level').removeClass('btn-danger').addClass('btn-primary') ;
        $(this).removeClass('btn-primary').addClass('btn-danger');
    }) ;

    document.getElementById('test').onclick = function () {
        toggleButtons()
    } ;
    console.log(localStorage) ;


    /* __________________________________________ GAME ________________________________________ */
    var gameLevels = {
        1 : {
            jumpRotationOffset : 10 ,
            gameStartHeight : 300 ,
            snapPointX : 50 ,
            gameWidth : 600 ,
            gameHeight : 400 ,
            rectWidth : 25 ,
            jumpHeight : 50,
            speed : 4 ,
            gameEndFrameDuration : 15,
            gameResumeFrameDuration :15 ,
            text : "This Will Be Easy, Have Faith In Yourself ." ,
            map : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,0,0,0,1,0,0,0,0, 0, 0,0,1,0,0, [0,2 ,0]  ,0,0, 0 ,0,0, 0 ,0,0, 0,0,0,0,0,0,0,0
            ]
        } ,
        2 : {
            jumpRotationOffset : 10 ,
            gameStartHeight : 300 ,
            snapPointX : 50 ,
            gameWidth : 600 ,
            gameHeight : 400 ,
            rectWidth : 25 ,
            jumpHeight : 50,
            speed : 4 ,
            gameEndFrameDuration : 15,
            gameResumeFrameDuration :15 ,
            text : "This Will Be Easy, Have Faith In Yourself" ,
            map : [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,0,0,0,1,0,0,0,0, 0, 0,0,1,0,0, 0 ,0,0, 0 ,0,0, 0 ,0,0, 0,0,0,0,0,0,0,0,
                [0,2 ,0]  , [0,2,0]  ,[0,2 ,0]  , [0,2 ,0]  , [0,2,0]  ,[0,2 ,0]  , [0,2,0]  , [0,2,-1]  , [0,2,1]  , [0,2,-1]  , [0,2,0]  ,[0,2,0]  ,[0,2,0]  ,[0,2,0]  ,[0,2,0]
                ,0,0,0,0, 1 ,0 ,0,0, 0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,
                [0,1,0] , 1 , [0,3,0] , 1 , [0,5,0] , 1 ,
                0,0,0,0,0,0,0,0,0,0,0,0,
                [0,1,0],1,1,[0,2,0],1,1,[0,3,0],1,1,[0,4,0] ,
                0,0,0,0,0,0,0,0,10
            ]
        }
    } ;
    $("#start").click(function () {
        toggleMenu() ;
        var g = new game(gameLevels[$("button.btn-danger").attr('data-level') ] , function (info) {
            console.log(info) ;
            localStorage[$("button.btn-danger").attr('data-level')] = info.coins.toString() + "|" + ( Number(localStorage[$("button.btn-danger").attr('data-level')].split("|")[1]) + 1 ).toString() ;
            console.log(localStorage) ;
            $('body').prepend('<canvas id="paper" width="600" height="400"></canvas>') ;
            canvasElem = document.getElementById('paper') ;
            canvasElem.style.left = ((window.innerWidth - 600)/2) + "px" ;
            canvasElem.style.top = ((window.innerHeight- 400) /2) + "px" ;
            setScore() ;
        }) ;
    }) ;


} ;