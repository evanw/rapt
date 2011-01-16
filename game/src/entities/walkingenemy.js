#require <class.js>
#require <enemy.js>

WalkingEnemy.subclasses(Enemy);

function WalkingEnemy(type, center, radius, elasticity) {
	Enemy.prototype.constructor.call(this, type, elasticity);

	this.hitCircle = new Circle(center, radius);
}

WalkingEnemy.prototype.getShape = function() {
	return this.hitCircle;
};

WalkingEnemy.prototype.move = function(seconds) {
	return this.velocity.mul(seconds);
};
