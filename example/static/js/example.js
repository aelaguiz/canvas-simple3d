var canvas,
	curves = [],
	cubes = [],
	text = [],
	axis,
	axisTransform,
	origin,
	d = 400,				// Distance eye is from screen
	far = 10000;			// Far clipping plane

var mouseX = undefined,
	mouseY = undefined,
	mouseDown = false,
	angleIncrement = 5,
	rotationX =0,
	rotationY = 0,
	vertexLabels = false,
	fill = false,
	color = undefined;
	
$(document).ready(function(){
	var initX = 45,
		initY = 45,
		initZ = 45;
		
	canvas = document.getElementById("canvas1");
	
	setRandomColor();
	
	origin = new Simple3dCoord(0, 0, 0);

	text[0] = new Simple3dText("Amir", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 12}, origin);
	text[1] = new Simple3dText("Was", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 12}, origin);
	text[2] = new Simple3dText("Here", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 12}, origin);
	
	text[3] = new Simple3dText("t - Toggle vertex labels", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	text[4] = new Simple3dText("o - Orbit", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	text[5] = new Simple3dText("s - Stop Rotation", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	text[6] = new Simple3dText("f - Toggle fill", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	text[7] = new Simple3dText("c - Random color", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	text[8] = new Simple3dText("wheel - Redpill", 0, {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 8}, origin);
	
	var textTransform = new Simple3dTransform(initX,initY,initZ, 5, 5, 5, -100, -100, 100);
	text[0].transform(textTransform);
	
	textTransform = new Simple3dTransform(initX,initY,initZ, 5, 5, 5, 0, 0, 0);
	text[1].transform(textTransform);
	
	textTransform = new Simple3dTransform(initX,initY,initZ, 5, 5, 5, 100, 100, -100);
	text[2].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -45, 0);
	text[3].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -65, 0);
	text[4].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -85, 0);
	text[5].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -105, 0);
	text[6].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -125, 0);
	text[7].transform(textTransform);
	
	textTransform = new Simple3dTransform(0,0,0, 3, 3, 3, -550, -145, 0);
	text[8].transform(textTransform);
	
	/*
	 * Set up curves
	 */
	curves[0] = new Simple3dPolygon([
					new Simple3dQuadraticCurve(new Simple3dCoord(-1, 0, 0), new Simple3dCoord(0, 1, 0), new Simple3dCoord(1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0, -1, 0), new Simple3dCoord(-1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0, 0, -1), new Simple3dCoord(1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0, 0, 1), new Simple3dCoord(-1, 0, 0)),
					
					new Simple3dQuadraticCurve(new Simple3dCoord(0.707106781, 0.707106781, 0.707106781), new Simple3dCoord(1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0.707106781, 0.707106781, -0.707106781), new Simple3dCoord(-1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0.707106781, -0.707106781, 0.707106781), new Simple3dCoord(1, 0, 0)),
					new Simple3dQuadraticCurve(new Simple3dCoord(0.707106781, -0.707106781, -0.707106781), new Simple3dCoord(-1, 0, 0)),
					
					],
					origin);
					
	curves[1] = new Simple3dPolygon([
					new Simple3dBezierCurve(
					new Simple3dCoord(-1, 0, 0), new Simple3dCoord(-1, 1, 0), new Simple3dCoord(1, 1, 0), new Simple3dCoord(1, 0, 0)),
					new Simple3dBezierCurve(	 new Simple3dCoord(1, -1, 0), new Simple3dCoord(-1, -1, 0), new Simple3dCoord(-1, 0, 0)),
					new Simple3dBezierCurve(	 new Simple3dCoord(-1, 0, -1), new Simple3dCoord(1, 0, -1), new Simple3dCoord(1, 0, 0)),
					new Simple3dBezierCurve(	 new Simple3dCoord(1, 0, 1), new Simple3dCoord(-1, 0, 1), new Simple3dCoord(-1, 0, 0)),
					
					new Simple3dBezierCurve(new Simple3dCoord(-0.707106781, 0.707106781, 0.707106781), new Simple3dCoord(0.707106781, 0.707106781, 0.707106781), new Simple3dCoord(1, 0, 0)),
					new Simple3dBezierCurve(new Simple3dCoord(0.707106781, 0.707106781, -0.707106781), new Simple3dCoord(-0.707106781, 0.707106781, -0.707106781), new Simple3dCoord(-1, 0, 0)),
					new Simple3dBezierCurve(new Simple3dCoord(-0.707106781, -0.707106781, 0.707106781), new Simple3dCoord(0.707106781, -0.707106781, 0.707106781), new Simple3dCoord(1, 0, 0)),
					new Simple3dBezierCurve(new Simple3dCoord(0.707106781, -0.707106781, -0.707106781), new Simple3dCoord(-0.707106781, -0.707106781, -0.707106781), new Simple3dCoord(-1, 0, 0)),

					
					
					],
					origin);
					
	var curveTransform = new Simple3dTransform(initX,initY,initZ, 35, 35, 35, 75, 75, 0);
	curves[0].transform(curveTransform);
	
	curveTransform = new Simple3dTransform(initX,initY,initZ, 35, 35, 35, -75, 75, 0);
	curves[1].transform(curveTransform);
	
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
		origin);
	
	for(var i = 1, max = 8; i < max; i++) {
		cubes[i] = new Simple3dPolygon(cubes[0]);
	}
	
	var cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, 75, 75, -125);
	cubes[0].transform(cubeTransform);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, -75, 75, -125);
	cubes[1].transform(cubeTransform);
	//cubes[1].origin = new Simple3dCoord(-75, 75, -125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, -75, -75, -125);
	cubes[2].transform(cubeTransform);
	//cubes[2].origin = new Simple3dCoord(-75, -75, -125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, 75, -75, -125);
	cubes[3].transform(cubeTransform);
	//cubes[3].origin = new Simple3dCoord(75, -75, -125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, 75, 75, 125);
	cubes[4].transform(cubeTransform);
	//cubes[4].origin = new Simple3dCoord(75, 75, 125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, -75, 75, 125);
	cubes[5].transform(cubeTransform);
	//cubes[5].origin = new Simple3dCoord(-75, 75, 125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, -75, -75, 125);
	cubes[6].transform(cubeTransform);
	//cubes[6].origin = new Simple3dCoord(-75, -75, 125);
	
	cubeTransform = new Simple3dTransform(initX,initY,initZ, 15, 15, 15, 75, -75, 125);
	cubes[7].transform(cubeTransform);
	//cubes[7].origin = new Simple3dCoord(75, -75, 125);
	
	/*
	 * Set up axis
	 */
	axis = new Simple3dPolygon([
		new Simple3dEdge(new Simple3dCoord(-1,0,0), new Simple3dCoord(1,0,0)),
		new Simple3dEdge(new Simple3dCoord(0,-1,0), new Simple3dCoord(0,1,0)),
		new Simple3dEdge(new Simple3dCoord(0,0,-1), new Simple3dCoord(0,0,1))
		],
		origin);
	
	axisTransform = new Simple3dTransform(initX,initY,initZ, 100,100,100,0,0,0);
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
	
	$(window).jkey('t',function(){
	    vertexLabels = !vertexLabels;
	});
	
	$(window).jkey('o',function(){
	    rotationX = 1;
		rotationY = 1;
	});
	
	$(window).jkey('s',function(){
	    rotationX = 0;
		rotationY = 0;
	});
	
	$(window).jkey('f',function(){
	    fill = !fill;
	});
	
	$(window).jkey('c',function(){
	    setRandomColor();
	});


	/*
	 * Render loop
	 */
	setInterval(function(){
		if(!mouseDown)
		rotate(rotationX, rotationY);
        loop(canvas);
    }, 1000 / 30);
});

function setRandomColor() {
	color = {r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) };
}

function setProjections() {
	var	near = d;
	
	for(var i = 0, max = curves.length; i < max; i++) {
		curves[i].setProjection(d, far, near, canvas.width, canvas.height); 
	}
	
	for(var i = 0, max = cubes.length; i < max; i++) {
		cubes[i].setProjection(d, far, near, canvas.width, canvas.height); 
	}
	
	for(var i = 0, max = text.length; i < max; i++) {
		text[i].setProjection(d, far, near, canvas.width, canvas.height); 
	}
	
	
	axis.setProjection(d, far, near, canvas.width, canvas.height);
}

function loop() {
	var	renderOptions = {'labelVertices': vertexLabels};
		
	var graphics = canvas.getContext('2d');
	
	var fillStroke = function() {
		if(fill)
			graphics.fill();
		else
			graphics.stroke();	
	}

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
    
    graphics.strokeStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
    graphics.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
	graphics.save();
    graphics.translate(canvas.width/2, canvas.height/2);
    
    for(var i = 0, max = curves.length; i < max; i++) {
    	curves[i].drawPath(graphics, renderOptions);
    	fillStroke();	
    }
    
    for(var i = 0, max = cubes.length; i < max; i++) {
    	cubes[i].drawPath(graphics, renderOptions);
    	fillStroke();
    }
    
    for(var i = 0, max = text.length; i < max; i++) {
		text[i].drawPath(graphics, renderOptions, function() {
			fillStroke();
		});
	}
	
    
    axis.drawPath(graphics, renderOptions);
    fillStroke();
    
    graphics.restore();
    
    graphics.restore();
}

function rotate(rotationX,rotationY) {
	if(0 != rotationX || 0 != rotationY) {
		var transform = new Simple3dTransform(rotationX,rotationY,0, 1, 1, 1, 0, 0, 0);
		
		for(var i = 0, max = cubes.length; i < max; i++) {
			cubes[i].transform(transform);
		}
		
		for(var i = 0, max = curves.length; i < max; i++) {
			curves[i].transform(transform);
		}
		
		for(var i = 0, max = text.length; i < max; i++) {
			text[i].transform(transform);
		}

		axis.transform(transform);
	}
}

function onDocumentMouseMove(event){
	if(undefined !== mouseX) {
		var deltaX = event.offsetX - mouseX,
			deltaY = event.offsetY - mouseY;
		
		if(mouseDown) {
			if(deltaX != 0) {
				rotationY =angleIncrement;
				if(deltaX < 0) {
					rotationY *= -1;
				}
			}
			else {
				rotationY = 0;
			}
			
			if(deltaY != 0) {
				rotationX = angleIncrement;
				if(deltaY < 0) {
					rotationX *= -1;
				}
			}
			else {
				rotationX = 0;
			}
			
			rotate(rotationX, rotationY);			
		}
	}
	
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function onDocumentMouseDown(event){
	mouseX = event.offsetX;
	mouseY = event.offsetY;
	mouseDown = true;
}

function onDocumentMouseUp(event){
	mouseDown = false;    
}

function onDocumentMouseWheel(event) {
	if(event.wheelDelta > 0) {
		d += 25;
	}
	else {
		d -= 25;
	}
	
	console.log(" d = " + d);
	setProjections();
}
