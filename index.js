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
    var $spinner = $(".spinner") ;

    wrapperElem.style.height = window.innerHeight + "px" ;
    canvasElem.style.left = ((window.innerWidth - 600)/2) + "px" ;
    canvasElem.style.top = ((window.innerHeight- 400) /2) + "px" ;
    menuElem.style.top = ((window.innerHeight- 400) /2) + "px" ;
    menuElem.style.left =  ((window.innerWidth - 600)/2) + "px" ;
    $spinner.css('left', ((window.innerWidth - 600)/2) + "px") ;
    //$spinner.css('top', ((window.innerHeight- 400) /2) + "px") ;

    var toggleMenu = function () {
        if ( canvasElem.style.transform == "rotateY(0deg)" ) {
            menuElem.style.transform = "rotateY(0deg)" ;
            menuElem.style.opacity = "1" ;
            canvasElem.style.transform = "rotateY(180deg)" ;
        }
        else {
            canvasElem.style.transform = "rotateY(0deg)" ;
            menuElem.style.opacity = "0" ;
            menuElem.style.transform = "rotateY(180deg)" ;
        }
    } ;


    setTimeout(function () {
        //$spinner.css('opacity' , '0') ;
    } , 1000) ;

    $('.level').click(function () {
        $('.level').removeClass('btn-danger').addClass('btn-primary') ;
        $(this).removeClass('btn-primary').addClass('btn-danger');
    }) ;

    document.getElementById('test').onclick = function () {
        toggleMenu()
    } ;

    console.log(window.innerHeight) ;
    document.getElementById('start').onclick = function () {
        game({
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
            map : [ 0,0,0,0,0,0,0,0,0, 0, 0,0,0,0,0, 0 ,
                [0,2 ,0]  , [0,2,0]  , [0,2,-1]  , [0,2,0]  , [0,2,0]  , [0,2,0]  ,[0,4,0],[0,4,0],[0,4,0],[0,4,0],[0,4,0],[0,4,0],[0,2,0]  , [0,2,0] ,[0,2,0]  , [0,2,0]
                ,1 , 1 ,0 ,0,0, 0,0,0,0,0,0,
                [0,1,0] , 1 , [0,3,0] , 1 , [0,5,0] , 1 ,
                0,0,0,0,0,0,0,0,
                [0,1,0],1,1,[0,2,0],1,1,[0,3,0],1,1,[0,4,0]
            ]
        })
        console.log(game.speed) ;
    }

} ;