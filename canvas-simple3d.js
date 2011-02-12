var _degRad = Math.PI/180;

Simple3dSpaceEnum = {
	OBJECT: 0,
	WORLD: 1,
	CAMERA: 2
};

/**
 * simple3d rotation definition
 * @constructor
 * @param {int} degX
 * @param {int} degY
 * @param {int} degZ
 */
Simple3dTransform = function Simple3dTransform(degX,degY,degZ, scaleX, scaleY, scaleZ, transX, transY, transZ) {
	this.radX = degX * _degRad;
	this.radY = degY * _degRad;
	this.radZ = degZ * _degRad;
	this.scaleX = scaleX;
	this.scaleY = scaleY;
	this.scaleZ = scaleZ;
	this.transX = transX;
	this.transY = transY;
	this.transZ = transZ;
}

/**
 * simple 3d coordinates (point)
 * @constructor
 * @param {int} x
 * @param {int} y
 * @param {int} z
 */
Simple3dCoord = function Simple3dCoord(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.projected = {x: undefined, y: undefined};
}

var _objectOrigin = new Simple3dCoord(0,0,0);

Simple3dCoord.prototype = {
	constructor: Simple3dCoord,
	
	/**
	 * Transform the current point using rotation spec about the point specified by originOffset 
	 * 
	 * @param {Simple3dTransform}  transform
	 * @param {Simple3dCoord} originOffset - translation vector to translate the current object's object coordinates to world coordinates generally
	 */
	transform: function transform(transform,originOffset) {
		if(undefined === originOffset)
			originOffset = _objectOrigin;
			 
		var x = this.x + originOffset.x,
			y = this.y + originOffset.y,
			z = this.z + originOffset.z,
			sinY = Math.sin(transform.radY),
			sinX = Math.sin(transform.radX),
			sinZ = Math.sin(transform.radZ),
			cosY = Math.cos(transform.radY),
			cosX = Math.cos(transform.radX),
			cosZ = Math.cos(transform.radZ);
		
		this.x = ((x * (cosY * cosZ)) + 
						(y * (-cosX*sinZ+sinX*sinY*cosZ)) + 
						(z * (sinX*sinZ+cosX*sinY*cosZ)) - originOffset.x)*transform.scaleX + transform.transX;
						
		this.y = ((x * (cosY * sinZ)) + 
						(y * (cosX * cosZ+sinX*sinY*sinZ)) + 
						(z * (-sinX * cosZ+cosX*sinY*sinZ)) - originOffset.y)*transform.scaleY + transform.transY;
						
		this.z = ((x * -sinY) + 
						(y * (sinX * cosY)) + 
						(z * (cosX * cosY)) - originOffset.z)*transform.scaleZ + transform.transZ;
	},
	
	/**
	 * Project the current point onto the plane defined by z = d
	 * @param {Simple3dCoord} originOffset - origin
	 * @param {int} proj - projection settnigs
	 */
	project: function project(originOffset, proj) {
		// First convert object coordinates to world coordinates
		var worldX = this.x + originOffset.x,
			worldY = this.y + originOffset.y,
			worldZ = this.z + originOffset.z;
			
		// Perspective project the world coordinates (convert to camera coordinates)
		worldX = worldX * -(1/proj.w);
		worldY = worldY * (1/proj.h);
		worldZ =  (worldZ * (-(proj.near+proj.far)/proj.d) + ((-2 * proj.near*proj.far)/proj.d));
		
		// Project onto 2d surface
		this.projected.x = worldX / (proj.e/worldZ);
		this.projected.y = worldY / (proj.e/worldZ);
	}
}


/**
 * Simple 3d edge 
 * @constructor
 * @param {Simple3dCoord or Simple3dEdge} start (optional)
 * @param {Simple3dCoord} end
 * @param {Array} controlPoints - optional array of control points useful for some edge types
 */
Simple3dEdge = function Simple3dEdge(start,end, controlPoints) {
	this.start = start;
	this.end = end;
	
	/*
	 * If only one parameter was specified make the start undefined, this will probably end up being pointed to another edge by a polygon object
	 */
	if(undefined === this.end) {
		this.end = this.start;
		this.start = undefined;
	}
	
	if(undefined !== controlPoints) {
		this.controlPoints = controlPoints;
	}
}

Simple3dEdge.prototype = {
	
	constructor: Simple3dEdge,
	/**
	 * Transform the current edge using transform spec about the point specified by originOffset 
	 * 
	 * @param {Simple3dTransform}  transform
	 * @param {Simple3dCoord} originOffset - translation vector to translate the current object's object coordinates to world coordinates generally
	 */
	transform: function transform(transform,originOffset) {
		// We assume that if the start is another edge it has already been rotated, so only rotate the start if it is a point
		if(this.start instanceof Simple3dCoord) {
			this.start.transform(transform, originOffset);
		}
		
		if(undefined !== this.controlPoints) {
			for(var i = 0, max = this.controlPoints.length; i < max; i++) {
				this.controlPoints[i].transform(transform, originOffset);
			}
		}
		
		this.end.transform(transform, originOffset);
	},
	
	/**
	 * Project the current edge onto the plane defined by z = d
	 * @param {Simple3dCoord}  originOffset - origin
	 * @param {int} proj - projection settings 
	 */
	project: function project(originOffset, proj) {
		// We assume that if the start is another edge it has already been projected, so only projected the start if it is a point
		if(this.start instanceof Simple3dCoord) {
			this.start.project(originOffset, proj);
		}
		
		if(undefined !== this.controlPoints) {
			for(var i = 0, max = this.controlPoints.length; i < max; i++) {
				this.controlPoints[i].project(originOffset, proj);
			}
		}
		
		this.end.project(originOffset, proj);
	},
	
	drawPath: function drawPath(graphics) {
		if(this.start instanceof Simple3dCoord) {
			graphics.moveTo(this.start.projected.x, this.start.projected.y);
		}
		
		graphics.lineTo(this.end.projected.x, this.end.projected.y);
	}
}

/**
 * Simple 3d quadratic curve
 * @param {Simple3dCoord or Simple3dEdge} start (optional)
 * @param {Simple3dCoord} control point
 * @param {Simple3dCoord} end
 */
Simple3dQuadraticCurve = function Simple3dQuadraticCurve(start, cp, end) {
	/*
	 * Allow for missing start
	 */
	if(undefined === end) {
		end = cp;
		cp = start;
		start = undefined;
	}
	
	Simple3dEdge.call(this, start,end, [cp]);
}

Simple3dQuadraticCurve.prototype = new Simple3dEdge;
Simple3dQuadraticCurve.prototype.constructor = Simple3dQuadraticCurve;

Simple3dQuadraticCurve.prototype.drawPath = function drawPath(graphics) {
	if(this.start instanceof Simple3dCoord) {
		graphics.moveTo(this.start.projected.x, this.start.projected.y);
	}
	
	graphics.quadraticCurveTo(this.controlPoints[0].projected.x, this.controlPoints[0].projected.y, this.end.projected.x, this.end.projected.y);
}


/**
 * Simple 3d quadratic curve
 * @param {Simple3dCoord or Simple3dEdge} start (optional)
 * @param {Simple3dCoord} control point
 * @param {Simple3dCoord} end
 */
Simple3dBezierCurve = function Simple3dBezierCurve(start, cp1, cp2, end) {
	/*
	 * Allow for missing start
	 */
	if(undefined === end) {
		end = cp2;
		cp2 = cp1;
		cp1 = start;
		start = undefined;
	}
	
	Simple3dEdge.call(this, start,end, [cp1, cp2]);
}

Simple3dBezierCurve.prototype = new Simple3dEdge;
Simple3dBezierCurve.prototype.constructor = Simple3dBezierCurve;

Simple3dBezierCurve.prototype.drawPath = function drawPath(graphics) {
	if(this.start instanceof Simple3dCoord) {
		graphics.moveTo(this.start.projected.x, this.start.projected.y);
	}
	
	graphics.bezierCurveTo(this.controlPoints[0].projected.x, this.controlPoints[0].projected.y, this.controlPoints[1].projected.x, this.controlPoints[1].projected.y, 
							this.end.projected.x, this.end.projected.y);
}


Simple3dObject = function Simple3dObject(origin) {
	this.origin = origin;
}

Simple3dObject.prototype = {
	/*
	 * projSettings: 
	 * e - display plane depth (z = e)
	 * far - far clipping plane (z)
	 * near - near clipping plane (z)
	 * screenHeight = screen height in px
	 * screenWidth = screen width in px
	 * 
	 * calculated:
	 * h = -Math.tan(projSettings.screenHeight/2),
			aspectRatio = projSettings.screenWidth/projSettings.screenHeight,
			w=-aspectRatio*h,
			d = far-near
	 */
	
	/**
	 * Sets the projection settings
	 * @param {int} e - distance from screen
	 * @param {int} near - near clip plane
	 * @param {int} far - far clip plane
	 * @param {int} screenWidth
	 * @param {int} screenHeight 
	 */
	setProjection: function setProjection(e, near, far, screenWidth, screenHeight) {
		var edge,
			h = Math.tan(screenHeight/2),
			aspectRatio = screenWidth/screenHeight,
			w = aspectRatio*h,
			d = far-near;
			
		this.projection = {
			'e': e,
			'near': near,
			'far': far,
			'screenWidth': screenWidth,
			'screenHeight': screenHeight,
			'h': h,
			'w': w,
			'd': d
		}
	},
	
	/**
	 * Transform the current polygon using Transform spec about the point specified by originOffset 
	 * 
	 * @param {Simple3dTransform}  transform
	 * @param {Simple3dCoord} originOffset - translation vector to translate the current object's object coordinates to world coordinates generally
	 */
	transform: function transform(transform,originOffset) {

	},
	
	
	
	/**
	 * Project the current polygon onto the plane defined by z = d
	 * @param {int} options object (optional) 
	 */
	project: function project(options) {

	},
	
	/**
	 * Draws the polygons path and leaves it open to be filled/closed/stroked, call setProjection first
	 * @param {Canvis2dContext} graphics
	 * @param {int} options object (optional) - Really only useful if you wrote this library (aka Amir)
	 */
	drawPath: function drawPath(graphics, options) {
		
	}
}

/**
 * Simple3dPolygon objects are in object space
 * @constructor
 * @param {array} edges - Array of Simple3dEdge objects, if an edge has an undefined start it is pointed to the edge before it
 * @param {Simple3dCoord} origin - Coordinates of origin in world space
 */
Simple3dPolygon = function Simple3dPolygon(edges, origin) {
	Simple3dObject.call(this, origin);
	
	this.edges = undefined;
	this.projection = {};
	
	if(edges instanceof Simple3dPolygon) { // Copy constructor
		var base = edges,
			edge,
			newEdge;
		
		this.edges = [];
		this.origin = new Simple3dCoord(base.origin.x, base.origin.y, base.origin.z);
			
		for(var i = 0, max = base.edges.length; i < max; i++) {
			edge = base.edges[i];
			
			if(edge.start instanceof Simple3dCoord) {
				newEdge = new Simple3dEdge(new Simple3dCoord(edge.start.x, edge.start.y, edge.start.z), new Simple3dCoord(edge.end.x, edge.end.y, edge.end.z));
			}
			else if( i > 0) {
				newEdge = new Simple3dEdge(new Simple3dCoord(edge.end.x, edge.end.y, edge.end.z));
			}
			
			this.edges.push(newEdge);
		}
	}
	else {
		this.edges = edges;
	}
		
	/*
	 * Wire up edges to the edges in front of them if they are missing a start point
	 */
	var edge;
		
	for(var i = 1, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		if(undefined === edge.start) {
			edge.start = this.edges[i-1];
		}	
	}
}

Simple3dPolygon.prototype = new Simple3dObject;
Simple3dPolygon.prototype.constructor = Simple3dPolygon;
	
/**
 * Transform the current polygon using Transform spec about the point specified by originOffset 
 * 
 * @param {Simple3dTransform}  transform
 * @param {Simple3dCoord} originOffset - translation vector to translate the current object's object coordinates to world coordinates generally
 */
Simple3dPolygon.prototype.transform = function transform(transform,originOffset) {
	var edge;
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		edge.transform(transform, originOffset);		
	}
}

/**
 * Project the current polygon onto the plane defined by z = d
 * @param {int} options object (optional) 
 */
Simple3dPolygon.prototype.project = function project(options) {
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		edge.project(this.origin, this.projection);			
	}
}

/**
 * Draws the polygons path and leaves it open to be filled/closed/stroked, call setProjection first
 * @param {Canvis2dContext} graphics
 * @param {int} options object (optional) - Really only useful if you wrote this library (aka Amir)
 */
Simple3dPolygon.prototype.drawPath = function drawPath(graphics, options) {
	options = options ? options : {};
	
	this.project(options);
	
	var edge;
	
	if(options.labelVertices) {
		if(undefined !== options.labelFont) {
			graphics.font = options.labelFont;
		}
		else {
			graphics.font = '6px san-serif';
		}
	}
	
	graphics.beginPath();
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		if(edge.start instanceof Simple3dCoord) {
			if(options.labelVertices) {
				graphics.fillText("(" + edge.start.x.toFixed(0) + "," + edge.start.y.toFixed(0) + "," + edge.start.z.toFixed(0) + ")", edge.start.projected.x, edge.start.projected.y);
			}
		}
		
		edge.drawPath(graphics);
		
		if(options.labelVertices) {
			graphics.fillText("(" + edge.end.x.toFixed(0) + "," + edge.end.y.toFixed(0) + "," + edge.end.z.toFixed(0) + ")", edge.end.projected.x, edge.end.projected.y);
		}
	}
}



Simple3dText = function Simple3dText(text, z, options, origin) {
	Simple3dObject.call(this, origin);
	
	this.glyphs = [];
	this.projection = {};

	var _fakeCanvas = new (function (z,glyphList,origin){
		var frame = function frame() {
			this.scaleX = 1;
			this.scaleY = 1;
			this.transX = 0;
			this.transY = 0;
		};
		
		var frames = [new frame()];
		var curFrame = frames[0];
		var curGlyphEdges = [];
		var lastCoord = undefined;
		
		this.save = function save() {
			var newFrame = new frame();
			frame.scaleX = newFrame.scaleX;
			frame.scaleY = newFrame.scaleY;
			frame.transX = newFrame.transX;
			frame.transY = newFrame.transY;
			
			frames.push(newFrame);
			curFrame = newFrame;
		}
		
		this.restore = function restore() {
			frames.pop();
			curFrame = frames[0];		
		}
		
		this.scale = function scale(scaleX, scaleY) {
			curFrame.scaleX = scaleX;
			curFrame.scaleY = scaleY;
		}
		
		this.translate = function translate(transX, transY) {
			curFrame.transX = transX;
			curFrame.transY = transY;			
		}
		
		this.beginPath = function beginPath() {
						
		}
		
		this.moveTo = function moveTo(x, y) {
			lastCoord = new Simple3dCoord(x,y,z);
		}
		
		this.lineTo = function lineTo(x,y) {
			curGlyphEdges.push(new Simple3dEdge(lastCoord, new Simple3dCoord(x,y, z)));
			lastCoord = undefined;
		}
		
		this.quadraticCurveTo = function quadraticCurveTo(cpX,cpY,x,y) {
			curGlyphEdges.push(new Simple3dQuadraticCurve(lastCoord, new Simple3dCoord(cpX,cpY, z), 
															new Simple3dCoord(x,y, z)));
			lastCoord = undefined;
		}
		
		this.bezierCurveTo = function bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y, x,y) {
			curGlyphEdges.push(new Simple3dBezierCurve(lastCoord, new Simple3dCoord(cp1X,cp1Y, z), 
															new Simple3dCoord(cp2X,cp2Y, z),
															new Simple3dCoord(x,y, z)));
			lastCoord = undefined;
		}
		
		this.stroke = this.fill = function fillStroke() {
			glyphList.push(new Simple3dPolygon(curGlyphEdges, origin));
			curGlyphEdges = []
			lastCoord = undefined;
		}
	})(z,this.glyphs,this.origin);
	
	Typeface.render(text, options, _fakeCanvas);	
}

Simple3dText.prototype = new Simple3dObject;
Simple3dText.prototype.constructor = Simple3dText;

/**
 * Draws the polygons path and leaves it open to be filled/closed/stroked, call setProjection first
 * @param {Canvis2dContext} graphics
 * @param {int} options object (optional) - Really only useful if you wrote this library (aka Amir)
 */
Simple3dText.prototype.drawPath = function drawPath(graphics, options) {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].drawPath(graphics, options);
	}
}


Simple3dText.prototype.transform = function transform(transform,originOffset) {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].transform(transform,originOffset);
	}
}

Simple3dText.prototype.setProjection = function setProjection(e, near, far, screenWidth, screenHeight) {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].setProjection(e,near,far,screenWidth,screenHeight);
	}
}