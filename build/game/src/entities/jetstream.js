#require <class.js>
#require <spawningenemy.js>

var JET_STREAM_WIDTH = 0.4;
var JET_STREAM_HEIGHT = 0.4;
var JET_STREAM_SHOOT_FREQ = 0.2;
var NUM_BARRELS = 3;

var JET_STREAM_SPRITE_A = 0;
var JET_STREAM_SPRITE_B = 1;

JetStream.subclasses(SpawningEnemy);

function JetStream(center, direction) {
	SpawningEnemy.prototype.constructor.call(this, ENEMY_JET_STREAM, center, JET_STREAM_WIDTH, JET_STREAM_HEIGHT, 0, JET_STREAM_SHOOT_FREQ, 0);
	this.direction = direction;
	this.reloadAnimation = 0;

	this.sprites = [new Sprite(), new Sprite()];
	this.sprites[JET_STREAM_SPRITE_A].drawGeometry = this.sprites[JET_STREAM_SPRITE_B].drawGeometry = function(c) {
		c.strokeStyle = 'black';
		c.beginPath();
		for(var i = 0; i < NUM_BARRELS; i++) {
			var angle = i * (2 * Math.PI / NUM_BARRELS);
			c.moveTo(0, 0);
			c.lineTo(0.2 * Math.cos(angle), 0.2 * Math.sin(angle));
		}
		c.stroke();
	};
}

JetStream.prototype.canCollide = function() { return false; }

JetStream.prototype.spawn = function() {
	gameState.addEnemy(new RiotBullet(this.getCenter(), this.direction), this.getCenter());
	return true;
}

JetStream.prototype.afterTick = function(seconds) {
	this.reloadAnimation += seconds * (0.5 / JET_STREAM_SHOOT_FREQ);

	var angle = this.reloadAnimation * (2 * Math.PI / NUM_BARRELS);
	var targetAngle = this.direction - Math.PI / 2;
	var bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);

	var position = this.getCenter();
	this.sprites[JET_STREAM_SPRITE_A].angle = targetAngle + angle;
	this.sprites[JET_STREAM_SPRITE_B].angle = targetAngle - angle;
	this.sprites[JET_STREAM_SPRITE_A].offsetBeforeRotation = position.sub(bodyOffset);
	this.sprites[JET_STREAM_SPRITE_B].offsetBeforeRotation = position.add(bodyOffset);

	// adjust for even NUM_BARRELS
	if (!(NUM_BARRELS & 1))
		this.sprites[JET_STREAM_SPRITE_B].angle += Math.PI / NUM_BARRELS;
}

JetStream.prototype.draw = function(c) {
	this.sprites[JET_STREAM_SPRITE_A].draw(c);
	this.sprites[JET_STREAM_SPRITE_B].draw(c);

	var angle = this.reloadAnimation * (2 * Math.PI / NUM_BARRELS);
	var targetAngle = this.direction - Math.PI / 2;
	var position = this.getCenter();
	var bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);

	c.fillStyle = 'yellow';
	c.strokeStyle = 'black';

	for(var side = -1; side <= 1; side += 2)
	{
		for(var i = 0; i < NUM_BARRELS; i++)
		{
			var theta = i * (2 * Math.PI / NUM_BARRELS) - side * angle;
			var reload = (this.reloadAnimation - i * side) / NUM_BARRELS + (side == 1) * 0.5;

			// adjust for even NUM_BARRELS
			if(side == 1 && !(NUM_BARRELS & 1))
			{
				theta += Math.PI / NUM_BARRELS;
				reload -= 0.5 / NUM_BARRELS;
			}

			reload -= Math.floor(reload);

			var pos = position.add(bodyOffset.mul(side)).add(bodyOffset.rotate(theta));
			c.beginPath();
			c.arc(pos.x, pos.y, 0.1 * reload, 0, 2*Math.PI, false);
			c.fill();
			c.stroke();
		}
	}
}
