////////////////////////////////////////////////////////////////////////////////
// class Rectangle
////////////////////////////////////////////////////////////////////////////////

function Rectangle(start, end) {
	this.min = new Vector(Math.min(start.x, end.x), Math.min(start.y, end.y));
	this.max = new Vector(Math.max(start.x, end.x), Math.max(start.y, end.y));
}

Rectangle.prototype.intersectsRect = function(rectangle) {
	return (this.min.x < rectangle.max.x && rectangle.min.x < this.max.x
		&& this.min.y < rectangle.max.y && rectangle.min.y < this.max.y);
};

Rectangle.prototype.intersectsEdge = function(edge) {
	var total = 0;
	total += edge.pointBehindEdge(this.min);
	total += edge.pointBehindEdge(new Vector(this.min.x, this.max.y));
	total += edge.pointBehindEdge(new Vector(this.max.x, this.min.y));
	total += edge.pointBehindEdge(this.max);
	return (total != 0 && total != 4);
};
