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

_Simple3dCoordSourceEnum = {
	CS_OBJECT : 0,
	CS_CAMERA: 1,
	CS_OBJECT_ORIGINAL: 2
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
	
	// this.original { x,y.z} -- Gets added once the coordinate is transformed
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
		
		// Save coordinates if they are not saved
		if(undefined === this.original) {
			this.original = {x: this.x, y: this.y, z: this.z};
		}
		
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
	 * resetTransform is the same as calling a restore then a transform, in fact - that's what it does
	 */
	resetTransform: function resetTransform(transform,originOffset) {
		this.restore();
		this.transform(transform, originOffset);
	},
	
	/**
	 * Resets the coordinates to the pre-transformation coordinates if available
	 */
	restore: function restore() {
		if(undefined !== this.original) {
			this.x = this.original.x;
			this.y = this.original.y;
			this.z = this.original.z;
		}
	},
	
	/**
	 * Saves the current coordinates as the restore state
	 */
	save: function save() {
		this.original = {x: this.x, y: this.y, z: this.z};
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
	},
	
	_expandRect: function _expandRect(rect, source) {
		var coordObj = this;
		
		if(source === _Simple3dCoordSourceEnum.CS_CAMERA)
			coordObj = this.projected;
		else if(source === _Simple3dCoordSourceEnum.CS_OBJECT_ORIGINAL) {
			if(undefined !== this.original) {
				coordObj = this.original;
			}
		}
			
		if(coordObj.x > rect.right) {
			rect.right = coordObj.x;
		}
		
		if(coordObj.x < rect.left) {
			rect.left = coordObj.x;
		}
		
		if(coordObj.y > rect.top) {
			rect.top = coordObj.y;
		}
		
		if(coordObj.y < rect.bottom) {
			rect.bottom = coordObj.y;
		}
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
	 * Resets all coordinates
	 */
	restore: function restore() {
		if(this.start instanceof Simple3dCoord) {
			this.start.restore();
		}
		
		if(undefined !== this.controlPoints) {
			for(var i = 0, max = this.controlPoints.length; i < max; i++) {
				this.controlPoints[i].restore();
			}
		}
		
		this.end.restore();
	},
	
	/**
	 * Saves all coordinates
	 */
	save: function save() {
		if(this.start instanceof Simple3dCoord) {
			this.start.save();
		}
		
		if(undefined !== this.controlPoints) {
			for(var i = 0, max = this.controlPoints.length; i < max; i++) {
				this.controlPoints[i].save();
			}
		}
		
		this.end.save();
	},
	
	/**
	 * Resets all points and then transforms
	 */
	resetTransform: function resetTransform(transform,originOffset) {
		this.restore();
		this.transform(transform,originOffset);
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
	},
	
	_expandRect: function _expandRect(rect, source) {
		if(this.start instanceof Simple3dCoord) {
			this.start._expandRect(rect, source);
		}
		
		if(undefined !== this.controlPoints) {
			for(var i = 0, max = this.controlPoints.length; i < max; i++) {
				this.controlPoints[i]._expandRect(rect, source);
			}
		}
		
		this.end._expandRect(rect, source);
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
	 * Reset the current polygon to it's pre-transformation state
	 */
	restore: function restore() {
		
	},
	
	/**
	 * Saves the current polygon
	 */
	save: function save() {
		
	},
	
	/**
	 * Reset the current polygon then apply the transform specified
	 */
	resetTransform: function resetTransform(transform, originOffset) {
		this.restore();
		this.transform(transform, originOffset);
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
		
	},
	
	/**
	 * Returns an object of form {left, top, right, bottom} with the screen coordinates of the bounding box for this object
	 */
	calcScreenBounds: function calcScreenBounds() {
		
	},
	
	/**
	 * Returns an object of form {left, top, right, bottom} with the object coordinates of the bounding box for this object
	 */
	calcObjectBounds: function calcObjectBounds() {
		
	},
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
	
	if(undefined === originOffset) {
		originOffset = this.origin;
	}
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		edge.transform(transform, originOffset);		
	}
}

/**
 * Reset the current polygon to it's pre-transformation state
 */
Simple3dPolygon.prototype.restore = function restore() {
	var edge;
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		edge.restore();		
	}
}

/**
 * Saves the current polygon as it's pre-transformation state
 */
Simple3dPolygon.prototype.save = function save() {
	var edge;
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];
		
		edge.save();		
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

Simple3dPolygon.prototype._calcBounds = function _calcBounds(source, initRect) {
	var edge,
		bounds = initRect;
	
	if(undefined === bounds) {
		bounds = {top: -100000, left: 100000, bottom: 100000, right: -100000 }; 
	}
	
	for(var i = 0, max = this.edges.length; i < max; i++) {
		edge = this.edges[i];

		edge._expandRect(bounds, source);
	}
	
	return bounds;
}

/**
 * Returns an object of form {left, top, right, bottom} with the screen coordinates of the bounding box for this object
 */
Simple3dPolygon.prototype.calcScreenBounds = function calcScreenBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_CAMERA);
}
	
/**
 * Returns an object of form {left, top, right, bottom} with the object coordinates of the bounding box for this object
 */
Simple3dPolygon.prototype.calcObjectBounds = function calcObjectBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_OBJECT);
}

/**
 * Returns an object of form {left, top, right, bottom} with the original coordinates of the bounding box for this object
 */
Simple3dPolygon.prototype.calcOriginalBounds = function calcOriginalBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_OBJECT_ORIGINAL);
}

Simple3dText = function Simple3dText(text, z, options, origin) {
	Simple3dObject.call(this, origin);
	
	this.glyphs = [];
	this.projection = {};

	/*
	 * Rather than modify the canvas-typeface library I chose to simply adapt to it by sending it a fake canvas to 
	 * render to and then transforming it's vector primitives to an array of polygons
	 */
	var _fakeCanvas = new (function (z,glyphList,origin){
		var scaleX = 1,
			scaleY = 1,
			transX = 0,
			transY = 0,
			curGlyphEdges = [],
			glyphWidth,
			glyphHeight,
			lastCoord = undefined;
		
		this.save = function save() {}
		this.restore = function restore() {}
		
		this.scale = function scale(sX, sY) {
			scaleX = sX;
			scaleY = sY;
		}
		
		this.translate = function translate(tX, tY) {
			this.finishPolygon();
			
			transX += tX;
			transY += tY;			
		}
		
		this.beginPath = function beginPath() {}
		
		this.moveTo = function moveTo(x, y) {
			lastCoord = new Simple3dCoord(x,y,z);
		}
		
		this.lineTo = function lineTo(x,y) {
			curGlyphEdges.push(new Simple3dEdge(lastCoord, new Simple3dCoord(x,y, z)));
			lastCoord = undefined;
		}
		
		this.quadraticCurveTo = function quadraticCurveTo(cpX,cpY,x,y) {
			curGlyphEdges.push(new Simple3dQuadraticCurve(lastCoord, new Simple3dCoord(cpX, cpY, z), 
															new Simple3dCoord(x, y, z)));
			lastCoord = undefined;
		}
		
		this.bezierCurveTo = function bezierCurveTo(cp1X,cp1Y,cp2X,cp2Y, x,y) {
			curGlyphEdges.push(new Simple3dBezierCurve(lastCoord, new Simple3dCoord(cp1X, cp1Y, z), 
															new Simple3dCoord(cp2X, cp2Y, z),
															new Simple3dCoord(x,y, z)));
			lastCoord = undefined;
		}
		
		this.finishPolygon = function finishPolygon() {
			if(0 != curGlyphEdges.length) {
				var polygon = new Simple3dPolygon(curGlyphEdges, origin),
					translateTransform = new Simple3dTransform(0, 0, 0, 1, 1, 1, transX, transY, 0),
					scaleTransform = new Simple3dTransform(0, 0, 0, scaleX, -scaleY, 1, 0, 0, 0);
				
				polygon.transform(translateTransform);
				polygon.transform(scaleTransform);
				
				glyphList.push(polygon);
				curGlyphEdges = []
				lastCoord = undefined;
			}
		}
		
		this.stroke = this.fill = this.finishPolygon;
	})(z,this.glyphs,this.origin);
	
	/*
	 * Render the text onto our fake canvas which will generate the polygons for each glyph
	 */
	Typeface.render(text, options, _fakeCanvas);	
}

Simple3dText.prototype = new Simple3dObject;
Simple3dText.prototype.constructor = Simple3dText;

/**
 * Draws the text one character at a time, calling a callback after each path has been completed so that they may be
 * rendered
 * @param {Canvis2dContext} graphics
 * @param {int} options object (optional) - Really only useful if you wrote this library (aka Amir)
 * @param {Function} callback
 */
Simple3dText.prototype.drawPath = function drawPath(graphics, options, callback) {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].drawPath(graphics, options);
		callback();
	}
}

Simple3dText.prototype.transform = function transform(transform,originOffset) {
	if(undefined === originOffset) {
		originOffset = this.origin;
	}
	
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].transform(transform,originOffset);
	}
}

/**
 * Reset the current text to it's pre-transformation state
 */
Simple3dText.prototype.restore = function restore() {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].restore();
	}
}


/**
 * Saves the current text state as the pre-transformation state
 */
Simple3dText.prototype.save = function save() {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].save();
	}
}

/**
 * Resets the current text and applies the specified transformation to each glyph
 */
Simple3dText.prototype.resetTransform = function resetTransform(transform,originOffset) {
	for(var i = 0, max = this.glyphs.length; i < resetTransform; i++) {
		this.glyphs[i].resetTransform(transform, originOffset);
	}
}

Simple3dText.prototype.setProjection = function setProjection(e, near, far, screenWidth, screenHeight) {
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		this.glyphs[i].setProjection(e,near,far,screenWidth,screenHeight);
	}
}

Simple3dText.prototype._calcBounds = function _calcBounds(source) {
	var bounds,
		ret = {top: -100000, left: 100000, bottom: 100000, right: -100000 };
	
	for(var i = 0, max = this.glyphs.length; i < max; i++) {
		bounds = ret;
		ret = this.glyphs[i]._calcBounds(source, bounds);
	}
	
	return ret
}

/**
 * Returns an object of form {left, top, right, bottom} with the screen coordinates of the bounding box for this object
 */
Simple3dText.prototype.calcScreenBounds = function calcScreenBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_CAMERA);
}
	
/**
 * Returns an object of form {left, top, right, bottom} with the object coordinates of the bounding box for this object
 */
Simple3dText.prototype.calcObjectBounds = function calcObjectBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_OBJECT);
}


/**
 * Returns an object of form {left, top, right, bottom} with the original coordinates of the bounding box for this object
 */
Simple3dPolygon.prototype.calcOriginalBounds = function calcOriginalBounds() {
	return this._calcBounds(_Simple3dCoordSourceEnum.CS_OBJECT_ORIGINAL);
}