////////////////////////////////////////////////////////////////////////////////
// class Cog
////////////////////////////////////////////////////////////////////////////////

function Cog(point) {
	this.point = point;
}

Cog.prototype.draw = function(c) {
	Sprites.drawCog(c, this.point.x, this.point.y, 0.25);
};

Cog.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.point.x, this.point.y, 0.45, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
};

Cog.prototype.touchesRect = function(rect) {
	return false;
};

Cog.prototype.getAnchor = function() {
	return this.point;
};

Cog.prototype.setAnchor = function(anchor) {
	this.point = anchor;
};

Cog.prototype.resetAnchor = function() {
};
