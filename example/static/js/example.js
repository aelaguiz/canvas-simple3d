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
	rotationX = 1,
	rotationY = -1;
	
$(document).ready(function(){
	canvas = document.getElementById("canvas1");
	
	origin = new Simple3dCoord(0, 0, 0);
	
	/*render: function(text, options, ctx) {
		var style = { 
			color: options.color, 
			fontFamily: options.fontFamily.split()[0].replace(/(^"|^'|'$|"$)/g, '').toLowerCase(), 
			fontSize: options.fontSize,
			fontWeight: this.cssFontWeightMap[options.fontWeight ? options.fontWeight : 'normal'],
			fontStyle: options.fontStyle ? options.fontStyle : 'normal',
			fontStretchPercent: this.cssFontStretchMap[options['font-stretch'] ? options['font-stretch'] : 'default'],
			textDecoration: options.textDecoration,
			lineHeight: options.lineHeight,
			letterSpacing: options.letterSpacing ? options.letterSpacing : 0,
			textTransform: options.textTransform
		};*/
		
	text[0] = new Simple3dText("Text, yes?", {fontFamily: "Helvetiker", color: "#FF0000", fontSize: 12}, origin);
	
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
					
	var curveTransform = new Simple3dTransform(0,0,0, 35, 35, 35, 75, 75, 0);
	curves[0].transform(curveTransform);
	
	curveTransform = new Simple3dTransform(0,0,0, 35, 35, 35, -75, -75, 0);
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
	
	var cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 75, 75, -125);
	cubes[0].transform(cubeTransform);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, -75, 75, -125);
	cubes[1].transform(cubeTransform);
	//cubes[1].origin = new Simple3dCoord(-75, 75, -125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, -75, -75, -125);
	cubes[2].transform(cubeTransform);
	//cubes[2].origin = new Simple3dCoord(-75, -75, -125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 75, -75, -125);
	cubes[3].transform(cubeTransform);
	//cubes[3].origin = new Simple3dCoord(75, -75, -125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 75, 75, 125);
	cubes[4].transform(cubeTransform);
	//cubes[4].origin = new Simple3dCoord(75, 75, 125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, -75, 75, 125);
	cubes[5].transform(cubeTransform);
	//cubes[5].origin = new Simple3dCoord(-75, 75, 125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, -75, -75, 125);
	cubes[6].transform(cubeTransform);
	//cubes[6].origin = new Simple3dCoord(-75, -75, 125);
	
	cubeTransform = new Simple3dTransform(45,45,45, 15, 15, 15, 75, -75, 125);
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
		if(!mouseDown)
		rotate(rotationX, rotationY);
        loop(canvas);
    }, 1000 / 30);
});

function setProjections() {
	var	near = d;
	
	for(var i = 0, max = curves.length; i < max; i++) {
		curves[i].setProjection(d, far, near, canvas.width, canvas.height); 
	}
	
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
    
    for(var i = 0, max = curves.length; i < max; i++) {
    	curves[i].drawPath(graphics, renderOptions);
    	graphics.stroke();	
    }
    
    for(var i = 0, max = cubes.length; i < max; i++) {
    	cubes[i].drawPath(graphics, renderOptions);
    	graphics.stroke();	
    }
    
    axis.drawPath(graphics, renderOptions);
    graphics.stroke();
    
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
