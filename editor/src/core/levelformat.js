#require <sprite.js>

var enemyToSpriteMap = {
	'bomber': SPRITE_BOMBER,
	'doom magnet': SPRITE_DOOM_MAGNET,
	'grenadier': SPRITE_GRENADIER,
	'headache': SPRITE_HEADACHE,
	'popper': SPRITE_POPPER,
	'jet stream': SPRITE_JET_STREAM,
	'shock hawk': SPRITE_SHOCK_HAWK,
	'stalacbat': SPRITE_STALACBAT,
	'wall crawler': SPRITE_WALL_CRAWLER,
	'wheeligator': SPRITE_WHEELIGATOR,
	'rocket spider': SPRITE_ROCKET_SPIDER,
	'hunter': SPRITE_HUNTER,
	'wall avoider': SPRITE_WALL_AVOIDER,
	'spike ball': SPRITE_SPIKE_BALL,
	'corrosion cloud': SPRITE_CORROSION_CLOUD,
	'bouncy rocket launcher': SPRITE_BOUNCY_ROCKET_LAUNCHER,
	'multi gun': SPRITE_MULTI_GUN
};

function jsonToVec(json) {
	return new Vector(json[0], json[1]);
}

function loadWorldFromJSON(json) {
	var world = new World();
	
	// load general info
	world.playerStart = jsonToVec(json.start);
	world.playerGoal = jsonToVec(json.end);
	
	// load cells
	world.size = new Vector(Math.ceil(json.width / SECTOR_SIZE), Math.ceil(json.height / SECTOR_SIZE));
	for (var x = 0; x < json.width; x++) {
		for (var y = 0; y < json.height; y++) {
			world.setCell(x, y, json.cells[y][x]);
		}
	}
	
	// load entities
	var walls = [];
	var buttons = [];
	for (var i = 0; i < json.entities.length; i++) {
		var e = json.entities[i];
		switch (e['class']) {
		case 'cog':
			world.placeables.push(spriteTemplates[SPRITE_COG].sprite.clone(jsonToVec(e.pos)));
			break;
			
		case 'wall':
			var wall = new Door(e.oneway, e.open, e.color, new Edge(jsonToVec(e.start), jsonToVec(e.end)));
			walls.push(wall);
			world.placeables.push(wall);
			break;
			
		case 'button':
			var button = new Button(jsonToVec(e.pos), e.type);
			button.walls = e.walls;
			buttons.push(button);
			world.placeables.push(button);
			break;
			
		case 'sign':
			// TODO
			break;
			
		case 'enemy':
			world.placeables.push(spriteTemplates[enemyToSpriteMap[e.type]].sprite.clone(jsonToVec(e.pos), e.color));
			break;
		}
	}
	
	// link buttons to doors
	for (i = 0; i < buttons.length; i++) {
		button = buttons[i];
		for (var j = 0; j < button.walls.length; j++) {
			world.placeables.push(new Link(button, walls[button.walls[j]]));
		}
		delete button.walls;
	}
	
	return world;
}

function saveWorldToJSON(world) {
	var json = { todo: true };
	return JSON.stringify(json);
}
