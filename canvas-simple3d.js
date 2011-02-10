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
	 * @param {int} d - projection plane 
	 */
	project: function project(originOffset, d) {
		var x = this.x + originOffset.x,
			y = this.y + originOffset.y,
			z = this.z + originOffset.z;
		
		this.projected.x = x;
		this.projected.y = y;
	}
}


/**
 * Simple 3d edge 
 * @constructor
 * @param {Simple3dCoord or Simple3dEdge} start (optional)
 * @param {Simple3dCoord} end
 */
Simple3dEdge = function Simple3dEdge(start,end) {
	this.start = start;
	this.end = end;
	
	/*
	 * If only one parameter was specified make the start undefined, this will probably end up being pointed to another edge by a polygon object
	 */
	if(undefined === this.end) {
		this.end = this.start;
		this.start = undefined;
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
		
		this.end.transform(transform, originOffset);
	},
	
	/**
	 * Project the current edge onto the plane defined by z = d
	 * @param {Simple3dCoord}  originOffset - origin
	 * @param {int} d - projection plane 
	 */
	project: function project(originOffset, d) {
		// We assume that if the start is another edge it has already been projected, so only projected the start if it is a point
		if(this.start instanceof Simple3dCoord) {
			this.start.project(originOffset, d);
		}
		
		this.end.project(originOffset, d);
	}
}

/**
 * Simple3dPolygon objects are in object space
 * @constructor
 * @param {array} edges - Array of Simple3dEdge objects, if an edge has an undefined start it is pointed to the edge before it
 * @param {Simple3dCoord} origin - Coordinates of origin in world space
 */
Simple3dPolygon = function Simple3dPolygon(edges, origin) {
	this.edges = edges;
	this.origin = origin;
	
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

Simple3dPolygon.prototype = {
	constructor: Simple3dPolygon,
	
	/**
	 * Transform the current polygon using Transform spec about the point specified by originOffset 
	 * 
	 * @param {Simple3dTransform}  transform
	 * @param {Simple3dCoord} originOffset - translation vector to translate the current object's object coordinates to world coordinates generally
	 */
	transform: function transform(transform,originOffset) {
		var edge;
		
		for(var i = 0, max = this.edges.length; i < max; i++) {
			edge = this.edges[i];
			
			edge.transform(transform, originOffset);		
		}
	},
	
	/**
	 * Project the current polygon onto the plane defined by z = d
	 * @param {int} d - projection plane 
	 */
	project: function project(d) {
		var edge;
		
		for(var i = 0, max = this.edges.length; i < max; i++) {
			edge = this.edges[i];
			
			edge.project(this.origin, d);			
		}
	},
	
	/**
	 * Renders the current polygon projected onto plane defined by z = d
	 * @param {int} d - projection plane 
	 */
	render: function render(graphics, d) {
		this.project(d);
		
		var edge;
		
		graphics.save();
		graphics.beginPath();
		
		for(var i = 0, max = this.edges.length; i < max; i++) {
			edge = this.edges[i];
			
			if(edge.start instanceof Simple3dCoord) {
				graphics.moveTo(edge.start.projected.x, edge.start.projected.y);
			}
			
			graphics.lineTo(edge.end.projected.x, edge.end.projected.y);
		}
		
		graphics.stroke();
		graphics.restore();
	}
}
