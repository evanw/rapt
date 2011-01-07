var BUTTON_OPEN = 0;
var BUTTON_CLOSE = 1;
var BUTTON_TOGGLE = 2;

////////////////////////////////////////////////////////////////////////////////
// class Button
////////////////////////////////////////////////////////////////////////////////

function Button(anchor, type) {
	this.anchor = anchor;
	this.type = type;
}

Button.prototype.draw = function(c, alpha) {
	var text = ['Open', 'Close', 'Toggle'][this.type];
	c.save();
	c.translate(this.anchor.x, this.anchor.y);
	Sprites.drawButton(c, alpha || 1);
	c.fillStyle = rgba(0, 0, 0, alpha || 1);
	c.scale(1 / 150, -1 / 150);
	c.font = '15px "Lucida Grande", Helvetica, Arial, sans-serif';
	c.fillText(text, -c.measureText(text).width / 2, 35);
	c.restore();
};

Button.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.anchor.x, this.anchor.y, 0.3, 0, Math.PI * 2, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Button.prototype.touchesRect = function(rect) {
	return new Circle(this.anchor, 0.11).intersectsRect(rect);
};

Button.prototype.getAnchor = function() {
	return this.anchor;
};

Button.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
};

Button.prototype.resetAnchor = function() {
};

Button.prototype.clone = function(newAnchor) {
	return new Button(newAnchor, this.type);
};

Button.prototype.getCenter = function() {
	return this.anchor;
};

Button.prototype.getAngle = function() {
	return 0;
};

Button.prototype.setAngle = function(newAngle) {
};
