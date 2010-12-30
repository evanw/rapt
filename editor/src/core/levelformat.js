function loadWorldFromJSON(json) {
	var world = new World();
	json = JSON.parse(json);
	
	// load general info
	world.playerStart = new Vector(json.start[0], json.start[1]);
	world.playerGoal = new Vector(json.end[0], json.end[1]);
	
	// load cells
	world.size = new Vector(Math.ceil(json.width / SECTOR_SIZE), Math.ceil(json.height / SECTOR_SIZE));
	for (var x = 0; x < json.width; x++) {
		for (var y = 0; y < json.height; y++) {
			world.setCell(x, y, json.cells[y][x]);
		}
	}
	
	// load entities
	for (var i = 0; i < json.entities.length; i++) {
		var entity = json.entities[i];
		switch (entity['class']) {
		case 'cog':
			world.placeables.push(cogSprite.clone(new Vector(entity.pos[0], entity.pos[1])));
			break;
		}
	}
	
	return world;
}

function saveWorldToJSON(world) {
	var json = { todo: true };
	return JSON.stringify(json);
}