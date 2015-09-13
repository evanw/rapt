#require <class.js>
#require <rotatingenemy.js>

var DOOM_MAGNET_RADIUS = .3;
var DOOM_MAGNET_ELASTICITY = 0.5;
var DOOM_MAGNET_RANGE = 10;
var DOOM_MAGNET_ACCEL = 2;
var MAGNET_MAX_ROTATION = 2 * Math.PI;

DoomMagnet.subclasses(RotatingEnemy);

function DoomMagnet(center) {
	RotatingEnemy.prototype.constructor.call(this, ENEMY_MAGNET, center, DOOM_MAGNET_RADIUS, 0, DOOM_MAGNET_ELASTICITY);

	this.bodySprite = new Sprite();
	this.bodySprite.drawGeometry = function(c) {
		var length = 0.15;
		var outerRadius = 0.15;
		var innerRadius = 0.05;

		for (var scale = -1; scale <= 1; scale += 2) {
			c.fillStyle = 'red';
			c.beginPath();
			c.moveTo(-outerRadius - length, scale * innerRadius);
			c.lineTo(-outerRadius - length, scale * outerRadius);
			c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * outerRadius);
			c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * innerRadius);
			c.fill();

			c.fillStyle = 'blue';
			c.beginPath();
			c.moveTo(outerRadius + length, scale * innerRadius);
			c.lineTo(outerRadius + length, scale * outerRadius);
			c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * outerRadius);
			c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * innerRadius);
			c.fill();
		}
		c.strokeStyle = 'black';

		// draw one prong of the magnet 
		c.beginPath();
		c.arc(outerRadius, 0, outerRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
		c.lineTo(outerRadius + length, outerRadius);
		c.lineTo(outerRadius + length, innerRadius);

		c.arc(outerRadius, 0, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI, false);
		c.lineTo(outerRadius + length, -innerRadius);
		c.lineTo(outerRadius + length, -outerRadius);
		c.lineTo(outerRadius, -outerRadius);
		c.stroke();

		// other prong
		c.beginPath();
		c.arc(-outerRadius, 0, outerRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
		c.lineTo(-outerRadius - length, outerRadius);
		c.lineTo(-outerRadius - length, innerRadius);

		c.arc(-outerRadius, 0, innerRadius, 2.5 * Math.PI, 1.5 * Math.PI, true);
		c.lineTo(-outerRadius - length, -innerRadius);
		c.lineTo(-outerRadius - length, -outerRadius);
		c.lineTo(-outerRadius, -outerRadius);
		c.stroke();
	}
}

DoomMagnet.prototype.avoidsSpawn = function() { 
	return true;
};

DoomMagnet.prototype.calcHeadingVector = function(target) {
	if (target.isDead()) return new Vector(0, 0);
	var delta = target.getCenter().sub(this.getCenter());
	if (delta.lengthSquared() > (DOOM_MAGNET_RANGE * DOOM_MAGNET_RANGE)) return new Vector(0, 0);
	delta.normalize();
	return delta;
};

DoomMagnet.prototype.move = function(seconds) {
	var playerA = gameState.playerA;
	var playerB = gameState.playerB;

	var headingA = this.calcHeadingVector(playerA);
	var headingB = this.calcHeadingVector(playerB);
	var heading = (headingA.add(headingB)).mul(DOOM_MAGNET_ACCEL);

	var delta = this.accelerate(heading, seconds);
	// Time independent version of mulitiplying by 0.994
	this.velocity.inplaceMul(Math.pow(0.547821, seconds));

	var center = this.getCenter();
	var oldAngle = this.bodySprite.angle;
	var targetAngle = oldAngle;
	if(!playerA.isDead() && playerB.isDead()) {
		targetAngle = (playerA.getCenter().sub(center)).atan2() + Math.PI;
	} else if (playerA.isDead() && !playerB.isDead()) {
		targetAngle = (playerB.getCenter().sub(center)).atan2();
	} else if (!playerA.isDead() && !playerB.isDead()) {
		var needsFlip = (playerA.getCenter().sub(center).flip().dot(playerB.getCenter().sub(center)) < 0);
		targetAngle = heading.atan2() - Math.PI * 0.5 + Math.PI * needsFlip;
	}
	this.bodySprite.angle = adjustAngleToTarget(oldAngle, targetAngle, MAGNET_MAX_ROTATION * seconds);

	return delta;
};

DoomMagnet.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.bodySprite.offsetBeforeRotation = new Vector(position.x, position.y);
};

DoomMagnet.prototype.draw = function(c) {
	this.bodySprite.draw(c);
};
