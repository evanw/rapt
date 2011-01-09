////////////////////////////////////////////////////////////////////////////////
// class Rectangle
////////////////////////////////////////////////////////////////////////////////

function Rectangle(start, end) {
	this.min = new Vector(Math.min(start.x, end.x), Math.min(start.y, end.y));
	this.max = new Vector(Math.max(start.x, end.x), Math.max(start.y, end.y));
}

Rectangle.prototype.intersectsRect = function(rect) {
	return (this.min.x < rect.max.x && rect.min.x < this.max.x
		&& this.min.y < rect.max.y && rect.min.y < this.max.y);
};

Rectangle.prototype.intersectsEdge = function(edge) {
	var total = 0;
	total += edge.pointBehindEdge(this.min);
	total += edge.pointBehindEdge(new Vector(this.min.x, this.max.y));
	total += edge.pointBehindEdge(new Vector(this.max.x, this.min.y));
	total += edge.pointBehindEdge(this.max);
	return (total != 0 && total != 4);
};

Rectangle.prototype.containsPoint = function(point) {
	return point.x >= this.min.x && point.x < this.max.x && point.y >= this.min.y && point.y < this.max.y;
};

Rectangle.prototype.expand = function(x, y) {
	var padding = new Vector(x, y);
	return new Rectangle(this.min.sub(padding), this.max.add(padding));
};

////////////////////////////////////////////////////////////////////////////////
// class Circle
////////////////////////////////////////////////////////////////////////////////

function Circle(center, radius) {
	this.center = center;
	this.radius = radius;
}

Circle.prototype.intersectsRect = function(rect) {
	var topLeft = new Vector(rect.min.x, rect.max.y);
	var topRight = rect.max;
	var bottomLeft = rect.min;
	var bottomRight = new Vector(rect.max.x, rect.min.y);
	return (rect.containsPoint(this.center)
		|| this.intersectsEdge(new Edge(topLeft, topRight))
		|| this.intersectsEdge(new Edge(topRight, bottomRight))
		|| this.intersectsEdge(new Edge(bottomRight, bottomLeft))
		|| this.intersectsEdge(new Edge(bottomLeft, topLeft))
		|| this.containsPoint(rect.min));
};

Circle.prototype.intersectsEdge = function(edge) {
	var dir = edge.end.sub(edge.start);
	var fromCenter = edge.start.sub(this.center);
	var a = dir.lengthSquared();
	var b = 2 * dir.dot(fromCenter);
	var c = fromCenter.lengthSquared() - this.radius * this.radius;
	var discriminant = b * b - 4 * a * c;
	if (discriminant >= 0)
	{
		var tb = -b / (2 * a);
		var td = Math.sqrt(discriminant) / (2 * a);
		var t1 = tb + td;
		var t2 = tb - td;
		return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
	}
	return false;
};

Circle.prototype.containsPoint = function(point) {
	return this.center.sub(point).lengthSquared() < this.radius * this.radius;
};

////////////////////////////////////////////////////////////////////////////////
// class Polygon
////////////////////////////////////////////////////////////////////////////////

function Polygon() {
	this.vertices = Array.prototype.slice.call(arguments);
}

Polygon.prototype.draw = function(c) {
	c.beginPath();
	for (var i = 0; i < this.vertices.length; i++) {
		var v = this.vertices[i];
		c.lineTo(v.x, v.y);
	}
	c.closePath();
	c.fill();
	c.stroke();
};

Polygon.prototype.containsPoint = function(point) {
	// Use winding number test (sum of angles == +/-2PI iff point in polygon)
	var total = 0;
	for (var i = 0; i < this.vertices.length; i++) {
		var j = (i + 1) % this.vertices.length;
		var di = this.vertices[i].sub(point).unit();
		var dj = this.vertices[j].sub(point).unit();
		total += Math.acos(di.dot(dj));
	}
	return Math.abs(Math.abs(total) - 2 * Math.PI) < 0.001;
};
