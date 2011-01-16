#require <class.js>
#require <enemy.js>

HoveringEnemy.subclasses(Enemy);

/**
  * Abstract class representing a Hovering Enemy
  */
function HoveringEnemy(type, center, radius, elasticity) {
	Enemy.prototype.constructor.call(this, type, elasticity);

	this.hitCircle = new Circle(center, radius);
}

HoveringEnemy.prototype.getShape = function() {
	return this.hitCircle;
};
