#require <class.js>
#require <enemy.js>

RotatingEnemy.subclasses(Enemy);

/**
  * Abstract class representing enemies that may rotating, including seeking enemies.
  * These enemies are all circular.
  */
function RotatingEnemy(type, center, radius, heading, elasticity) {
	Enemy.prototype.constructor.call(this, type, elasticity);

	this.hitCircle = new Circle(center, radius);
	this.heading = heading;
}

RotatingEnemy.prototype.getShape = function() {
	return this.hitCircle;
};
