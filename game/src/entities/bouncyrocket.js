#require <class.js>
#require <rocket.js>

var BOUNCY_ROCKET_SPEED = 4;
var BOUNCY_ROCKET_MAX_ROTATION = 3;
var BOUNCY_ROCKET_HEALTH = 2;

function drawBouncyRocket(c, isBlue) {
	var size = 0.1;
	c.strokeStyle = 'black';

	c.fillStyle = isBlue ? 'blue' : 'red';
	c.beginPath();
	c.moveTo(-ROCKET_RADIUS, size);
	c.arc(ROCKET_RADIUS - size, 0, size, Math.PI / 2, -Math.PI / 2, true);
	c.lineTo(-ROCKET_RADIUS, -size);
	c.fill();
	c.stroke();

	c.fillStyle = isBlue ? 'red' : 'blue';
	c.beginPath();
	c.arc(-ROCKET_RADIUS, 0, size, -Math.PI / 2, Math.PI / 2, false);
	c.closePath();
	c.fill();
	c.stroke();
}

BouncyRocket.subclasses(Rocket);

function BouncyRocket(center, target, heading, launcher) {
	Rocket.prototype.constructor.call(this, center, target, heading, BOUNCY_ROCKET_MAX_ROTATION, ENEMY_BOUNCY_ROCKET);
	this.velocity = new Vector(BOUNCY_ROCKET_SPEED * Math.cos(heading), BOUNCY_ROCKET_SPEED * Math.sin(heading));
	this.launcher = launcher;
	this.hitsUntilExplodes = BOUNCY_ROCKET_HEALTH;

	this.sprites[ROCKET_SPRITE_RED].drawGeometry = function(c) {
		drawBouncyRocket(c, false);
	};
	this.sprites[ROCKET_SPRITE_BLUE].drawGeometry = function(c) {
		drawBouncyRocket(c, true);
	};
}

BouncyRocket.prototype.move = function(seconds) {
	this.heading = this.velocity.atan2();
	this.calcHeading(seconds);
	this.velocity = new Vector(BOUNCY_ROCKET_SPEED * Math.cos(this.heading), BOUNCY_ROCKET_SPEED * Math.sin(this.heading));
	return this.velocity.mul(seconds);
}

BouncyRocket.prototype.reactToWorld = function(contact) {
	--this.hitsUntilExplodes;

	if (this.hitsUntilExplodes <= 0) {
		this.setDead(true);
	} else {
		this.target = gameState.getOtherPlayer(this.target);
	}
}

BouncyRocket.prototype.setDead = function(isDead) {
	Entity.prototype.setDead.call(this, isDead);
	if (isDead && this.launcher !== null) {
		this.launcher.rocketDestroyed();
	}
}
