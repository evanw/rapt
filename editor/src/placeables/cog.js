////////////////////////////////////////////////////////////////////////////////
// class Cog
////////////////////////////////////////////////////////////////////////////////

var COG_RADIUS = 0.25;

function Cog(point) {
	this.point = point;
}

Cog.prototype.draw = function(c) {
	Sprites.drawCog(c, this.point.x, this.point.y, COG_RADIUS);
};

Cog.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.point.x, this.point.y, COG_RADIUS + 0.2, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
};

Cog.prototype.touchesRect = function(rect) {
	return new Circle(this.point, COG_RADIUS).intersectsRect(rect);
};

Cog.prototype.getAnchor = function() {
	return this.point;
};

Cog.prototype.setAnchor = function(anchor) {
	this.point = anchor;
};

Cog.prototype.resetAnchor = function() {
};
