function jsonToVec(json) {
	return new Vector(json[0], json[1]);
}

function loadWorldFromJSON(json) {
	var world = new World();
	json = JSON.parse(json);
	
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
			world.placeables.push(cogSprite.clone(jsonToVec(e.pos)));
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