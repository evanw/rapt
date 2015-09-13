// constants
var SPAWN_POINT_PARTICLE_FREQ = 0.3;

// enum GameStatus
var GAME_IN_PLAY = 0;
var GAME_WON = 1;
var GAME_LOST = 2;

// enum StatIndex
var STAT_PLAYER_DEATHS = 0;
var STAT_ENEMY_DEATHS = 1;
var STAT_COGS_COLLECTED = 2;
var STAT_NUM_COGS = 3;


// class GameState
function GameState() {
	this.world = new World(50, 50, new Vector(0.5, 0.5), new Vector(0.5, 0.5));
	
	// Player color must be EDGE_RED or EDGE_BLUE to support proper collisions with doors!
	this.playerA = new Player(this.world.spawnPoint, EDGE_RED);
	this.playerB = new Player(this.world.spawnPoint, EDGE_BLUE);
	this.spawnPointParticleTimer = 0;
	this.spawnPointOffset = new Vector(0, 0);
	this.enemies = [];
	this.doors = [];
	this.timeSinceStart = 0;

	// keys (will be set automatically)
	this.killKey = false;

	// if you need to tell if the world has been modified (door has been opened/closed), just watch
	// for changes to this variable, which can be incremented by gameState.recordModification()
	this.modificationCount = 0;

	this.gameStatus = GAME_IN_PLAY;
	this.stats = [0, 0, 0, 0];
}

// global variable for game state, initialized in main.js
var gameState;

// bounding rectangle around all pixels currently being drawn to (also includes 2 cells of padding,
// so just check that the enemy center is within these bounds, don't bother about adding the radius)
var drawMinX = 0, drawMinY = 0;
var drawMaxX = 0, drawMaxY = 0;

GameState.prototype.recordModification = function() {
	this.modificationCount++;
};

GameState.prototype.getPlayer = function(i) {
	return (i == 0) ? this.playerA : this.playerB;
}

GameState.prototype.getOtherPlayer = function(player) {
	return (player == this.playerA) ? this.playerB : this.playerA;
}

GameState.prototype.getSpawnPoint = function() {
	return this.world.spawnPoint;
}

GameState.prototype.setSpawnPoint = function(point) {
	this.world.spawnPoint = new Vector(point.x, point.y);
	
	// offset to keep spawn point from drawing below ground
	this.spawnPointOffset.y = 0.125;

	// prevents slipping?
	this.world.spawnPoint.y += 0.01;
}

GameState.prototype.gameWon = function() {
	var goal = this.world.goal;
	var atGoalA = !this.playerA.isDead() && Math.abs(this.playerA.getCenter().x - goal.x) < 0.4 && 
					Math.abs(this.playerA.getCenter().y - goal.y) < 0.4;
	var atGoalB = !this.playerB.isDead() && Math.abs(this.playerB.getCenter().x - goal.x) < 0.4 && 
					Math.abs(this.playerB.getCenter().y - goal.y) < 0.4;
	return atGoalA && atGoalB;
}

GameState.prototype.gameLost = function() {
	return (this.playerA.isDead() && this.playerB.isDead());
}

GameState.prototype.incrementStat = function(stat) {
	++this.stats[stat];
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

GameState.prototype.clearDoors = function() {
	this.doors = [];
}

GameState.prototype.addDoor = function(start, end, type, color, startsOpen) {
    var cell1;
    var cell2;
    var valid = true;
	// left wall
	if (start.y + 1 == end.y && start.x == end.x) {
        cell1 = this.world.getCell(start.x, start.y);
        cell2 = this.world.getCell(start.x - 1, start.y);
        if (!cell1 || !cell2 || cell1.leftWallOccupied() || cell2.rightWallOccupied()) {
            valid = false;
        }
	}
	// right wall
	else if (start.y - 1 == end.y && start.x == end.x) {
        cell1 = this.world.getCell(start.x - 1, end.y);
        cell2 = this.world.getCell(start.x, end.y);
        if (!cell1 || !cell2 || cell1.rightWallOccupied() || cell2.leftWallOccupied()) {
            valid = false;
        }
	}
	// ceiling
	else if (start.x + 1 == end.x && start.y == end.y) {
        cell1 = this.world.getCell(start.x, start.y - 1);
        cell2 = this.world.getCell(start.x, start.y);
        if (!cell1 || !cell2 || cell1.ceilingOccupied() || cell2.floorOccupied()) {
            valid = false;
        }
	}
	// floor
	else if (start.x - 1 == end.x && start.y == end.y) {
        cell1 = this.world.getCell(end.x, start.y);
        cell2 = this.world.getCell(end.x, start.y - 1);
        if (!cell1 || !cell2 || cell1.floorOccupied() || cell2.ceilingOccupied()) {
            valid = false;
        }
	}
	//diagonal
	else {
        var x = start.x < end.x ? start.x : end.x;
        var y = start.y < end.y ? start.y : end.y;
        cell1 = this.world.getCell(x, y);
        cell2 = this.world.getCell(x, y);
        if ((start.x < end.x) === (start.y < end.y)) {
            if (!cell1 || cell1.posDiagOccupied()) {
                valid = false;
            }
        } else if (!cell1 || cell1.negDiagOccupied()) {
            valid = false;
        }
	}

	var door;
    if (!valid) {
        // Make a dummy door that doesn't do anything
        door = new Door(null, null, null, null);
    } else if (type === ONE_WAY) {
		door = new Door(new Edge(start, end, color), null, cell1, null);
	} else {
		door = new Door(new Edge(start, end, color), new Edge(end, start, color), cell1, cell2);
	}
    this.doors.push(door);
	if (!startsOpen) {
		door.act(DOORBELL_CLOSE, true, false);
	}
}

GameState.prototype.getDoor = function(doorIndex) {
	 return this.doors[doorIndex];
}

// Kill all entities that intersect a given edge
GameState.prototype.killAll = function(edge) {
	for (var i = 0; i < 2; ++i) {
		if (CollisionDetector.intersectEntitySegment(this.getPlayer(i), edge.segment)) {
			this.getPlayer(i).setDead(true);
		}
	}

	for (var i = 0; i < this.enemies.length; ++i) {
		var enemy = this.enemies[i];
		if (enemy.canCollide() && CollisionDetector.intersectEntitySegment(enemy, edge.segment)) {
			enemy.setDead(true);
		}
	}
}

GameState.prototype.tick = function(seconds) {
	if (this.gameStatus === GAME_WON || this.gameWon()) {
		this.gameStatus = GAME_WON;
	} else if (this.gameStatus === GAME_LOST || this.gameLost()) {
		this.gameStatus = GAME_LOST;
	}

	this.timeSinceStart += seconds;

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
		var position = this.world.spawnPoint.sub(new Vector(0, 0.25));
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
	// no enemy or particle is larger than two cells wide
	drawMinX = xmin - 2;
	drawMinY = ymin - 2;
	drawMaxX = xmax + 2;
	drawMaxY = ymax + 2;
	
	// spawn point and goal
	var spawnPoint = this.world.spawnPoint.add(this.spawnPointOffset);
	var goal = this.world.goal;
	if (spawnPoint.x >= drawMinX && spawnPoint.y >= drawMinY && spawnPoint.x <= drawMaxX && spawnPoint.y <= drawMaxY) {
		drawSpawnPoint(c, spawnPoint);
	}
	if (goal.x >= drawMinX && goal.y >= drawMinY && goal.x <= drawMaxX && goal.y <= drawMaxY) {
		drawGoal(c, goal, this.timeSinceStart);
	}
	
	// players
	this.playerA.draw(c);
	this.playerB.draw(c);
	
	// enemies
	for (var i = 0; i < this.enemies.length; ++i) {
		var enemy = this.enemies[i];
		var center = enemy.getCenter();
		if (center.x >= drawMinX && center.y >= drawMinY && center.x <= drawMaxX && center.y <= drawMaxY) {
			enemy.draw(c);
		}
	}
}
