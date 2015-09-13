#require <class.js>
#require <entity.js>

var MAX_SPAWN_FORCE = 100.0;
var INNER_SPAWN_RADIUS = 1.0;
var OUTER_SPAWN_RADIUS = 1.1;

// enum for enemies
var ENEMY_BOMB = 0;
var ENEMY_BOMBER = 1;
var ENEMY_BOUNCY_ROCKET = 2;
var ENEMY_BOUNCY_ROCKET_LAUNCHER = 3;
var ENEMY_CLOUD = 4;
var ENEMY_MAGNET = 5;
var ENEMY_GRENADE = 6;
var ENEMY_GRENADIER = 7;
var ENEMY_HEADACHE = 8;
var ENEMY_HELP_SIGN = 9;
var ENEMY_HUNTER = 10;
var ENEMY_LASER = 11;
var ENEMY_MULTI_GUN = 12;
var ENEMY_POPPER = 13;
var ENEMY_RIOT_BULLET = 14;
var ENEMY_JET_STREAM = 15;
var ENEMY_ROCKET = 16;
var ENEMY_ROCKET_SPIDER = 17;
var ENEMY_ROLLER_BEAR = 18;
var ENEMY_SHOCK_HAWK = 19;
var ENEMY_SPIKE_BALL = 20;
var ENEMY_STALACBAT = 21;
var ENEMY_WALL_AVOIDER = 22;
var ENEMY_CRAWLER = 23;
var ENEMY_WHEELIGATOR = 24;
var ENEMY_DOORBELL = 25;

Enemy.subclasses(Entity);

/**
  * Abstract class.  Represents dynamic non-user-controlled entities in the game world.
  */
function Enemy(type, elasticity) {
	Entity.prototype.constructor.call(this);
	this.type = type;
	this.elasticity = elasticity;
}

// Most enemies should use the default Tick and override methods below
Enemy.prototype.tick = function(seconds) {
	if (this.avoidsSpawn()) {
		this.setVelocity(this.getVelocity().add(this.avoidSpawnForce().mul(seconds)));
	}

	var ref_deltaPosition = { ref: this.move(seconds) };
	var ref_velocity = { ref: this.getVelocity() };
	var shape = this.getShape();
	var contact = null;
	// Only collide enemies that can collide with the world
	if (this.canCollide()) {
		contact = CollisionDetector.collideEntityWorld(this, ref_deltaPosition, ref_velocity, this.elasticity, gameState.world, true);
		this.setVelocity(ref_velocity.ref);
	}
	shape.moveBy(ref_deltaPosition.ref);

	// If this enemy collided with the world, react to the world
	if (contact !== null) {
		this.reactToWorld(contact);
	}

	// If this is way out of bounds, kill it
	if (!CollisionDetector.containsPointShape(shape.getCenter(), gameState.world.getHugeAabb())) {
		this.setDead(true);
	}

	// If the enemy is still alive, collide it with the players
	if (!this.isDead()) {
		var players = CollisionDetector.overlapShapePlayers(shape);
		for (var i = 0; i < players.length; ++i) {
			if (!players[i].isDead()) {
				this.reactToPlayer(players[i]);
			}
		}
	}

	this.afterTick(seconds);
};

Enemy.prototype.getColor = function() {
	return EDGE_ENEMIES;
};

Enemy.prototype.getElasticity = function() { return this.elasticity; };
Enemy.prototype.getType = function() { return this.type; };
Enemy.prototype.getTarget = function() { return -1; };
Enemy.prototype.setTarget = function(player) {};
Enemy.prototype.onDeath = function() {};
Enemy.prototype.canCollide = function() { return true; };
Enemy.prototype.avoidsSpawn = function() { return false; };

// Accelerate updates velocity and returns the delta position
Enemy.prototype.accelerate = function(accel, seconds) {
	this.setVelocity(this.velocity.add(accel.mul(seconds)));
	return this.velocity.mul(seconds);
};

Enemy.prototype.avoidSpawnForce = function() {
	var relSpawnPosition = gameState.getSpawnPoint().sub(this.getCenter());
	var radius = this.getShape().radius;
	var distance = relSpawnPosition.length() - radius;

	// If inside the inner circle, push with max force
	if (distance < INNER_SPAWN_RADIUS)
	{
		return relSpawnPosition.unit().mul(-MAX_SPAWN_FORCE);
	} else if (distance < OUTER_SPAWN_RADIUS)
	{
		var magnitude = MAX_SPAWN_FORCE * (1 - (distance - INNER_SPAWN_RADIUS) / (OUTER_SPAWN_RADIUS - INNER_SPAWN_RADIUS));
		return relSpawnPosition.unit().mul(-magnitude);
	} else return new Vector(0, 0);
};

// THE FOLLOWING SHOULD BE OVERRIDDEN BY ALL ENEMIES:

// This moves the enemy
Enemy.prototype.move = function(seconds) {
	return new Vector(0, 0);
};

// Enemy's reaction to a collision with the World, by default has no effect
Enemy.prototype.reactToWorld = function(contact) {};

// Enemy's reaction to a collision with a Player, by default kills the Player
Enemy.prototype.reactToPlayer = function(player) {
	player.setDead(true);
};

// Do stuff that needs an updated enemy, like move the graphics
Enemy.prototype.afterTick = function(seconds) {};
