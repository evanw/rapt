#require <class.js>
#require <rotatingenemy.js>

var ROCKET_SPRITE_RED = 0;
var ROCKET_SPRITE_BLUE = 1;

var ROCKET_SPEED = 2.5;
// Max rotation in radians / second
var ROCKET_MAX_ROTATION = 8;
var ROCKET_RADIUS = .15;
var ROCKET_ELASTICITY = 1;
// In seconds, the amount of time the Rocket's direction is fixed
var ROCKET_HEADING_CONSTRAINT_TIME = 0.3;
var PARTICLE_FREQUENCY = 0.03;

function drawRocket(c) {
	var size = 0.075;
	c.strokeStyle = 'black';
	c.beginPath();
	c.moveTo(-ROCKET_RADIUS, size);
	c.lineTo(ROCKET_RADIUS - size, size);
	c.lineTo(ROCKET_RADIUS, 0);
	c.lineTo(ROCKET_RADIUS - size, -size);
	c.lineTo(-ROCKET_RADIUS, -size);
	c.closePath();
	c.fill();
	c.stroke();
}

Rocket.subclasses(RotatingEnemy);

function Rocket(center, target, heading, maxRotation, type) {
	RotatingEnemy.prototype.constructor.call(this, type, center, ROCKET_RADIUS, heading, ROCKET_ELASTICITY);
	this.target = target;
	this.maxRotation = maxRotation;
	this.timeUntilFree = ROCKET_HEADING_CONSTRAINT_TIME;
	this.timeUntilNextParticle = 0;
	this.velocity = new Vector(ROCKET_SPEED * Math.cos(heading), ROCKET_SPEED * Math.sin(heading));

	this.sprites = [new Sprite(), new Sprite];
	this.sprites[ROCKET_SPRITE_RED].drawGeometry = function(c) {
		c.fillStyle = 'red';
		drawRocket(c);
	};
	this.sprites[ROCKET_SPRITE_BLUE].drawGeometry = function(c) {
		c.fillStyle = 'blue';
		drawRocket(c);
	};
}

Rocket.prototype.getTarget = function() { return this.target === gameState.playerB; }

Rocket.prototype.setTarget = function(player) { this.target = player; }

Rocket.prototype.calcHeading = function(seconds) {
	if (this.target.isDead()) return;
	var delta = this.target.getCenter().sub(this.getCenter());
	var angle = delta.atan2();
	this.heading = adjustAngleToTarget(this.heading, angle, this.maxRotation * seconds);
}

Rocket.prototype.move = function(seconds) {
	if (this.timeUntilFree <= 0) {
		this.calcHeading(seconds);
		this.velocity = new Vector(ROCKET_SPEED * Math.cos(this.heading), ROCKET_SPEED * Math.sin(this.heading));
	} else {
		this.timeUntilFree -= seconds;
	}
	return this.velocity.mul(seconds);
}

Rocket.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.sprites[ROCKET_SPRITE_RED].offsetBeforeRotation = position;
	this.sprites[ROCKET_SPRITE_BLUE].offsetBeforeRotation = position;
	this.sprites[ROCKET_SPRITE_RED].angle = this.heading;
	this.sprites[ROCKET_SPRITE_BLUE].angle = this.heading;

	position = position.sub(this.velocity.unit().mul(ROCKET_RADIUS));

	this.timeUntilNextParticle -= seconds;
	while (this.timeUntilNextParticle <= 0 && !this.isDead()) { // must test IsDead() otherwise particles go through walls
		// add a flame
		var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
		direction = direction.mul(randInRange(0, 2)).sub(this.velocity.mul(3));
		Particle().position(position).velocity(direction).radius(0.1, 0.15).bounces(1).decay(0.000001, 0.00001).expand(1.0, 1.2).color(1, 0.5, 0, 1).mixColor(1, 1, 0, 1).triangle();

		// add a puff of smoke
		direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
		direction = direction.mul(randInRange(0.25, 1)).sub(this.velocity);
		Particle().position(position).velocity(direction).radius(0.05, 0.1).bounces(1).elasticity(0.05, 0.9).decay(0.0005, 0.001).expand(1.2, 1.4).color(0, 0, 0, 0.25).mixColor(0.25, 0.25, 0.25, 0.75).circle().gravity(-0.4, 0);

		this.timeUntilNextParticle += PARTICLE_FREQUENCY;
	}
}

Rocket.prototype.reactToWorld = function(contact) {
	this.setDead(true);
}

Rocket.prototype.reactToPlayer = function(player) {
	this.setDead(true);
	player.setDead(true);
}

Rocket.prototype.onDeath = function() {
	var position = this.getCenter();

	// fire
	for (var i = 0; i < 50; ++i) {
		var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
		direction = direction.mul(randInRange(0.5, 17));

		Particle().position(position).velocity(direction).radius(0.02, 0.15).bounces(0, 4).elasticity(0.05, 0.9).decay(0.00001, 0.0001).expand(1.0, 1.2).color(1, 0.5, 0, 1).mixColor(1, 1, 0, 1).triangle();
	}
}

Rocket.prototype.draw = function(c) {
	this.sprites[this.target == gameState.playerA ? ROCKET_SPRITE_RED : ROCKET_SPRITE_BLUE].draw(c);
}
