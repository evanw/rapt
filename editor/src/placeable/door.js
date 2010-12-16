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
