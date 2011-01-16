#require <class.js>
#require <enemy.js>

var GOLDEN_COG_RADIUS = 0.25;

GoldenCog.subclasses(Enemy);

function GoldenCog(center) {
	Enemy.prototype.constructor.call(this, -1, 0);

	this.hitCircle = new Circle(center, GOLDEN_COG_RADIUS);
	this.timeSinceStart = 0;

	gameState.incrementStat(STAT_NUM_COGS);
}

GoldenCog.prototype.getShape = function() {
	return this.hitCircle;
};

GoldenCog.prototype.reactToPlayer = function(player) {
	this.setDead(true);
};

GoldenCog.prototype.onDeath = function() {
	if (gameState.gameStatus === GAME_IN_PLAY) {
		gameState.incrementStat(STAT_COGS_COLLECTED);
	}
	// Golden particle goodness
	var position = this.getCenter();
	for (var i = 0; i < 100; ++i) {
		var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
		direction = this.velocity.add(direction.mul(randInRange(1, 5)));

		Particle().position(position).velocity(direction).radius(0.01, 1.5).bounces(0, 4).elasticity(0.05, 0.9).decay(0.01, 0.5).color(0.9, 0.87, 0, 1).mixColor(1, 0.96, 0, 1).triangle();
	}
};

GoldenCog.prototype.afterTick = function(seconds) {
	this.timeSinceStart += seconds;
};

GoldenCog.prototype.draw = function(c) {
	var position = this.getCenter();
	drawGoldenCog(c, position.x, position.y, this.timeSinceStart);
};
