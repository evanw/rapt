///////////////////////////////////////////////////////////////////////////////
// class Door
////////////////////////////////////////////////////////////////////////////////

function Door(isOneWay, isInitiallyOpen, color, edge) {
	this.isOneWay = isOneWay;
	this.isInitiallyOpen = isInitiallyOpen;
	this.edge = edge;
	this.color = color;
	this.selected = false;
	this.resetAnchor();
	this.offsetToStart = edge.start.sub(this.anchor);
	this.offsetToEnd = edge.end.sub(this.anchor);
}

Door.prototype.draw = function(c, alpha) {
	c.strokeStyle = rgba(255 * (this.color == COLOR_RED), 0, 255 * (this.color == COLOR_BLUE), alpha || 1);
	if (this.isInitiallyOpen) {
		this.edge.drawOpen(c);
		if (!this.isOneWay) {
			this.edge.flip();
			this.edge.drawOpen(c);
			this.edge.flip();
		}
	} else {
		this.edge.draw(c);
		if (!this.isOneWay) {
			this.edge.flip();
			this.edge.draw(c);
			this.edge.flip();
		}
	}
};

Door.prototype.drawSelection = function(c) {
	var radius = 0.2;
	var angle = this.edge.end.sub(this.edge.start).atan2() + Math.PI / 2;
	c.beginPath();
	c.arc(this.edge.start.x, this.edge.start.y, radius, angle, angle + Math.PI, false);
	c.arc(this.edge.end.x, this.edge.end.y, radius, angle + Math.PI, angle, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Door.prototype.touchesRect = function(rect) {
	// Test if the bounding boxes intersect and the box actually lies across the line
	return (rect.intersectsRect(new Rectangle(this.edge.start, this.edge.end))
		&& rect.intersectsEdge(this.edge));
};

Door.prototype.getAnchor = function() {
	return this.anchor;
};

Door.prototype.setAnchor = function(anchor) {
	var floorAnchor = new Vector(Math.floor(anchor.x + 0.5), Math.floor(anchor.y + 0.5));
	this.anchor = anchor;
	this.edge.start = floorAnchor.add(this.offsetToStart);
	this.edge.end = floorAnchor.add(this.offsetToEnd);
};

Door.prototype.resetAnchor = function() {
	this.anchor = new Vector(Math.min(this.edge.start.x, this.edge.end.x), Math.min(this.edge.start.y, this.edge.end.y));
};

Door.prototype.getCenter = function() {
	return this.edge.start.add(this.edge.end).div(2);
};

Door.prototype.getAngle = function() {
	return 0;
};

Door.prototype.setAngle = function(newAngle) {
};
