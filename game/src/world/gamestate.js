// constants
var SPAWN_POINT_PARTICLE_FREQ = 0.3;

// enum StatIndex
var STAT_PLAYER_DEATHS = 0;
var STAT_ENEMY_DEATHS = 1;
var STAT_PLAYER_JUMPS = 2;
var STAT_NUM_PARTICLES = 3;
var STAT_COGS_COLLECTED = 4;
var STAT_NUM_COGS = 5;

// enum GameStatus
var GAME_IN_PLAY = 0;
var GAME_WON = 1;
var GAME_LOST = 2;

// class GameState
function GameState() {
	this.world = new World(50, 50);
	this.spawnPoint = new Vector(0.5, 0.5);
	this.goal = new Vector(2.5, 0.5);
	this.playerA = new Player(this.spawnPoint, PLAYER_COLOR_RED);
	this.playerB = new Player(this.spawnPoint, PLAYER_COLOR_BLUE);
	this.spawnPointParticleTimer = 0;
    this.enemies = [];
    this.gameStatus = GAME_IN_PLAY;
    this.timeSinceStart = 0;

    // keys (will be set automatically
    this.menuKey = false;
    this.killKey = false;
    this.nextLevelKey = false;
}

// global variable for game state, initialized in main.js
var gameState;

GameState.prototype.getPlayer = function(i) {
    return (i == 0) ? this.playerA : this.playerB;
}

GameState.prototype.getOtherPlayer = function(player) {
	return (player == this.playerA) ? this.playerB : this.playerA;
}

GameState.prototype.gameWon = function() {
    if (this.gameStatus === GAME_WON) {
        return true;
    }
    var atGoalA = !this.playerA.isDead() && Math.abs(this.playerA.getCenter().x - this.goal.x) < 0.4 && 
                    Math.abs(this.playerA.getCenter().y - this.goal.y) < 0.4;
    var atGoalB = !this.playerB.isDead() && Math.abs(this.playerB.getCenter().x - this.goal.x) < 0.4 && 
                    Math.abs(this.playerB.getCenter().y - this.goal.y) < 0.4;
    return atGoalA && atGoalB;
}

GameState.prototype.gameLost = function() {
    return ((this.playerA.isDead() && this.playerB.isDead()) || this.gameStatus === GAME_LOST);
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
    this.timeSinceStart += seconds;

    // Menu key can be pressed at any time to return to the level select screen
    if (this.menuKey) {
        window.location = "http://raptgame.com";
        return;
    }

    // TODO: Handle gameWon and gameLost outside of gameState!
    if (this.gameWon()) {
        this.gameStatus = GAME_WON;
        // Next level key only works when the level has been won
        if (this.nextLevelKey) {
            window.location = "http://raptgame.com";
        }
    } else if (this.gameLost()) {
        this.gameStatus = GAME_LOST;
        if (this.nextLevelKey) {
            
        }
    }
    if (this.killKey) {
        this.playerA.setDead(true);
        this.playerB.setDead(true);
    }
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

function drawGoal(c, point, time) {
    var percent = time - Math.floor(time);
    percent = 1 - percent;
    percent = (percent - Math.pow(percent, 6)) * 1.72;
    percent = 1 - percent;

    c.fillStyle = 'black';
    for (var i = 0; i < 4; ++i) {
        var angle = i * (2 * Math.PI / 4);
        var s = Math.sin(angle);
        var csn = Math.cos(angle);
        var radius = 0.45 - percent * 0.25;
        var size = 0.15;
        c.beginPath();
        c.moveTo(point.x + csn * radius - s * size, point.y + s * radius + csn * size);
        c.lineTo(point.x + csn * radius + s * size, point.y + s * radius - csn * size);
        c.lineTo(point.x + csn * (radius - size), point.y + s * (radius - size));
        c.fill();
    }
}

GameState.prototype.draw = function(c, xmin, ymin, xmax, ymax) {
	this.world.draw(c, xmin, ymin, xmax, ymax);
	drawSpawnPoint(c, this.spawnPoint);
	drawGoal(c, this.goal, this.timeSinceStart);
	this.playerA.draw(c);
	this.playerB.draw(c);
    for (var i = 0; i < this.enemies.length; ++i) {
        this.enemies[i].draw(c);
    }
}
