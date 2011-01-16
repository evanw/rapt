// class AABB extends Shape
function AABB(lowerLeft, upperRight) {
	this.lowerLeft = new Vector(
		Math.min(lowerLeft.x, upperRight.x),
		Math.min(lowerLeft.y, upperRight.y));
	this.size = new Vector(
		Math.max(lowerLeft.x, upperRight.x),
		Math.max(lowerLeft.y, upperRight.y)).sub(this.lowerLeft);
}

AABB.makeAABB = function(center, width, height) {
	var halfSize = new Vector(width * 0.5, height * 0.5);
	var lowerLeft = center.sub(halfSize);
	var upperRight = center.add(halfSize);
	return new AABB(lowerLeft, upperRight);
}

AABB.prototype.getTop = function() { return this.lowerLeft.y + this.size.y; };
AABB.prototype.getLeft = function() { return this.lowerLeft.x; };
AABB.prototype.getRight = function() { return this.lowerLeft.x + this.size.x; };
AABB.prototype.getBottom = function() { return this.lowerLeft.y; };
AABB.prototype.getWidth = function() { return this.size.x; };
AABB.prototype.getHeight = function() { return this.size.y; };

AABB.prototype.copy = function() {
	return new AABB(this.lowerLeft, this.lowerLeft.add(this.size));
};
AABB.prototype.getPolygon = function() {
	var center = this.getCenter();
	var halfSize = this.size.div(2);
	return new Polygon(center,
		new Vector(+halfSize.x, +halfSize.y),
		new Vector(-halfSize.x, +halfSize.y),
		new Vector(-halfSize.x, -halfSize.y),
		new Vector(+halfSize.x, -halfSize.y));
}
AABB.prototype.getType = function() {
	return SHAPE_AABB;
};
AABB.prototype.getAabb = function() {
	return this;
};
AABB.prototype.moveBy = function(delta) {
	this.lowerLeft = this.lowerLeft.add(delta);
};
AABB.prototype.moveTo = function(destination) {
	this.lowerLeft = destination.sub(this.size.div(2));
};
AABB.prototype.getCenter = function() {
	return this.lowerLeft.add(this.size.div(2));
};
AABB.prototype.expand = function(margin) {
	var marginVector = new Vector(margin, margin);
	return new AABB(this.lowerLeft.sub(marginVector), this.lowerLeft.add(this.size).add(marginVector));
};
AABB.prototype.union = function(aabb) {
	return new AABB(this.lowerLeft.minComponents(aabb.lowerLeft), this.lowerLeft.add(this.size).maxComponents(aabb.lowerLeft.add(aabb.size)));
};
AABB.prototype.include = function(point) {
	return new AABB(this.lowerLeft.minComponents(point), this.lowerLeft.add(this.size).maxComponents(point));
};
AABB.prototype.offsetBy = function(offset) {
	return new AABB(this.lowerLeft.add(offset), this.lowerLeft.add(this.size).add(offset));
};

AABB.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	c.strokeRect(this.lowerLeft.x, this.lowerLeft.y, this.size.x, this.size.y);
};
