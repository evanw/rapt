#require <class.js>
#require <rotatingenemy.js>

var CORROSION_CLOUD_RADIUS = .5;
var CORROSION_CLOUD_SPEED = .7;
var CORROSION_CLOUD_ACCEL = 10;

CorrosionCloud.subclasses(RotatingEnemy);

function CorrosionCloud(center, target) {
	RotatingEnemy.prototype.constructor.call(this, ENEMY_CLOUD, center, CORROSION_CLOUD_RADIUS, 0, 0);

	this.target = target;
	this.smoothedVelocity = new Vector(0, 0);
}

CorrosionCloud.prototype.canCollide = function() {
	return false;
}

CorrosionCloud.prototype.avoidsSpawn = function() {
	return true;
}

CorrosionCloud.prototype.move = function(seconds) {
	var avoidingSpawn = false;
	if (!this.target) return new Vector(0, 0);
	var targetDelta = this.target.getCenter().sub(this.getCenter());
	// As long as the max rotation is over 2 pi, it will rotate to face the player no matter what
	this.heading = adjustAngleToTarget(this.heading, targetDelta.atan2(), 7);
	// ACCELERATION
	var speed = CORROSION_CLOUD_SPEED * CORROSION_CLOUD_ACCEL * seconds;
	this.velocity.x += speed * Math.cos(this.heading);
	this.velocity.y += speed * Math.sin(this.heading);

	if (this.velocity.lengthSquared() > (CORROSION_CLOUD_SPEED * CORROSION_CLOUD_SPEED)) {
		this.velocity.normalize();
		this.velocity.inplaceMul(CORROSION_CLOUD_SPEED);
	}

	return this.velocity.mul(seconds);
};

CorrosionCloud.prototype.afterTick = function(seconds) {
	var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
	var center = this.getCenter().add(direction.mul(randInRange(0, CORROSION_CLOUD_RADIUS)));

	var isRed = (this.target === gameState.playerA) ? 0.4 : 0;
	var isBlue = (this.target === gameState.playerB) ? 0.3 : 0;

	this.smoothedVelocity = this.smoothedVelocity.mul(0.95).add(this.velocity.mul(0.05));
	Particle().position(center).velocity(this.smoothedVelocity.sub(new Vector(0.1, 0.1)), this.smoothedVelocity.add(new Vector(0.1, 0.1))).radius(0.01, 0.1).bounces(0, 4).elasticity(0.05, 0.9).decay(0.01, 0.5).expand(1, 1.2).color(0.2 + isRed, 0.2, 0.2 + isBlue, 1).mixColor(0.1 + isRed, 0.1, 0.1 + isBlue, 1).circle().gravity(-0.4, 0);
};

CorrosionCloud.prototype.getTarget = function() {
	return this.target === gameState.playerB;
};

CorrosionCloud.prototype.draw = function(c) {
	// do nothing, it's all particles!
};
