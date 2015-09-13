#require <class.js>
#require <enemy.js>

var FREEFALL_ACCEL = -6;

FreefallEnemy.subclasses(Enemy);

function FreefallEnemy(type, center, radius, elasticity) {
	Enemy.prototype.constructor.call(this, type, elasticity);

	this.hitCircle = new Circle(center, radius);
}

FreefallEnemy.prototype.getShape = function() {
	return this.hitCircle;
};

FreefallEnemy.prototype.draw = function(c) {
	var pos = this.hitCircle.center;
	c.fillStyle = 'black';
	c.beginPath();
	c.arc(pos.x, pos.y, this.hitCircle.radius, 0, Math.PI*2, false);
	c.fill();
};

// This moves the enemy and constrains its position
FreefallEnemy.prototype.move = function(seconds) {
	return this.accelerate(new Vector(0, FREEFALL_ACCEL), seconds);
};

// Enemy's reaction to a collision with the World
FreefallEnemy.prototype.reactToWorld = function(contact) {
	this.setDead(true);
};

// Enemy's reaction to a collision with a Player
FreefallEnemy.prototype.reactToPlayer = function(player) {
	this.setDead(true);
	player.setDead(true);
};
