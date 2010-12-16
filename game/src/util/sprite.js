// class Sprite
function Sprite() {
	this.flip = 0;
	this.angle = 0;
	this.offsetBeforeRotation = new Vector(0, 0);
	this.offsetAfterRotation = new Vector(0, 0);
	this.parent = null;
	this.firstChild = null;
	this.nextSibling = null;
	this.drawGeometry = null;
}

Sprite.prototype.clone = function() {
	var sprite = new Sprite();
	sprite.flip = this.flip;
	sprite.angle = this.angle;
	sprite.offsetBeforeRotation = this.offsetBeforeRotation;
	sprite.offsetAfterRotation = this.offsetAfterRotation;
	sprite.drawGeometry = this.drawGeometry;
	return sprite;
};

Sprite.prototype.setParent = function(newParent) {
	// remove from the old parent
	if(this.parent !== null) {
		if(this.parent.firstChild == this) {
			this.parent.firstChild = this.nextSibling;
		} else {
			for(var sprite = this.parent.firstChild; sprite !== null; sprite = sprite.nextSibling) {
				if(sprite.nextSibling == this) {
					sprite.nextSibling = this.nextSibling;
				}
			}
		}
	}

	// switch to new parent
	this.nextSibling = null;
	this.parent = newParent;

	// add to new parent
	if(this.parent !== null) {
		this.nextSibling = this.parent.firstChild;
		this.parent.firstChild = this;
	}
};

Sprite.prototype.draw = function(c) {
	c.save();
	c.translate(this.offsetBeforeRotation.x, this.offsetBeforeRotation.y);
	if(this.flip) { c.scale(-1, 1); }
	c.rotate(this.angle);
	c.translate(this.offsetAfterRotation.x, this.offsetAfterRotation.y);

	this.drawGeometry(c);
	for(var sprite = this.firstChild; sprite !== null; sprite = sprite.nextSibling) {
		sprite.draw(c);
	}

	c.restore();
};
