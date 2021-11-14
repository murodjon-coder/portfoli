'use strict';
// t.me/Ziyovuddin_web  
/* Draws and rotates a lissajous curve.
 *A lissajous curve is a graph of the following two parametric equations: 
 * 
 * x = Asin(at+?)  --------- (1)
 * y = Bsin(bt)    --------- (2)
 * 
 * In the constructor: 
 *  A is this.relativeWidth
 *  B is this.relativeHeight
 *  a is this.numHorizontalTangents
 *  b is this.numVerticalTangents
 *  ? is this.rotationAngle
 *  t is this.parameter
 */
class Lissajous
{
    constructor(data)
    {         
        this.heightOffSet   = data.heightOffset; 
        this.screenHeight   = data.screenHeight;  
        this.screenWidth    = data.screenWidth; 
        /* The ratio this.relativeWidth/this.relativeHeight determines the relative width-to-height ratio of the curve.  
         * For example, a ratio of 2/1 produces a figure that is twice as wide as it is high.*/
        this.relativeWidth  = data.relativeWidth;//relative width of the curve to the height; 
        this.relativeHeight = data.relativeHeight;//relative height of the curve to the width; 
        /*Visually, the ratio this.numHorizontalTangents/this.numVerticalTangents determines the number of "lobes" of the figure. 
         *For example, a ratio of 3/1 or 1/3 produces a figure with three major lobes.*/ 
        this.numHorizontalTangents = data.numXTan;//number of horizontal tangents(lobes) to the curve 
        this.numVerticalTangents = data.numYTan;//number of vertical tangents(lobes) to the curve  
        this.deltaAngle = 0.5; //adjusts the rotation angle
        /*this.rotationAngle is the phase shift for the lissajous curve. 
         *It determines the apparent "rotation" angle of the figure, viewed as if it were actually a three-dimensional curve.*/ 
        this.rotationAngle = -Math.PI + this.deltaAngle;//phase shift 
        this.parameter  = 0;//the parameter, (t) in the parametric equation 
        this.xCoord = data.xCoord;//set x coordinate of the center of the curve  
        this.yCoord = data.yCoord;//set y coordinate of the center of the curve   
        this.step = 629;//700; //controls the drawing of the curve. A step from 0 to 629 draws the curve.   
        this.color  =  data.color;//stroke color  
        this.fillStyle = 'white';//fill color 
        this.currentOrbitalPoint = {index:0,x:0,y:0};//coordinates of the small circle that moves along the curve 
    }  
    getColor() 
    {    
        return this.color; 
    }   
    drawCircle(ctx,point)//draws the small circles that move along the curve
    {     
        let radius  = 1; 
        let color   = 'white'; 
        let colors  = [`rgba(255,255,255,1)`,`rgba(255,255,255,0.6)`,`rgba(255,255,255,0.2)`];//white colors 
        for(let i = 0; i < 3; i++)
        { 
            switch(i)//create three circles with same center
            {
                case 0:   
                    color = colors[i]; 
                    break; 
                case 1: 
                    radius+=  2;//bigger circle 
                    color = colors[i];               
                    break; 
                case 2: 
                    radius+=  3;//biggest circle 
                    color = colors[i];               
                    break; 
            }
            //draw the circle
            ctx.beginPath(); 
            ctx.arc(point.x,point.y,radius,0,2*Math.PI);
            ctx.fillStyle = color; 
            ctx.fill();  
        } 
    }  
    draw(ctx)//animates the drawing and rotation of the curve
    {  
        let rodPosition = [];//the coordinates of the points at which rods are attached to the curve 
        this.parameter = 0;//reset parameter 
        ctx.beginPath(); 
        ctx.lineWidth = 0.3;
        ctx.strokeStyle = this.getColor(); 
        for(let i = 0; i <  this.step;i++)//draw the complete curve 
        {  
            this.parameter+=0.01;   
            //Apply Lissajous Parametric Equations
            /*this.xCoord is added to the first equation.
             *this.yCoord is added to the second equation. 
             *This is so the curve is centered at (this.xCoord,this.yCoord) position on the canvas.*/
            let x = (this.relativeWidth  * Math.sin(this.numHorizontalTangents*this.parameter + this.rotationAngle))+this.xCoord;//first equation  
            let y = (this.relativeHeight * Math.sin(this.numVerticalTangents*this.parameter))+this.yCoord;//second equation  
            ctx.lineTo(x,y);   
            if(i % 10 === 0)//attach a rod at this point
            {
                rodPosition.push({x:x,y:y});
            }
            if(this.currentOrbitalPoint.index ===   this.step  - 1 )//if last iteration
            {
                this.currentOrbitalPoint.index = 0;//reset the index 
            }  
            if(this.currentOrbitalPoint.index === i )//update the positon of the circle that orbits the curve.
            {   
                this.currentOrbitalPoint.x = x;  
                this.currentOrbitalPoint.y = y;
            }  
        }   
        ctx.stroke(); 
        ctx.fillStyle = 'rgba(255,255,255,0.05)';//transparent white
        ctx.fill(); 
        ctx.closePath();  
        this.currentOrbitalPoint.index++;//move the circle along the curve
        //draw the circle that orbits the curve
        this.drawCircle(ctx,{x:this.currentOrbitalPoint.x, y:this.currentOrbitalPoint.y});  
        for(let k = 0;k < rodPosition.length;k++)//draw the rods that are attached to the curve
        {  
            this.drawLine(ctx,rodPosition[k],rodPosition[rodPosition.length-1-k]); 
            this.drawLine(ctx,rodPosition[k],rodPosition[rodPosition.length-5-k]);
            if(k > rodPosition.length/2)
            {
                break; 
            } 
        }    
        this.rotationAngle += 0.01;//increase rotation angle
        if(this.rotationAngle > Math.PI + this.deltaAngle)//if rotation is complete
        { 
            this.rotationAngle = -Math.PI + this.deltaAngle;//reset rotation angle
        }   
    }
    drawLine(ctx,point1,point2)//draws the rods
    {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 0.3; 
        ctx.beginPath();  
        ctx.moveTo(point1.x,point1.y);  
        ctx.lineTo(point2.x,point2.y);   
        ctx.stroke();
        ctx.closePath();
    }      
    resize(screenWidth,screenHeight)
    {   
        if(this.screenHeight !== screenHeight || this.screenWidth !== screenWidth)//if the screen size has changed
        {    
            let dy              = screenHeight/this.screenHeight;//percentage change in browser window height 
            let dx              = screenWidth/this.screenWidth;//percentage change in browser window width  
            this.screenHeight   = screenHeight;  
            this.screenWidth    = screenWidth; 
            this.xCoord *= dx; 
            this.yCoord *= dy;  
            
            this.relativeWidth *= dx;//relative width of the curve to the height; 
            this.relativeHeight *= dy;//relative height of the curve to the width; 
            if(this.relativeHeight > 200 + this.heightOffSet)
            {  
                this.relativeHeight = 200 + this.heightOffSet; 
            }   
            if(this.relativeWidth > 200)
            {
                this.relativeWidth = 200; 
            }
             
        } 
    }  
}

//Set everything up
function getBrowserWindowSize() 
{
    let win = window,
    doc = document,
    offset = 20,//
    docElem = doc.documentElement,
    body = doc.getElementsByTagName('body')[0],
    browserWindowWidth = win.innerWidth || docElem.clientWidth || body.clientWidth,
    browserWindowHeight = win.innerHeight|| docElem.clientHeight|| body.clientHeight;  
    return {x:browserWindowWidth-offset,y:browserWindowHeight-offset}; 
} 
function onWindowResize()//called every time the window gets resized. 
{  
    windowSize = getBrowserWindowSize();
    c.width = windowSize.x; 
    c.height = windowSize.y; 
    SCREEN_WIDTH = windowSize.x;
    SCREEN_HEIGHT = windowSize.y;   
    curves.forEach(function(curve)//let curves respond to window resizing  
    { 
        curve.resize(SCREEN_WIDTH,SCREEN_HEIGHT); 
    });  
}
function updateCanvas()
{
    ctx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);    
    ctx.fillStyle   = 'black';  
    ctx.fillRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
}  
//gets the relative height and relative width of the curve, assuming that the the window was in 
//fullscreen mode and is now reduced to it's present dimensions
function getCurveDimensions(inputRelativeWidth,inputRelativeHeight)
{
    let fullScreenWidth = 1346;//assumed browser window width of device
    let fullScreenHeight = 644;//assumed browser window height of device 
    let dy  = SCREEN_HEIGHT/fullScreenHeight;//percentage change in browser window height 
    let dx  = SCREEN_WIDTH/fullScreenWidth;//percentage change in browser window width  
    let relativeWidth = inputRelativeWidth * dx; 
    let relativeHeight = inputRelativeHeight * dy; 
    return {w:relativeWidth,h:relativeHeight};   
}
function createCurves()
{ 
    let 
    lissajousCurves = [],   
    numOfNestedCurves = 10,
    //position the curve at the center of the canvas
    xCoord = SCREEN_WIDTH/2,//x-coordinate of curve center  
    yCoord = SCREEN_HEIGHT/2,//y-coordinate of curve center 
    numHorizontalTangents = 2,//number of horizontal tangents(lobes) to the curve 
    numVerticalTangents = 1,//number of vertical tangents(lobes) to the curve
    unitOffset = 10,
    relativeWidth  = 200,//default relative width of the curve to the height
    relativeHeight = 200;//default relative height of the curve to the width
    for(let j=0;j < numOfNestedCurves; j++)  
    {    
        let dimensions = getCurveDimensions(relativeWidth,relativeHeight + (j*unitOffset)) ;
        let data = 
        {       
            heightOffset: j*unitOffset, 
            relativeWidth: dimensions.w,
            relativeHeight:dimensions.h,  
            numXTan:numHorizontalTangents,
            numYTan:numVerticalTangents,
            rotationAngle: -Math.PI, 
            xCoord: xCoord,
            yCoord: yCoord, 
            screenWidth: SCREEN_WIDTH,
            screenHeight: SCREEN_HEIGHT,
            color: 'white' //stroke color 
        }; 
        lissajousCurves.push(new Lissajous(data)); 
    }    
    return lissajousCurves; 
}  
let browserWindowSize   = getBrowserWindowSize(),
c   = document.getElementById("orbit8Canvas"),
ctx = c.getContext("2d"); 
//set size of canvas
c.width = browserWindowSize.x; 
c.height = browserWindowSize.y; 
let 
SCREEN_WIDTH = browserWindowSize.x,
SCREEN_HEIGHT = browserWindowSize.y,   
curves = createCurves(),  
lastTime = 100,  
windowSize;   
window.addEventListener('resize',onWindowResize); 
function doAnimationLoop(timestamp)
{           
    updateCanvas(); 
    let deltaTime  = timestamp - lastTime; 
        lastTime   = timestamp;
    curves.forEach(function(curve)
    {   
        curve.draw(ctx); 
    });  
    requestAnimationFrame(doAnimationLoop); 
} 
requestAnimationFrame(doAnimationLoop);


