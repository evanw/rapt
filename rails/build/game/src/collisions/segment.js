// class Segment
function Segment(start, end) {
	this.start = start;
	this.end = end;
	this.normal = end.sub(start).flip().unit();
}

Segment.prototype.offsetBy = function(offset) {
	return new Segment(this.start.add(offset), this.end.add(offset));
};

Segment.prototype.draw = function(c) {
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	c.stroke();
};
