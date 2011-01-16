/**
  *  For the polygon class, the segments and the bounding box are all relative to the center of the polygon.
  *  That is, when the polygon moves, the center is the only thing that changes.  This is to prevent
  *  floating-point arithmetic errors that would be caused by maintaining several sets of absolute coordinates.
  *
  *  Segment i goes from vertex i to vertex ((i + 1) % vertices.length)
  *
  *  When making a new polygon, please declare the vertices in counterclockwise order.	I'm not sure what will
  *  happen if you don't do that.
  */

// class Polygon extends Shape
function Polygon() {
	// center is the first argument, the next arguments are the vertices relative to the center
	arguments = Array.prototype.slice.call(arguments);
	this.center = arguments.shift();
	this.vertices = arguments;

	this.segments = [];
	for(var i = 0; i < this.vertices.length; i++) {
		this.segments.push(new Segment(this.vertices[i], this.vertices[(i + 1) % this.vertices.length]));
	}

	this.boundingBox = new AABB(this.vertices[0], this.vertices[0]);
	this.initializeBounds();
}

Polygon.prototype.copy = function() {
	var polygon = new Polygon(this.center, this.vertices[0]);
	polygon.vertices = this.vertices;
	polygon.segments = this.segments;
	polygon.initializeBounds();
	return polygon;
};

Polygon.prototype.getType = function() {
	return SHAPE_POLYGON;
};
Polygon.prototype.moveBy = function(delta) {
	this.center = this.center.add(delta);
};
Polygon.prototype.moveTo = function(destination) {
	this.center = destination;
};
Polygon.prototype.getVertex = function(i) {
	return this.vertices[i].add(this.center);
};
Polygon.prototype.getSegment = function(i) {
	return this.segments[i].offsetBy(this.center);
};
Polygon.prototype.getAabb = function() {
	return this.boundingBox.offsetBy(this.center);
};
Polygon.prototype.getCenter = function() {
	return this.center;
};

// expand the aabb and the bounding circle to contain all vertices
Polygon.prototype.initializeBounds = function() {
	for(var i = 0; i < this.vertices.length; i++) {
		var vertex = this.vertices[i];

		// expand the bounding box to include this vertex
		this.boundingBox = this.boundingBox.include(vertex);
	}
};

Polygon.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	c.beginPath();
	for(var i = 0; i < this.vertices.length; i++) {
		c.lineTo(this.vertices[i].x + this.center.x, this.vertices[i].y + this.center.y);
	}
	c.closePath();
	c.stroke();
};
