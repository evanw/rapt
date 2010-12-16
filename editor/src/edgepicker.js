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
	return point.sub(this.start).dot(this.end.sub(this.start)) < 0;
};

Edge.prototype.flip = function() {
	var temp = this.start;
	this.start = this.end;
	this.end = temp;
};

Edge.prototype.draw = function(c) {
	c.beginPath();

	// Draw the edge
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);

	// Draw the normal
	var average = this.start.add(this.end).div(2);
	var normal = this.start.sub(this.end).flip();
	var tip = average.add(normal.mul(0.1 / normal.length()));
	c.moveTo(average.x, average.y);
	c.lineTo(tip.x, tip.y);

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
