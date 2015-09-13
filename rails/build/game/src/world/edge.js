// enum EdgeType
var EDGE_FLOOR = 0;
var EDGE_LEFT = 1;
var EDGE_RIGHT = 2;
var EDGE_CEILING = 3;

// enum EdgeColor
var EDGE_NEUTRAL = 0;
var EDGE_RED = 1;
var EDGE_BLUE = 2;
var EDGE_PLAYERS = 3;
var EDGE_ENEMIES = 4;

// class Edge
function Edge(start, end, color) {
	this.segment = new Segment(start, end);
	this.color = color;
}

Edge.prototype.blocksColor = function(entityColor) {
	switch(this.color) {
		case EDGE_NEUTRAL: return true;
		case EDGE_RED: return entityColor != EDGE_RED;
		case EDGE_BLUE: return entityColor != EDGE_BLUE;
		case EDGE_PLAYERS: return entityColor != EDGE_RED && entityColor != EDGE_BLUE;
		case EDGE_ENEMIES: return entityColor != EDGE_ENEMIES;
	}
	return false;
}

Edge.prototype.getStart = function() {
	return this.segment.start;
}

Edge.prototype.getEnd = function() {
	return this.segment.end;
}

Edge.prototype.getOrientation = function() {
	return Edge.getOrientation(this.segment.normal);
}

Edge.getOrientation = function(normal) {
	if (normal.x > 0.9) return EDGE_LEFT;
	if (normal.x < -0.9) return EDGE_RIGHT;
	if (normal.y < 0) return EDGE_CEILING;
	return EDGE_FLOOR;
}

Edge.prototype.draw = function(c) {
	switch(this.color) {
		case EDGE_NEUTRAL: c.strokeStyle = 'black'; break;
		case EDGE_RED: c.strokeStyle = '#C00000'; break;
		case EDGE_BLUE: c.strokeStyle = '#0000D2'; break;
	}
	this.segment.draw(c);

	var xOffset = this.segment.normal.x * 0.1;
	var yOffset = this.segment.normal.y * 0.1;

	c.beginPath();
	for(var i = 1, num = 10; i < num - 1; ++i) {
		var fraction = i / (num - 1);
		var start = this.segment.start.mul(fraction).add(this.segment.end.mul(1 - fraction));
		c.moveTo(start.x, start.y);
		c.lineTo(start.x - xOffset, start.y - yOffset);
	}
	c.stroke();
}
