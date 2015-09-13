#require <class.js>
#require <enemy.js>

var SPIKE_BALL_RADIUS = 0.2;

function makeDrawSpikes(count) {
	var radii = [];
	for(var i = 0; i < count; i++) {
		radii.push(randInRange(0.5, 1.5));
	}
	return function(c) {
		c.strokeStyle = 'black';
		c.beginPath();
		for(var i = 0; i < count; i++) {
			var angle = i * (2 * Math.PI / count);
			var radius = SPIKE_BALL_RADIUS * radii[i];
			c.moveTo(0, 0);
			c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
		}
		c.stroke();
	};
}

SpikeBall.subclasses(Enemy);

// A boring old spike ball
function SpikeBall(center) {
	Enemy.prototype.constructor.call(this, ENEMY_SPIKE_BALL, 0);
	this.hitCircle = new Circle(center, SPIKE_BALL_RADIUS);

	this.sprites = [new Sprite(), new Sprite(), new Sprite()];

	this.sprites[0].drawGeometry = makeDrawSpikes(11);
	this.sprites[1].drawGeometry = makeDrawSpikes(13);
	this.sprites[2].drawGeometry = makeDrawSpikes(7);

	this.sprites[1].setParent(this.sprites[0]);
	this.sprites[2].setParent(this.sprites[0]);

	this.sprites[0].angle = randInRange(0, 2*Math.PI);
	this.sprites[1].angle = randInRange(0, 2*Math.PI);
	this.sprites[2].angle = randInRange(0, 2*Math.PI);
}

SpikeBall.prototype.getShape = function() { return this.hitCircle; }

SpikeBall.prototype.canCollide = function() { return false; }

SpikeBall.prototype.afterTick = function(seconds) {
	this.sprites[0].offsetBeforeRotation = this.getCenter();

	this.sprites[0].angle -= seconds * (25 * Math.PI / 180);
	this.sprites[1].angle += seconds * (65 * Math.PI / 180);
	this.sprites[2].angle += seconds * (15 * Math.PI / 180);
}

SpikeBall.prototype.draw = function(c) {
	this.sprites[0].draw(c);
}

