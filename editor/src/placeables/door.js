////////////////////////////////////////////////////////////////////////////////
// class Door
////////////////////////////////////////////////////////////////////////////////

function Door(isOneWay, edge) {
	this.isOneWay = isOneWay;
	this.edge = edge;
}

Door.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	this.edge.draw(c);
	if (!this.isOneWay) {
		this.edge.flip();
		this.edge.draw(c);
		this.edge.flip();
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

Door.prototype.touchesSelection = function(selectionRect) {
	// Test if the bounding boxes intersect and the box actually lies across the line
	return (selectionRect.intersectsRect(new Rectangle(this.edge.start, this.edge.end))
		&& selectionRect.intersectsEdge(this.edge));
};
