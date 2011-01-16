#require <class.js>
#require <freefallenemy.js>

var LASER_RADIUS = .15;
var LASER_SPEED = 5;
var LASER_BOUNCES = 0;

Laser.subclasses(FreefallEnemy);

function Laser(center, direction) {
	FreefallEnemy.prototype.constructor.call(this, ENEMY_LASER, center, LASER_RADIUS, 1);

	this.bouncesLeft = LASER_BOUNCES;
	this.velocity = new Vector(LASER_SPEED * Math.cos(direction), LASER_SPEED * Math.sin(direction));
}

Laser.prototype.move = function(seconds) {
	return this.velocity.mul(seconds);
};

Laser.prototype.reactToWorld = function(contact) {
	if (this.bouncesLeft <= 0) {
		this.setDead(true);

		var position = this.getCenter();
		for (var i = 0; i < 20; ++i) {
			var angle = randInRange(0, 2 * Math.PI);
			var direction = Vector.fromAngle(angle);
			direction = direction.mul(randInRange(0.5, 5));

			Particle().position(position).velocity(direction).angle(angle).radius(0.1).bounces(1).elasticity(1).decay(0.01).gravity(0).color(1, 1, 1, 1).line();
		}
	} else {
		--this.bouncesLeft;
	}
};

Laser.prototype.draw = function(c) {
	var heading = this.velocity.unit().mul(LASER_RADIUS);
	var segment = new Segment(this.getCenter().sub(heading), this.getCenter().add(heading));
	c.lineWidth = .07;
	c.strokeStyle = 'white';
	segment.draw(c);
	c.lineWidth = .02;
};
