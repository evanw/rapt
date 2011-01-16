#require <class.js>
#require <enemy.js>

SpawningEnemy.subclasses(Enemy);

function SpawningEnemy(type, center, width, height, elasticity, frequency, startingTime) {
	Enemy.prototype.constructor.call(this, type, elasticity);

	this.spawnFrequency = frequency;

	// Time until next enemy gets spawned
	this.timeUntilNextSpawn = startingTime;
	this.hitBox = AABB.makeAABB(center, width, height);
}

SpawningEnemy.prototype.getShape = function() {
	return this.hitBox;
};

// return a number between 0 and 1 indicating how ready we are for
// the next spawn (0 is just spawned and 1 is about to spawn)
SpawningEnemy.prototype.getReloadPercentage = function() {
	return 1 - this.timeUntilNextSpawn / this.spawnFrequency;
};

// Special tick to include a step to spawn enemies
SpawningEnemy.prototype.tick = function(seconds) {
	this.timeUntilNextSpawn -= seconds;

	if (this.timeUntilNextSpawn <= 0)
	{
		// If an enemy is spawned, increase the time by the spawn frequency
		if (this.spawn())
		{
			this.timeUntilNextSpawn += this.spawnFrequency;
		} else
		{
			this.timeUntilNextSpawn = 0;
		}
	}

	Enemy.prototype.tick.call(this, seconds);
};

SpawningEnemy.prototype.reactToPlayer = function(player) {
};

// Subclasses of this should overwrite Spawn() to spawn the right type of enemy
// Returns true iff an enemy is actually spawned
SpawningEnemy.prototype.spawn = function() {
	throw 'SpawningEnemy.spawn() unimplemented';
}
