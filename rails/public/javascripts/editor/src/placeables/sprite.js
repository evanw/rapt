function Sprite(radius, drawFunc, anchor) {
	this.radius = radius;
	this.drawFunc = drawFunc;
	this.anchor = anchor || new Vector(0, 0);
}

Sprite.prototype.draw = function(c, alpha) {
	c.save();
	c.translate(this.anchor.x, this.anchor.y);
	this.drawFunc(c, alpha || 1);
	c.restore();
};

Sprite.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.anchor.x, this.anchor.y, this.radius + 0.1, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
};

Sprite.prototype.touchesRect = function(rect) {
	return new Circle(this.anchor, this.radius).intersectsRect(rect);
};

Sprite.prototype.getAnchor = function() {
	return this.anchor;
};

Sprite.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
};

Sprite.prototype.resetAnchor = function() {
};

Sprite.prototype.clone = function(newAnchor) {
	return new Sprite(this.radius, this.drawFunc, newAnchor);
};

Sprite.prototype.getCenter = function() {
	return this.anchor;
};
