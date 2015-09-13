#require <class.js>
#require <freefallenemy.js>

var STALACBAT_RADIUS = 0.2;
var STALACBAT_SPEED = 2;
var STALACBAT_SPRITE_BODY = 0;
var STALACBAT_SPRITE_LEFT_WING = 1;
var STALACBAT_SPRITE_RIGHT_WING = 2;

Stalacbat.subclasses(FreefallEnemy);

function Stalacbat(center, target) {
	FreefallEnemy.prototype.constructor.call(this, ENEMY_STALACBAT, center, STALACBAT_RADIUS, 0);
	this.target = target;
	this.isFalling = false;

	this.sprites = [new Sprite(), new Sprite(), new Sprite()];
	// Draw circle for body
	this.sprites[STALACBAT_SPRITE_BODY].drawGeometry = function(c) {
		c.strokeStyle = 'black';
		c.beginPath();
		c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
		c.stroke();
		c.fill();
	}
	// Draw the two wings 
	this.sprites[STALACBAT_SPRITE_LEFT_WING].drawGeometry = this.sprites[STALACBAT_SPRITE_RIGHT_WING].drawGeometry = function(c) {
		c.strokeStyle = 'black';
		c.beginPath();
		c.arc(0, 0, 0.2, 0, Math.PI / 2, false);
		c.arc(0, 0, 0.15, Math.PI / 2, 0, true);
		c.stroke();

		c.beginPath();
		c.moveTo(0.07, 0.07);
		c.lineTo(0.1, 0.1);
		c.stroke();
	}

	this.sprites[STALACBAT_SPRITE_LEFT_WING].setParent(this.sprites[STALACBAT_SPRITE_BODY]);
	this.sprites[STALACBAT_SPRITE_RIGHT_WING].setParent(this.sprites[STALACBAT_SPRITE_BODY]);
}

// Falls when the target is directly beneat it
Stalacbat.prototype.move = function(seconds) {
	if (this.isFalling) {
		return FreefallEnemy.prototype.move.call(this, seconds);
	} else if (this.target !== null && !this.target.isDead()) {
		var playerPos = this.target.getCenter();
		var pos = this.getCenter();
		if ((Math.abs(playerPos.x - pos.x) < 0.1) && (playerPos.y < pos.y)) {
			if (!CollisionDetector.lineOfSightWorld(pos, playerPos, gameState.world)) {
				this.isFalling = true;
				return FreefallEnemy.prototype.move.call(this, seconds);
			}
		}
	}
	return new Vector(0, 0);
}

Stalacbat.prototype.getTarget = function() {
	return this.target === gameState.playerB;
}

Stalacbat.prototype.afterTick = function(seconds) {
	var percent = this.velocity.y * -0.25;
	if (percent > 1) {
		percent = 1;
	}

	var position = this.getCenter();
	this.sprites[STALACBAT_SPRITE_BODY].offsetBeforeRotation = new Vector(position.x, position.y + 0.1 - 0.2 * percent);

	var angle = percent * Math.PI / 2;
	this.sprites[STALACBAT_SPRITE_LEFT_WING].angle = Math.PI - angle;
	this.sprites[STALACBAT_SPRITE_RIGHT_WING].angle = angle - Math.PI / 2;
}

Stalacbat.prototype.onDeath = function() {
	gameState.incrementStat(STAT_ENEMY_DEATHS);

	var isRed = (this.target === gameState.playerA) ? 0.8 : 0;
	var isBlue = (this.target === gameState.playerB) ? 1 : 0;

	var position = this.getCenter();
	for (var i = 0; i < 15; ++i) {
		var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(5, 10));
		Particle().position(position).velocity(direction).radius(0.2).bounces(3).decay(0.01).elasticity(0.5).color(isRed, 0, isBlue, 1).triangle();
	}
}

Stalacbat.prototype.draw = function(c) {
	// Draw the colored "eye"
	if (this.target === gameState.playerA) {
		c.fillStyle = 'red';
	}
	else {
		c.fillStyle = 'blue';
	}

	// Draw the black wings
	this.sprites[STALACBAT_SPRITE_BODY].draw(c);
}
