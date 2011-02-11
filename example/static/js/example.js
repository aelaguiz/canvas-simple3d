$(document).ready(function(){
	var canvas = document.getElementById("canvas1");
	
	setInterval(function(){
        loop(canvas);
    }, 1000 / 30);
    
    canvas.onmousemove = function(event){
		onDocumentMouseMove(event)
	};
	canvas.onmousedown = function(event){
		onDocumentMouseDown(event);
	};
	canvas.onmouseup = function(event){
		onDocumentMouseUp(event);
	};
	canvas.onmousewheel = function(event){
		onDocumentMouseWheel(event);
	};
});

var rotationX = 0;
var rotationY = 0;

var cube = new Simple3dPolygon([
new Simple3dEdge(new Simple3dCoord(-1, 1, 1), new Simple3dCoord(1, 1, 1)), new Simple3dEdge(new Simple3dCoord(1, -1, 1)), 
		new Simple3dEdge(new Simple3dCoord(-1, -1, 1)), new Simple3dEdge(new Simple3dCoord(-1, 1, 1)), // back face
		new Simple3dEdge(new Simple3dCoord(-1, 1, -1)), // top left edge
new Simple3dEdge(new Simple3dCoord(1, 1, -1)), new Simple3dEdge(new Simple3dCoord(1, -1, -1)), 
		new Simple3dEdge(new Simple3dCoord(-1, -1, -1)), new Simple3dEdge(new Simple3dCoord(-1, 1, -1)), // front face
new Simple3dEdge(new Simple3dCoord(-1,-1,-1),new Simple3dCoord(-1,-1,1)), // bottom left edge
new Simple3dEdge(new Simple3dCoord(1,-1,-1),new Simple3dCoord(1,-1,1)), // bottom right edge
new Simple3dEdge(new Simple3dCoord(1,1,-1),new Simple3dCoord(1,1,1)) // top right edge
],
new Simple3dCoord(75, 75, -175));

var cube2 = new Simple3dPolygon(cube);
var cube3 = new Simple3dPolygon(cube);
var cube4 = new Simple3dPolygon(cube);
var cube5 = new Simple3dPolygon(cube);
var cube6 = new Simple3dPolygon(cube);
var cube7 = new Simple3dPolygon(cube);
var cube8 = new Simple3dPolygon(cube);

var cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 0, 0, 0);
cube.transform(cubeTransform);
cube2.transform(cubeTransform);
cube3.transform(cubeTransform);
cube4.transform(cubeTransform);
cube5.transform(cubeTransform);
cube6.transform(cubeTransform);
cube7.transform(cubeTransform);
cube8.transform(cubeTransform);

cube2.origin = new Simple3dCoord(-75, 75, -175);
cube3.origin = new Simple3dCoord(-75, -75, -175);
cube4.origin = new Simple3dCoord(75, -75, -175);
cube5.origin = new Simple3dCoord(75, 75, 175);
cube6.origin = new Simple3dCoord(-75, 75, 175);
cube7.origin = new Simple3dCoord(-75, -75, 175);
cube8.origin = new Simple3dCoord(75, -75, 175);

var axis = new Simple3dPolygon([
	new Simple3dEdge(new Simple3dCoord(-1,0,0), new Simple3dCoord(1,0,0)),
	new Simple3dEdge(new Simple3dCoord(0,-1,0), new Simple3dCoord(0,1,0)),
	new Simple3dEdge(new Simple3dCoord(0,0,-1), new Simple3dCoord(0,0,1))
	],
new Simple3dCoord(0,0,0)
)

var axisTransform = new Simple3dTransform(45, 45, 45, 100,100,100,0,0,0);
axis.transform(axisTransform);

//cube2.transform(cubeTransform);

var d = 400;

function loop(canvas) {
	var far = 10000,
		near = d,
		renderOptions = {labelVertices: true};
		
	var graphics = canvas.getContext('2d');

	graphics.save();
		
    /*
     * Render canvas
     */
    graphics.clearRect(0, 0, canvas.width, canvas.height);

	graphics.strokeStyle = 'rgb(255,240,240)';
    graphics.beginPath();
    for(var x = 0; x < canvas.width; x+= 10) {
    	for(var y = 0; y < canvas.height; y += 10) {
    		graphics.moveTo(x, 0);
    		graphics.lineTo(x, canvas.height);
    		
    		graphics.moveTo(0, y);
    		graphics.lineTo(canvas.width, y);
    	}
    }
    graphics.stroke();
    
    graphics.strokeStyle = 'rgb(0,0,0)';
	graphics.save();
    graphics.translate(canvas.width/2, canvas.height/2);
    /*cube.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube2.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube3.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube4.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);*/
   	cube5.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube6.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube7.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
   	cube8.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
    
    axis.render(graphics, d, far, near, canvas.width, canvas.height, renderOptions);
    graphics.restore();
    
    graphics.restore();
}


var mouseX = undefined;
var mouseY = undefined;

var inc = 5;


function onDocumentMouseMove(event){
	if(undefined !== mouseX) {
		var deltaX = event.offsetX - mouseX;
		var deltaY = event.offsetY - mouseY;
		
		var xInc = 0;
		var yInc = 0;
		
		if(deltaX != 0) {
			if(deltaX >= 0) {
				yInc = inc;
				rotationY +=inc;
			}
			else {
				rotationY -= inc;
				yInc = -inc;
			}
				
			if(rotationY < 0)
				rotationY = 0;
				
			else if(rotationY > 180)
				rotationY = 180;
		}
		
		if(deltaY != 0) {
			if(deltaY >= 0) {
				xInc = inc;
				rotationX +=inc;
			}
			else {
				xInc = -inc;
				rotationX -= inc;
			}
				
			if(rotationX < 0)
				rotationX = 0;
				
			else if(rotationX > 180)
				rotationX = 180;
		}
		
		if(0 != xInc || 0 != yInc) {
			var cubeTransform = new Simple3dTransform(xInc,yInc,0, 1, 1, 1, 0, 0, 0);
			cube.transform(cubeTransform);
			cube2.transform(cubeTransform);
			
			//cubeTransform = new Simple3dTransform(-xInc,-yInc,0, 1, 1, 1, 0, 0, 0);
			cube3.transform(cubeTransform);
			cube4.transform(cubeTransform);
			cube5.transform(cubeTransform);
			cube6.transform(cubeTransform);
			cube7.transform(cubeTransform);
			cube8.transform(cubeTransform);
			
			axis.transform(cubeTransform);
		}
	}
	
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function onDocumentMouseDown(event){

}

function onDocumentMouseUp(event){
    
}

function onDocumentMouseWheel(event) {
	if(event.wheelDelta > 0) {
		rotationY +=10;
		d += 1;
	}
	else {
		rotationY -= 10;
		d -= 1;
	}
	
	console.log(" d = " + d);
		
	if(rotationY < 0)
		rotationY = 0;
		
	else if(rotationY > 180)
		rotationY = 180;
}
