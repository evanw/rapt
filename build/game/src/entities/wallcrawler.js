#require <class.js>
#require <walkingenemy.js>

var WALL_CRAWLER_SPEED = 1;
var WALL_CRAWLER_RADIUS = 0.25;
var PULL_FACTOR = 0.9;
var PUSH_FACTOR = 0.11;

WallCrawler.subclasses(WalkingEnemy);

function WallCrawler(center, direction) {
	WalkingEnemy.prototype.constructor.call(this, ENEMY_CRAWLER, center, WALL_CRAWLER_RADIUS, 0);

	this.firstTick = true;
	this.clockwise = false;
	this.velocity = new Vector(Math.cos(direction), Math.sin(direction));

	this.bodySprite = new Sprite();
	this.bodySprite.drawGeometry = function(c) {
		var space = 0.15;
		c.fillStyle = 'black';
		c.strokeStyle = 'black';
		c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.25 + space, Math.PI * 0.75 - space, false); c.stroke();
		c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.75 + space, Math.PI * 1.25 - space, false); c.stroke();
		c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.25 + space, Math.PI * 1.75 - space, false); c.stroke();
		c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.75 + space, Math.PI * 2.25 - space, false); c.stroke();
		c.beginPath(); c.arc(0, 0, 0.15, 0, 2*Math.PI, false); c.stroke();
		c.beginPath();
		c.moveTo(0.15, 0); c.lineTo(0.25, 0);
		c.moveTo(0, 0.15); c.lineTo(0, 0.25);
		c.moveTo(-0.15, 0); c.lineTo(-0.25, 0);
		c.moveTo(0, -0.15); c.lineTo(0, -0.25);
		c.stroke();
		c.beginPath(); c.arc(0, 0, 0.05, 0, 2*Math.PI, false); c.fill();
	};
}

// Rotates about the closest point in the world
WallCrawler.prototype.move = function(seconds) {
	var ref_shapePoint = {};
	var ref_worldPoint = {};
	var closestPointDist = CollisionDetector.closestToEntityWorld(this, 2, ref_shapePoint, ref_worldPoint, gameState.world);

	if (closestPointDist < Number.POSITIVE_INFINITY) {
		var delta = this.getCenter().sub(ref_worldPoint.ref);
		// Make sure it doesn't get too far away or get stuck in corners
		var flip = delta.flip();

		if (this.firstTick) {
			if (this.velocity.dot(flip) < 0) this.clockwise = true;
			else this.clockwise = false;
			this.firstTick = false;
		}
		if (delta.lengthSquared() > (WALL_CRAWLER_RADIUS * WALL_CRAWLER_RADIUS * 1.1)) {
			// Pull the crawler towards the wall
			if (this.clockwise) this.velocity = flip.mul(-1).sub(delta.mul(PULL_FACTOR));
			else this.velocity = flip.sub(delta.mul(PULL_FACTOR));
		} else {
			// Push the crawler away from the wall
			if (this.clockwise) this.velocity = flip.mul(-1).add(delta.mul(PUSH_FACTOR));
			else this.velocity = flip.add(delta.mul(PUSH_FACTOR));
		}
		this.velocity.normalize();
	}

	return this.velocity.mul(WALL_CRAWLER_SPEED * seconds);
};

WallCrawler.prototype.afterTick = function(seconds) {
	var deltaAngle = WALL_CRAWLER_SPEED / WALL_CRAWLER_RADIUS * seconds;
	this.bodySprite.offsetBeforeRotation = this.getCenter();
	if (this.clockwise) this.bodySprite.angle += deltaAngle;
	else this.bodySprite.angle -= deltaAngle;
};

WallCrawler.prototype.draw = function(c) {
	this.bodySprite.draw(c);
};
