////////////////////////////////////////////////////////////////////////////////
// class Door
////////////////////////////////////////////////////////////////////////////////

function Door(isOneWay, start, end) {
	this.isOneWay = isOneWay;
	this.start = start;
	this.end = end;
}

Door.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	c.stroke();
};
