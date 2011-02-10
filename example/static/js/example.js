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
new Simple3dCoord(100, 100, 100));

var cube2 = new Simple3dPolygon(cube);

var cubeTransform = new Simple3dTransform(0,0,0, 50, 50, 50, 0, 0, 0);
cube.transform(cubeTransform);

cubeTransform = new Simple3dTransform(0,0,0, 25, 25, 25, 0, 0, 0);
cube2.transform(cubeTransform);
cube2.origin = new Simple3dCoord(400, 100, 100);

var axis = new Simple3dPolygon([
	//[new Simple3dEdge(new Simple3dCoord(-1,0,0), new Simple3dCoord(1,0,0)),
	//new Simple3dEdge(new Simple3dCoord(0,-1,0), new Simple3dCoord(0,1,0)),
	new Simple3dEdge(new Simple3dCoord(0,0,-1), new Simple3dCoord(0,0,1))
	],
new Simple3dCoord(0,0,0)
)

var axisTransform = new Simple3dTransform(0, 0, 0, 25,25,25,0,0,0);
axis.transform(axisTransform);

//cube2.transform(cubeTransform);

var d = 0;

function loop(canvas) {
	var graphics = canvas.getContext('2d');

	graphics.save();
		
    /*
     * Render canvas
     */
    graphics.clearRect(0, 0, canvas.width, canvas.height);

    graphics.translate(canvas.width/2, canvas.height/2);
    //cube.render(graphics, d);
    //cube2.render(graphics, d);
    
    axis.render(graphics, d);
    
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
			
			//cubeTransform = new Simple3dTransform(-xInc,-yInc,0, 1, 1, 1, 0, 0, 0);
			cube2.transform(cubeTransform);
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
