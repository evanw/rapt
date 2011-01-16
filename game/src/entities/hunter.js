#require <class.js>
#require <rotatingenemy.js>

var HUNTER_BODY = 0;
var HUNTER_CLAW1 = 1;
var HUNTER_CLAW2 = 2;

var HUNTER_RADIUS = 0.3;
var HUNTER_ELASTICITY = 0.4;
var HUNTER_CHASE_ACCEL = 14;
var HUNTER_FLEE_ACCEL = 3;
var HUNTER_FLEE_RANGE = 10;
var HUNTER_CHASE_RANGE = 8;
var HUNTER_LOOKAHEAD = 20;

var STATE_IDLE = 0;
var STATE_RED = 1;
var STATE_BLUE = 2;
var STATE_BOTH = 3;

Hunter.subclasses(RotatingEnemy);

function Hunter(center) {
	RotatingEnemy.prototype.constructor.call(this, ENEMY_HUNTER, center, HUNTER_RADIUS, 0, HUNTER_ELASTICITY);

	this.state = STATE_IDLE;
	this.acceleration = new Vector(0, 0);
	this.jawAngle = 0;

	this.sprites = [new Sprite(), new Sprite(), new Sprite()];
	this.sprites[HUNTER_BODY].drawGeometry = function(c) {
		c.beginPath();
		c.arc(0, 0, 0.1, 0, 2*Math.PI, false);
		c.stroke();
	};
	this.sprites[HUNTER_CLAW1].drawGeometry = this.sprites[HUNTER_CLAW2].drawGeometry = function(c) {
		c.beginPath();
		c.moveTo(0, 0.1);
		for(var i = 0; i <= 6; i++)
			c.lineTo((i & 1) / 24, 0.2 + i * 0.05);
		c.arc(0, 0.2, 0.3, 0.5*Math.PI, -0.5*Math.PI, true);
		c.stroke();
	};
	this.sprites[HUNTER_CLAW1].setParent(this.sprites[HUNTER_BODY]);
	this.sprites[HUNTER_CLAW2].setParent(this.sprites[HUNTER_BODY]);
	this.sprites[HUNTER_CLAW2].flip = true;
	this.sprites[HUNTER_BODY].offsetAfterRotation = new Vector(0, -0.2);
}

Hunter.prototype.avoidsSpawn = function() { return true; };

Hunter.prototype.calcAcceleration = function(target) {
	return target.unit().sub(this.velocity.mul(3.0 / HUNTER_CHASE_ACCEL)).unit().mul(HUNTER_CHASE_ACCEL);
};

Hunter.prototype.playerInSight = function(target, distanceSquared) {
	if (target.isDead()) return false;
	var inSight = distanceSquared < (HUNTER_CHASE_RANGE * HUNTER_CHASE_RANGE);
	inSight &= !CollisionDetector.lineOfSightWorld(this.getCenter(), target.getCenter(), gameState.world);
	return inSight;
};

Hunter.prototype.move = function(seconds) {
	// Relative player positions
	var deltaA = gameState.playerA.getCenter().sub(this.getCenter());
	var deltaB = gameState.playerB.getCenter().sub(this.getCenter());
	// Projection positions with lookahead
	var projectedA = deltaA.add(gameState.playerA.getVelocity().mul(HUNTER_LOOKAHEAD * seconds));
	var projectedB = deltaB.add(gameState.playerB.getVelocity().mul(HUNTER_LOOKAHEAD * seconds));
	// Squared distances
	var distASquared = deltaA.lengthSquared();
	var distBSquared = deltaB.lengthSquared();
	// Checks if players are in sight
	var inSightA = this.playerInSight(gameState.playerA, distASquared);
	var inSightB = this.playerInSight(gameState.playerB, distBSquared);

	// If player A is in sight
	if (inSightA) {
		// If both in sight
		if (inSightB) {
			// If they're on the same side of the Hunter, the Hunter will flee
			if ((deltaA.dot(this.velocity) * deltaB.dot(this.velocity)) >= 0) {
				this.acceleration = deltaA.unit().add(deltaB.unit()).mul(-.5 * HUNTER_FLEE_ACCEL);
				this.target = null;
				this.state = STATE_BOTH;
			} else if (distASquared < distBSquared) {
				// Otherwise the hunter will chase after the closer of the two players
				this.acceleration = this.calcAcceleration(projectedA);
				this.target = gameState.playerA;
				this.state = STATE_RED;
			} else {
				this.acceleration = this.calcAcceleration(projectedB);
				this.target = gameState.playerB;
				this.state = STATE_BLUE;
			}
		// If only player A in sight
		} else {
			this.acceleration = this.calcAcceleration(projectedA);
			this.target = gameState.playerA;
			this.state = STATE_RED;
		}
	} else if (inSightB) {
		// If only player B in sight
		this.acceleration = this.calcAcceleration(projectedB);
		this.target = gameState.playerB;
		this.state = STATE_BLUE;
	} else {
		this.acceleration.x = this.acceleration.y = 0;
		this.target = null;
		this.state = STATE_IDLE;
	}

	// Damp the movement so it doesn't keep floating around
	// Time independent version of multiplying by 0.99
	this.velocity.inplaceMul(Math.pow(0.366032, seconds));

	return this.accelerate(this.acceleration, seconds);
};

Hunter.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.sprites[HUNTER_BODY].offsetBeforeRotation = position;

	if (this.target)
	{
		var currentAngle = this.sprites[HUNTER_BODY].angle;
		var targetAngle = this.target.getCenter().sub(position).atan2() - Math.PI / 2;
		this.sprites[HUNTER_BODY].angle = adjustAngleToTarget(currentAngle, targetAngle, Math.PI * seconds);
	}

	var targetJawAngle = this.target ? -0.2 : 0;
	this.jawAngle = adjustAngleToTarget(this.jawAngle, targetJawAngle, 0.4 * seconds);
	this.sprites[HUNTER_CLAW1].angle = this.jawAngle;
	this.sprites[HUNTER_CLAW2].angle = this.jawAngle;
};

Hunter.prototype.draw = function(c) {
	c.fillStyle = (this.target == gameState.playerA) ? 'red' : 'blue';
	c.strokeStyle = 'black';

	if (this.state != STATE_IDLE)
	{
		var angle = this.sprites[HUNTER_BODY].angle + Math.PI / 2;
		var fromEye = Vector.fromAngle(angle);
		var eye = this.getCenter().sub(fromEye.mul(0.2));

		if(this.state == STATE_RED) {
			c.fillStyle = 'red';
			c.beginPath();
			c.arc(eye.x, eye.y, 0.1, 0, 2*Math.PI, false);
			c.fill();
		} else if(this.state == STATE_BLUE) {
			c.fillStyle = 'blue';
			c.beginPath();
			c.arc(eye.x, eye.y, 0.1, 0, 2*Math.PI, false);
			c.fill();
		} else {
			c.fillStyle = 'red';
			c.beginPath();
			c.arc(eye.x, eye.y, 0.1, angle, angle + Math.PI, false);
			c.fill();

			c.fillStyle = 'blue';
			c.beginPath();
			c.arc(eye.x, eye.y, 0.1, angle + Math.PI, angle + 2*Math.PI, false);
			c.fill();

			c.beginPath();
			c.moveTo(eye.x - fromEye.x * 0.1, eye.y - fromEye.y * 0.1);
			c.lineTo(eye.x + fromEye.x * 0.1, eye.y + fromEye.y * 0.1);
			c.stroke();
		}
	}

	this.sprites[HUNTER_BODY].draw(c);
};
