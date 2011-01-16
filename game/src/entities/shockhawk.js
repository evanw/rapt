#require <class.js>
#require <hoveringenemy.js>

var SHOCK_HAWK_RADIUS = 0.3;
var SHOCK_HAWK_ACCEL = 6;
var SHOCK_HAWK_DECEL = 0.8;
var SHOCK_HAWK_RANGE = 10;

ShockHawk.subclasses(HoveringEnemy);

function ShockHawk(center, target) {
	HoveringEnemy.prototype.constructor.call(this, ENEMY_SHOCK_HAWK, center, SHOCK_HAWK_RADIUS, 0);
	this.target = target;
	this.chasing = false;

	this.bodySprite = new Sprite();
	this.bodySprite.drawGeometry = function(c) {
		// draw solid center
		c.beginPath();
		c.moveTo(0, -0.15);
		c.lineTo(0.05, -0.1);
		c.lineTo(0, 0.1);
		c.lineTo(-0.05, -0.1);
		c.fill();

		// draw outlines
		c.beginPath();
		for(var scale = -1; scale <= 1; scale += 2) {
			c.moveTo(0, -0.3);
			c.lineTo(scale * 0.05, -0.2);
			c.lineTo(scale * 0.1, -0.225);
			c.lineTo(scale * 0.1, -0.275);
			c.lineTo(scale * 0.15, -0.175);
			c.lineTo(0, 0.3);

			c.moveTo(0, -0.15);
			c.lineTo(scale * 0.05, -0.1);
			c.lineTo(0, 0.1);
		}
		c.stroke();
	};
}

ShockHawk.prototype.getTarget = function() { return target === gameState.playerB; }
ShockHawk.prototype.setTarget = function(player) { this.target = player; }

ShockHawk.prototype.avoidsSpawn = function() {
	if (this.chasing) {
		return false;
	} else {
		return true;
	}
}

ShockHawk.prototype.move = function(seconds) {
	// Time independent version of multiplying by 0.998
	// solved x^0.01 = 0.998 for x very precisely using wolfram alpha
	this.velocity.inplaceMul(Math.pow(0.8185668046884278157989334904543296243702023236680159019579, seconds));
	if (!this.target || this.target.isDead()) {
		this.chasing = false;
		return this.accelerate(this.velocity.mul(-SHOCK_HAWK_DECEL), seconds);
	}
	var relTargetPos = this.target.getCenter().sub(this.getCenter());
	if (relTargetPos.lengthSquared() > (SHOCK_HAWK_RANGE * SHOCK_HAWK_RANGE)) {
		this.chasing = false;
		return this.accelerate(this.velocity.mul(-SHOCK_HAWK_DECEL), seconds);
	}
	this.chasing = true;
	relTargetPos.normalize();
	var accel = relTargetPos.mul(SHOCK_HAWK_ACCEL);
	return this.accelerate(accel, seconds);
}

ShockHawk.prototype.onDeath = function() {
	gameState.incrementStat(STAT_ENEMY_DEATHS);
}

ShockHawk.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.bodySprite.offsetBeforeRotation = position;
	if(!this.target.isDead()) {
		this.bodySprite.angle = this.target.getCenter().sub(position).atan2() - Math.PI / 2;
	}
}

ShockHawk.prototype.draw = function(c) {
	c.fillStyle = (this.target == gameState.playerA) ? 'red' : 'blue';
	c.strokeStyle = 'black';
	this.bodySprite.draw(c);
}
