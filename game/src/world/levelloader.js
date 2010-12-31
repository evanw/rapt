#require <class.js>
#require <gamestate.js>
#require <levels.js>

function jsonToEnemy(json) {
    var pos = jsonToVec(json.pos);
    switch (json.type) {
        case 'bomber':
            return new Enemy(pos, json.angle);
        case 'bouncy rocket launcher':
            return new BouncyRocketLauncher(pos, jsonToTarget(json.color));
        case 'corrosion cloud':
            return new CorrosionCloud(pos, jsonToTarget(json.color));
        case 'doom magnet':
            return new DoomMagnet(pos);
        case 'grenadier':
            return new Grenadier(pos, jsonToTarget(json.color));
        case 'jet stream':
            return new JetStream(pos, json.angle);
        case 'headache':
            return new Headache(pos, jsonToTarget(json.color));
        case 'hunter':
            return new Hunter(pos);
        case 'multi gun':
            return new MultiGun(pos);
        case 'popper':
            return new Popper(pos);
        case 'rocket spider':
            return new RocketSpider(pos, json.angle);
        case 'shock hawk':
            return new ShockHawk(pos, jsonToTarget(json.color));
        case 'spike ball':
            return new SpikeBall(pos);
        case 'stalacbat':
            return new Stalacbat(pos, jsonToTarget(json.color));
        case 'wall avoider':
            return new WallAvoider(pos, jsonToTarget(json.color));
        case 'wall crawler':
            return new WallCrawler(pos, json.angle);
        case 'wheeligator':
            return new Wheeligator(pos, json.angle);
    }
};

function jsonToTarget(json) {
    return (json.color == 1 ? this.playerA : this.playerB);
}

function jsonToVec(json) {
	return new Vector(json[0], json[1]);
}

GameState.prototype.loadLevelFromJSON = function(json) {
	// Load size, spawn point, and goal
    this.world = new World(json.width, json.height, jsonToVec(json.start), jsonToVec(json.end));
	
	// Load cells & create edges
    for (var x = 0; x < json.width; x++) {
		for (var y = 0; y < json.height; y++) {
            var type = json.cells[y][x];
			this.world.setCell(x, y, type);
            if (type !== CELL_SOLID) {
                this.world.safety = new Vector(x + 0.5, y + 0.5);
            }
		}
	}
    this.world.createAllEdges();

    // Reset players
	this.playerA = new Player(this.world.spawnPoint, EDGE_RED);
	this.playerB = new Player(this.world.spawnPoint, EDGE_BLUE);
	
    /*
	// Load entities
	for (var i = 0; i < json.entities.length; ++i) {
		var e = json.entities[i];
		switch (e['class']) {
		case 'cog':
            this.enemies.push(new GoldenCog(jsonToVec(e.pos)));
			break;
		case 'wall':
            // TODO: Walls and buttons
            //gameState.addDoor(jsonToVec(e.start), jsonToVec(e.end), e.oneway, e.color, e.open);
			//var door = new Door(new Edge(jsonToVec(e.start), jsonToVec(e.end)), t.oneway, e.open, e.color);
            //this.doors.push(door);
			break;
		case 'button':
            //var button = new Doorbell(jsonToVec(e.pos), e.type, true);
            //button.doors = e.walls;
            //this.enemies.push(button);
			break;
		case 'sign':
            this.enemies.push(new HelpSign(jsonToVec(e.pos), e.text));
			break;
		case 'enemy':
            this.enemies.push(jsonToEnemy(e));
			break;
		}
	}
    */
}
