// constants
var SPAWN_POINT_PARTICLE_FREQ = 0.3;

// enum StatIndex
var STAT_PLAYER_DEATHS = 0;
var STAT_ENEMY_DEATHS = 1;
var STAT_PLAYER_JUMPS = 2;
var STAT_NUM_PARTICLES = 3;
var STAT_COGS_COLLECTED = 4;
var STAT_NUM_COGS = 5;

// class GameState
function GameState() {
	this.world = new World(50, 50);
	this.spawnPoint = new Vector(0.5, 0.5);
	this.playerA = new Player(this.spawnPoint, PLAYER_COLOR_RED);
	this.playerB = new Player(this.spawnPoint, PLAYER_COLOR_BLUE);
	this.spawnPointParticleTimer = 0;
    this.enemies = [];
}

// global variable for game state, initialized in main.js
var gameState;

GameState.prototype.getPlayer = function(i) {
    return (i == 0) ? this.playerA : this.playerB;
}

GameState.prototype.getOtherPlayer = function(player) {
	return (player == this.playerA) ? this.playerB : this.playerA;
}

GameState.prototype.incrementStat = function(stat) {
}

GameState.prototype.addEnemy = function(enemy, spawnerPosition) {
    // If adding at the start of the game, start at its own center
    if (typeof spawnerPosition === 'undefined') {
        spawnerPosition = enemy.getShape().getCenter();
    } else {
        // rewind the enemy back to the spawner's center
        enemy.getShape().moveTo(spawnerPosition);
    }

    var ref_deltaPosition = { ref: enemy.getShape().getCenter().sub(spawnerPosition) };
    var ref_velocity = { ref: enemy.getVelocity() };

    // do collision detection and push the enemy backwards if it would hit any walls
    var contact = CollisionDetector.collideEntityWorld(enemy, ref_deltaPosition, ref_velocity, enemy.getElasticity(), this.world, true);

    // put the velocity back into the enemy
    enemy.setVelocity(ref_velocity.ref);

    // move the spawned enemy as far out from the spawner as we can
    enemy.getShape().moveBy(ref_deltaPosition.ref);

    // now we can add the enemy to the list
    this.enemies.push(enemy);
}

GameState.prototype.tick = function(seconds) {
	this.playerA.tick(seconds);
	this.playerB.tick(seconds);
    for (var i = 0; i < this.enemies.length; ++i) {
        this.enemies[i].tick(seconds);
    }
    for (var i = 0; i < this.enemies.length; ++i) {
        if (this.enemies[i].isDead()) {
            this.enemies.splice(i, 1);
        }
    }

	this.spawnPointParticleTimer -= seconds;
	if(this.spawnPointParticleTimer <= 0)
	{
		var position = this.spawnPoint.sub(new Vector(0, 0.25));
		Particle().position(position).velocity(new Vector(randInRange(-0.3, 0.3), 0.3)).radius(0.03, 0.05).bounces(0).decay(0.1, 0.2).color(1, 1, 1, 1).circle().gravity(-5);
		this.spawnPointParticleTimer += SPAWN_POINT_PARTICLE_FREQ;
	}
}

function drawSpawnPoint(c, point) {
	c.strokeStyle = c.fillStyle = 'rgba(255, 255, 255, 0.1)';
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	var gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	c.fillStyle = 'black';
	c.beginPath();
	c.moveTo(point.x - 0.1, point.y - 0.45);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.45);
	c.arc(point.x, point.y - 0.45, 0.2, 0, Math.PI, true);
	c.fill();
}

GameState.prototype.draw = function(c, xmin, ymin, xmax, ymax) {
	this.world.draw(c, xmin, ymin, xmax, ymax);
	drawSpawnPoint(c, this.spawnPoint);
	this.playerA.draw(c);
	this.playerB.draw(c);
    for (var i = 0; i < this.enemies.length; ++i) {
        this.enemies[i].draw(c);
    }
}
