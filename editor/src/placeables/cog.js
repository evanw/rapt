////////////////////////////////////////////////////////////////////////////////
// class Cog
////////////////////////////////////////////////////////////////////////////////

var COG_RADIUS = 0.25;

function Cog(anchor) {
	this.anchor = anchor;
}

Cog.prototype.draw = function(c, alpha) {
	Sprites.drawCog(c, alpha || 1, this.anchor.x, this.anchor.y, COG_RADIUS);
};

Cog.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.anchor.x, this.anchor.y, COG_RADIUS + 0.2, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
};

Cog.prototype.touchesRect = function(rect) {
	return new Circle(this.anchor, COG_RADIUS).intersectsRect(rect);
};

Cog.prototype.getAnchor = function() {
	return this.anchor;
};

Cog.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
};

Cog.prototype.resetAnchor = function() {
};
