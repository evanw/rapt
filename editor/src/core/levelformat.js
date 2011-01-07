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

function vecToJSON(vec) {
	return [vec.x, vec.y];
}

function loadWorldFromJSON(json) {
	// values are quoted (like json['width'] instead of json.width) so closure compiler doesn't touch them
	
	var world = new World();
	
	// load general info
	world.playerStart = jsonToVec(json['start']);
	world.playerGoal = jsonToVec(json['end']);
	
	// load cells
	world.size = new Vector(Math.ceil(json['width'] / SECTOR_SIZE), Math.ceil(json['height'] / SECTOR_SIZE));
	for (var x = 0; x < json['width']; x++) {
		for (var y = 0; y < json['height']; y++) {
			world.setCell(x, y, json['cells'][y][x]);
		}
	}
	
	// load entities
	var walls = [];
	var buttons = [];
	for (var i = 0; i < json['entities'].length; i++) {
		var e = json['entities'][i];
		switch (e['class']) {
		case 'cog':
			world.placeables.push(spriteTemplates[SPRITE_COG].sprite.clone(jsonToVec(e['pos'])));
			break;
			
		case 'wall':
			var wall = new Door(e['oneway'], e['open'], e['color'], new Edge(jsonToVec(e['start']), jsonToVec(e['end'])));
			walls.push(wall);
			world.placeables.push(wall);
			break;
			
		case 'button':
			var button = new Button(jsonToVec(e['pos']), e['type']);
			button.walls = e['walls'];
			buttons.push(button);
			world.placeables.push(button);
			break;
			
		case 'sign':
			var sign = spriteTemplates[SPRITE_SIGN].sprite.clone(jsonToVec(e['pos']), COLOR_NEUTRAL, 0);
			sign.text = e['text'];
			world.placeables.push(sign);
			break;
			
		case 'enemy':
			world.placeables.push(spriteTemplates[enemyToSpriteMap[e['type']]].sprite.clone(jsonToVec(e['pos']), e['color'], e['angle']));
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

function indicesOfLinkedDoors(button, world) {
	// find all links linking to button
	var links = [];
	for (var i = 0; i < world.placeables.length; i++) {
		var link = world.placeables[i];
		if ((link instanceof Link) && link.button === button) {
			links.push(link);
		}
	}
	
	// find the indices of the door in each link
	var indices = [];
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		var index = 0;
		for (var j = 0; j < world.placeables.length; j++) {
			var door = world.placeables[j];
			if (door instanceof Door) {
				if (door === link.door) {
					indices.push(index);
					break;
				}
				index++;
			}
		}
	}
	
	return indices.sort();
}

function spriteTypeFromId(id) {
	for (var key in enemyToSpriteMap) {
		if (enemyToSpriteMap[key] == id) {
			return key;
		}
	}
}

function saveWorldToJSON(world) {
	// values are quoted (like json['width'] instead of json.width) so closure compiler doesn't touch them
	
	var json = {};
	
	// fit a bounding box around all non-blank cells
	var min = new Vector(Number.MAX_VALUE, Number.MAX_VALUE);
	var max = new Vector(-Number.MAX_VALUE, -Number.MAX_VALUE);
	for (var i = 0; i < world.sectors.length; i++) {
		var sector = world.sectors[i];
		for (var y = 0; y < SECTOR_SIZE; y++) {
			var sy = sector.offset.y * SECTOR_SIZE + y;
			for (var x = 0; x < SECTOR_SIZE; x++) {
				var sx = sector.offset.x * SECTOR_SIZE + x;
				if (sector.cells[x + y * SECTOR_SIZE].type != CELL_SOLID) {
					min = min.minComponents(new Vector(sx, sy));
					max = max.maxComponents(new Vector(sx + 1, sy + 1));
				}
			}
		}
	}
	
	// center empty levels at the origin
	if (min.x == Number.MAX_VALUE) {
		min.x = min.y = max.x = max.y = 0;
	}
	
	// copy the bounding box
	json['cells'] = [];
	json['width'] = max.x - min.x;
	json['height'] = max.y - min.y;
	for (var y = min.y; y < max.y; y++) {
		var row = [];
		for (var x = min.x; x < max.x; x++) {
			row.push(world.getCell(x, y));
		}
		json['cells'].push(row);
	}
	
	// save entities
	json['entities'] = [];
	for (var i = 0; i < world.placeables.length; i++) {
		var p = world.placeables[i];
		if (p instanceof Button) {
			json['entities'].push({
				'class': 'button',
				'type': p.type,
				'pos': vecToJSON(p.anchor.sub(min)),
				'walls': indicesOfLinkedDoors(p, world)
			});
		} else if (p instanceof Door) {
			json['entities'].push({
				'class': 'wall',
				'oneway': !!p.isOneWay,
				'open': !!p.isInitiallyOpen,
				'start': vecToJSON(p.edge.start.sub(min)),
				'end': vecToJSON(p.edge.end.sub(min)),
				'color': p.color
			});
		} else if ((p instanceof Sprite) && p.id == SPRITE_COG) {
			json['entities'].push({
				'class': 'cog',
				'pos': vecToJSON(p.anchor.sub(min))
			});
		} else if ((p instanceof Sprite) && p.id == SPRITE_SIGN) {
			json['entities'].push({
				'class': 'sign',
				'pos': vecToJSON(p.anchor.sub(min)),
				'text': p.text
			});
		} else if (p instanceof Sprite) {
			json['entities'].push({
				'class': 'enemy',
				'type': spriteTypeFromId(p.id),
				'pos': vecToJSON(p.anchor.sub(min)),
				'color': p.color,
				'angle': p.angle - Math.floor(p.angle / (2 * Math.PI)) * (2 * Math.PI) // 0 <= angle < 2PI
			});
		}
	}
	
	// save per-level stuff
	json['unique_id'] = Math.round(Math.random() * 0xFFFFFFFF);
	json['start'] = vecToJSON(world.playerStart.sub(min));
	json['end'] = vecToJSON(world.playerGoal.sub(min));
	
	return JSON.stringify(json);
}
