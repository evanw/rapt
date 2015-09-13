#require <class.js>
#require <hoveringenemy.js>

var HEADACHE_RADIUS = .15;
var HEADACHE_ELASTICITY = 0;
var HEADACHE_SPEED = 3;
var HEADACHE_RANGE = 6;

var HEADACHE_CLOUD_RADIUS = HEADACHE_RADIUS * 0.5;

function HeadacheChain(center) {
	this.points = [];
	this.point = new Vector(center.x * gameScale, center.y * gameScale);
	this.point.x += (Math.random() - 0.5) * HEADACHE_RADIUS;
	this.point.y += (Math.random() - 0.5) * HEADACHE_RADIUS;
	this.angle = Math.random() * Math.PI * 2;
}

HeadacheChain.prototype.tick = function(seconds, center) {
	var speed = 600;
	
	var dx = this.point.x - center.x * gameScale;
	var dy = this.point.y - center.y * gameScale;
	var percentFromCenter = Math.min(1, Math.sqrt(dx*dx + dy*dy) / HEADACHE_CLOUD_RADIUS);
	
	var angleFromCenter = Math.atan2(dy, dx) - this.angle;
	while (angleFromCenter < -Math.PI) angleFromCenter += Math.PI * 2;
	while (angleFromCenter > Math.PI) angleFromCenter -= Math.PI * 2;
	var percentHeading = (Math.PI - Math.abs(angleFromCenter)) / Math.PI;
	
	var randomOffset = speed * (Math.random() - 0.5) * seconds;
	this.angle += randomOffset * (1 - percentFromCenter * 0.8) + percentHeading * percentFromCenter * (angleFromCenter > 0 ? -2 : 2);
	this.angle -= Math.floor(this.angle / (Math.PI * 2)) * Math.PI * 2;
	
	this.point.x += speed * Math.cos(this.angle) * seconds;
	this.point.y += speed * Math.sin(this.angle) * seconds;
	this.points.push(new Vector(this.point.x, this.point.y));
	if (this.points.length > 15) this.points.shift();
};

HeadacheChain.prototype.draw = function(c) {
	for (var i = 1; i < this.points.length; i++) {
		var a = this.points[i - 1];
		var b = this.points[i];
		c.strokeStyle = 'rgba(0, 0, 0, ' + (i / this.points.length).toFixed(3) + ')';
		c.beginPath();
		c.moveTo(a.x / gameScale, a.y / gameScale);
		c.lineTo(b.x / gameScale, b.y / gameScale);
		c.stroke();
	}
};

Headache.subclasses(HoveringEnemy);

function Headache(center, target) {
	HoveringEnemy.prototype.constructor.call(this, ENEMY_HEADACHE, center, HEADACHE_RADIUS, HEADACHE_ELASTICITY);

	this.target = target;
	this.isAttached = false;
	this.isTracking = false;
	this.restingOffset = new Vector(0, -10);

	this.chains = [];
	for (var i = 0; i < 4; i++) {
		this.chains.push(new HeadacheChain(center));
	}
}

Headache.prototype.move = function(seconds) {
	this.isTracking = false;

	// If the headache isn't yet attached to a Player
	if (!this.isAttached) {
		if (this.target.isDead()) return new Vector(0, 0);
		var delta = this.target.getCenter().sub(this.getCenter());
		if (delta.lengthSquared() < (HEADACHE_RANGE * HEADACHE_RANGE) && !CollisionDetector.lineOfSightWorld(this.getCenter(), this.target.getCenter(), gameState.world)) {
			// Seeks the top of the Player, not the center
			delta.y += 0.45;
			// Multiply be 3 so it attaches more easily if its close to a player
			if (delta.lengthSquared() > (HEADACHE_SPEED * seconds * HEADACHE_SPEED * seconds * 3))
			{
				this.isTracking = true;
				delta.normalize();
				delta = delta.mul(HEADACHE_SPEED * seconds);
			} else {
				this.isAttached = true;
			}
			return delta;
		}
	} else {
		// If a headache is attached to a dead player, it vanishes
		if (this.target.isDead()) {
			this.setDead(true);
		}
		// Otherwise it moves with the player
		var delta = this.target.getCenter().add(new Vector(0, 0.45)).sub(this.getCenter());
		// If player is crouching, adjust position
		if (this.target.getCrouch() && this.target.isOnFloor())
		{
			delta.y -= 0.25;
			if (this.target.facingRight) delta.x += 0.15;
			else delta.x -= 0.15;
		}
		this.hitCircle.moveBy(delta);
	}
	return new Vector(0, 0);
};

Headache.prototype.reactToWorld = function() {
	// Nothing happens
};

Headache.prototype.onDeath = function() {
	gameState.incrementStat(STAT_ENEMY_DEATHS);
	
	var position = this.getCenter();

	// body
	var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
	var body = Particle().position(position).velocity(direction).radius(HEADACHE_RADIUS).bounces(3).elasticity(0.5).decay(0.01).circle().gravity(5);
	if (this.target == gameState.playerA) {
		body.color(1, 0, 0, 1);
	} else {
		body.color(0, 0, 1, 1);
	}

	// black lines out from body
	for (var i = 0; i < 50; ++i) {
		var rotationAngle = randInRange(0, 2 * Math.PI);
		var direction = Vector.fromAngle(rotationAngle).mul(randInRange(3, 5));
		Particle().position(this.getCenter()).velocity(direction).angle(rotationAngle).radius(0.05).bounces(3).elasticity(0.5).decay(0.01).line().color(0, 0, 0, 1);
	}
};

Headache.prototype.reactToPlayer = function(player) {
	if (player === this.target) {
		player.disableJump();
	} else if (player.getVelocity().y < 0 && player.getCenter().y > this.getCenter().y) {
		// The other player must jump on the headache from above to kill it
		this.setDead(true);
	}
};

Headache.prototype.getTarget = function() {
	return this.target === gameState.playerB;
};

Headache.prototype.afterTick = function(seconds) {
	var center = this.getCenter();
	for (var i = 0; i < this.chains.length; i++) {
		this.chains[i].tick(seconds, center);
	}
};

Headache.prototype.draw = function(c) {
	var center = this.getCenter();
	
	c.strokeStyle = 'black';
	for (var i = 0; i < this.chains.length; i++) {
		this.chains[i].draw(c);
	}
	
	c.fillStyle = (this.target == gameState.playerA) ? 'red' : 'blue';
	c.beginPath();
	c.arc(center.x, center.y, HEADACHE_RADIUS * 0.75, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
};
