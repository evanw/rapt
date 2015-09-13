// class Circle extends Shape
function Circle(center, radius) {
	this.center = center;
	this.radius = radius;
}

Circle.prototype.copy = function() {
	return new Circle(this.center, this.radius);
}

Circle.prototype.getType = function() {
	return SHAPE_CIRCLE;
};
Circle.prototype.getAabb = function() {
	var radiusVector = new Vector(this.radius, this.radius);
	return new AABB(this.center.sub(radiusVector), this.center.add(radiusVector));
};
Circle.prototype.getCenter = function() {
	return this.center;
}
Circle.prototype.moveBy = function(delta) {
	this.center = this.center.add(delta);
};
Circle.prototype.moveTo = function(destination) {
	this.center = destination;
};
Circle.prototype.offsetBy = function(offset) {
	return new Circle(this.center.add(offset), this.radius);
};

Circle.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	c.beginPath();
	c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
	c.stroke();
};
