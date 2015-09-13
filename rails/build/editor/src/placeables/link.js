////////////////////////////////////////////////////////////////////////////////
// class Link
////////////////////////////////////////////////////////////////////////////////

function Link(button, door) {
	this.button = button;
	this.door = door;
}

Link.prototype.draw = function(c, alpha) {
	c.strokeStyle = rgba(0, 0, 0, 0.5);
	dashedLine(c, this.button.getCenter(), this.door.getCenter());
};

Link.prototype.drawSelection = function(c) {
	var start = this.button.getCenter();
	var end = this.door.getCenter();
	var radius = 0.2;
	var angle = end.sub(start).atan2() + Math.PI / 2;
	c.beginPath();
	c.arc(start.x, start.y, radius, angle, angle + Math.PI, false);
	c.arc(end.x, end.y, radius, angle + Math.PI, angle, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Link.prototype.touchesRect = function(rect) {
	// Test if the bounding boxes intersect and the box actually lies across the line
	var start = this.button.getCenter();
	var end = this.door.getCenter();
	return (rect.intersectsRect(new Rectangle(start, end)) && rect.intersectsEdge(new Edge(start, end)));
};

Link.prototype.getAnchor = function() {
	return new Vector(0, 0);
};

Link.prototype.setAnchor = function(anchor) {
};

Link.prototype.resetAnchor = function() {
};

Link.prototype.getAngle = function() {
	return 0;
};

Link.prototype.setAngle = function(newAngle) {
};
