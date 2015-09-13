////////////////////////////////////////////////////////////////////////////////
// class Edge
////////////////////////////////////////////////////////////////////////////////

function Edge(start, end) {
	this.start = start;
	this.end = end;
}

Edge.prototype.squaredDistanceToPoint = function(point) {
	var line = this.end.sub(this.start);
	var t = point.sub(this.start).dot(line) / line.lengthSquared();
	
	// The 0.01 is for disambiguating edges with the same end point (to pick the closer one)
	t = Math.max(0.01, Math.min(0.99, t));
	
	var closest = this.start.add(line.mul(t));
	return closest.sub(point).lengthSquared();
};

Edge.prototype.pointBehindEdge = function(point) {
	return point.sub(this.start).dot(this.end.sub(this.start).flip()) < 0;
};

Edge.prototype.flip = function() {
	var temp = this.start;
	this.start = this.end;
	this.end = temp;
};

Edge.prototype.pointAlongLine = function(fraction) {
	return this.start.mul(1 - fraction).add(this.end.mul(fraction));
};

Edge.prototype.drawDirectionIndicators = function(c, isInitiallyOpen) {
	var normal = this.end.sub(this.start).flip().unit();
	for (var i = 1, num = 10; i < num - 1; i++) {
		var point = this.pointAlongLine(i / (num - 1));
		var d = isInitiallyOpen ? 0.05 : 0;
		c.moveTo(point.x + normal.x * d, point.y + normal.y * d);
		c.lineTo(point.x + normal.x * 0.1, point.y + normal.y * 0.1);
	}
};

Edge.prototype.draw = function(c) {
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	this.drawDirectionIndicators(c, false);
	c.stroke();
};

Edge.prototype.drawOpen = function(c) {
	var a = this.pointAlongLine(1 / 9);
	var b = this.pointAlongLine(8 / 9);
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	this.drawDirectionIndicators(c, true);
	c.stroke();
};

////////////////////////////////////////////////////////////////////////////////
// class EdgePicker
////////////////////////////////////////////////////////////////////////////////

function EdgePicker() {
}

EdgePicker.getClosestEdge = function(point, edges) {
	var edge = null;
	var minDistance = Number.MAX_VALUE;
	for (var i = 0; i < edges.length; i++) {
		var distance = edges[i].squaredDistanceToPoint(point);
		if (distance < minDistance) {
			minDistance = distance;
			edge = edges[i];
		}
	}
	return edge;
};
