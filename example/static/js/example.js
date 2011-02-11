var canvas,
	cubes = [],
	cubeTransform,
	axis,
	axisTransform,
	d = 400,				// Distance eye is from screen
	far = 10000;			// Far clipping plane

var mouseX = undefined,
	mouseY = undefined,
	angleIncrement = 5;
	
$(document).ready(function(){
	canvas = document.getElementById("canvas1");
	
	/*
	 * Set up cubes
	 */
	cubes[0] = new Simple3dPolygon([
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
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 0, 0, 0);
	
	for(var i = 1, max = 8; i < max; i++) {
		cubes[i] = new Simple3dPolygon(cubes[0]);
		cubes[i].transform(cubeTransform);
	}
	cubes[0].transform(cubeTransform);
	
	cubes[1].origin = new Simple3dCoord(-75, 75, -175);
	cubes[2].origin = new Simple3dCoord(-75, -75, -175);
	cubes[3].origin = new Simple3dCoord(75, -75, -175);
	cubes[4].origin = new Simple3dCoord(75, 75, 175);
	cubes[5].origin = new Simple3dCoord(-75, 75, 175);
	cubes[6].origin = new Simple3dCoord(-75, -75, 175);
	cubes[7].origin = new Simple3dCoord(75, -75, 175);
	
	/*
	 * Set up axis
	 */
	axis = new Simple3dPolygon([
		new Simple3dEdge(new Simple3dCoord(-1,0,0), new Simple3dCoord(1,0,0)),
		new Simple3dEdge(new Simple3dCoord(0,-1,0), new Simple3dCoord(0,1,0)),
		new Simple3dEdge(new Simple3dCoord(0,0,-1), new Simple3dCoord(0,0,1))
		],
		new Simple3dCoord(0,0,0));
	
	axisTransform = new Simple3dTransform(45, 45, 45, 100,100,100,0,0,0);
	axis.transform(axisTransform);
	
	setProjections();
	
	/*
	 * Event handlers
	 */
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
	
	/*
	 * Render loop
	 */
	setInterval(function(){
        loop(canvas);
    }, 1000 / 30);
});

function setProjections() {
	var	near = d;
	
	for(var i = 0, max = cubes.length; i < max; i++) {
		cubes[i].setProjection(d, far, near, canvas.width, canvas.height); 
	}
	axis.setProjection(d, far, near, canvas.width, canvas.height);
}

function loop() {
	var	renderOptions = {labelVertices: true};
		
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
    
    for(var i = 0, max = cubes.length; i < max; i++) {
    	cubes[i].drawPath(graphics, renderOptions);
    	graphics.stroke();	
    }
    
    axis.drawPath(graphics, renderOptions);
    graphics.stroke();
    
    graphics.restore();
    
    graphics.restore();
}

function onDocumentMouseMove(event){
	if(undefined !== mouseX) {
		var deltaX = event.offsetX - mouseX,
			deltaY = event.offsetY - mouseY,
			rotationX = 0,
			rotationY = 0;
		
		if(deltaX != 0) {
			if(deltaX >= 0) {
				rotationY +=angleIncrement;
			}
			else {
				rotationY -= angleIncrement;
			}
		}
		
		if(deltaY != 0) {
			if(deltaY >= 0) {
				rotationX +=angleIncrement;
			}
			else {
				rotationX -= angleIncrement;
			}
		}
		
		if(0 != rotationX || 0 != rotationY) {
			var cubeTransform = new Simple3dTransform(rotationX,rotationY,0, 1, 1, 1, 0, 0, 0);
			
			for(var i = 0, max = cubes.length; i < max; i++) {
    			cubes[i].transform(cubeTransform);
			}
    
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
		d += 1;
	}
	else {
		d -= 1;
	}
	
	console.log(" d = " + d);
	setProjections();
}
