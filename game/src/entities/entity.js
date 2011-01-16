// class Entity
function Entity() {
	this.velocity = new Vector(0, 0);

	// private variable to tell whether this enemy will be removed at the end of all Entity ticks
	this._isDead = false;
}

Entity.prototype.getVelocity = function() { return this.velocity; }
Entity.prototype.setVelocity = function(vel) { this.velocity = vel; }

Entity.prototype.isDead = function() { return this._isDead; }
Entity.prototype.setDead = function(isDead) {
	if (this._isDead === isDead) return;
	this._isDead = isDead;
	if (this._isDead) this.onDeath();
	else this.onRespawn();
}

Entity.prototype.getCenter = function() { return this.getShape().getCenter(); }
Entity.prototype.setCenter = function(vec) { this.getShape().moveTo(vec); }

Entity.prototype.getColor = function() { throw 'Entity.getColor() unimplemented'; }
Entity.prototype.getShape = function(){ throw 'Entity.getShape() unimplemented'; }

Entity.prototype.getCenter = function(){ return this.getShape().getCenter(); }
Entity.prototype.setCenter = function(center){ this.getShape().moveTo(center) }

Entity.prototype.isOnFloor = function() {
	// THIS IS A GLOBAL NOW var edgeQuad = new EdgeQuad();
	CollisionDetector.onEntityWorld(this, edgeQuad, gameState.world);
	return (edgeQuad.edges[EDGE_FLOOR] != null);
}

Entity.prototype.tick = function(){ throw 'Entity.tick() unimplemented'; }
Entity.prototype.draw = function(){ throw 'Entity.draw() unimplemented'; }

Entity.prototype.onDeath = function() {}
Entity.prototype.onRespawn = function() {}
