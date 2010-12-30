// Cell.type takes one of these values
var CELL_EMPTY = 0;
var CELL_SOLID = 1;
var CELL_FLOOR_DIAG_LEFT = 2;
var CELL_FLOOR_DIAG_RIGHT = 3;
var CELL_CEIL_DIAG_LEFT = 4;
var CELL_CEIL_DIAG_RIGHT = 5;

// Use these values to index into Cell.edges
var EDGE_XNEG = 0;
var EDGE_YNEG = 1;
var EDGE_XPOS = 2;
var EDGE_YPOS = 3;
var EDGE_INTERNAL = 4;

// Each Sector has SECTOR_SIZE * SECTOR_SIZE cells
var SECTOR_SIZE = 8;

////////////////////////////////////////////////////////////////////////////////
// class Cell
////////////////////////////////////////////////////////////////////////////////

function Cell() {
	this.type = CELL_SOLID;
	this.edges = [false, false, false, false, false];
}

Cell.prototype.draw = function(c, x, y) {
	switch (this.type) {
	case CELL_EMPTY:
		c.strokeRect(x, y, 1, 1);
		c.fillRect(x, y, 1, 1);
		break;
	case CELL_CEIL_DIAG_LEFT:
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + 1, y);
		c.lineTo(x + 1, y + 1);
		c.stroke();
		c.fill();
		break;
	case CELL_CEIL_DIAG_RIGHT:
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + 1, y);
		c.lineTo(x, y + 1);
		c.stroke();
		c.fill();
		break;
	case CELL_FLOOR_DIAG_LEFT:
		c.beginPath();
		c.moveTo(x + 1, y);
		c.lineTo(x + 1, y + 1);
		c.lineTo(x, y + 1);
		c.stroke();
		c.fill();
		break;
	case CELL_FLOOR_DIAG_RIGHT:
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + 1, y + 1);
		c.lineTo(x, y + 1);
		c.stroke();
		c.fill();
		break;
	}
};

Cell.prototype.flipType = function() {
	switch (this.type) {
	case CELL_EMPTY:
		this.type = CELL_SOLID;
		break;
	case CELL_SOLID:
		this.type = CELL_EMPTY;
		break;
	case CELL_CEIL_DIAG_LEFT:
		this.type = CELL_FLOOR_DIAG_RIGHT;
		break;
	case CELL_CEIL_DIAG_RIGHT:
		this.type = CELL_FLOOR_DIAG_LEFT;
		break;
	case CELL_FLOOR_DIAG_LEFT:
		this.type = CELL_CEIL_DIAG_RIGHT;
		break;
	case CELL_FLOOR_DIAG_RIGHT:
		this.type = CELL_CEIL_DIAG_LEFT;
		break;
	}
};

////////////////////////////////////////////////////////////////////////////////
// class Sector
////////////////////////////////////////////////////////////////////////////////

function Sector(offsetX, offsetY) {
	this.offset = new Vector(offsetX, offsetY); // This is in sectors, not cells
	this.cells = new Array(SECTOR_SIZE * SECTOR_SIZE);
	for (var cell = 0; cell < SECTOR_SIZE * SECTOR_SIZE; cell++) {
		this.cells[cell] = new Cell();
	}
}

Sector.prototype.draw = function(c) {
	var offsetX = this.offset.x * SECTOR_SIZE;
	var offsetY = this.offset.y * SECTOR_SIZE;
	for (var y = 0, i = 0; y < SECTOR_SIZE; y++) {
		for (var x = 0; x < SECTOR_SIZE; x++, i++) {
			this.cells[i].draw(c, offsetX + x, offsetY + y);
		}
	}
};

Sector.prototype.isSolid = function() {
	for (var cell = 0; cell < SECTOR_SIZE * SECTOR_SIZE; cell++) {
		if (this.cells[cell].type != CELL_SOLID) {
			return false;
		}
	}
	return true;
};

Sector.prototype.getCell = function(x, y, type) {
	x -= this.offset.x * SECTOR_SIZE;
	y -= this.offset.y * SECTOR_SIZE;
	return this.cells[x + y * SECTOR_SIZE].type;
};

Sector.prototype.setCell = function(x, y, type) {
	x -= this.offset.x * SECTOR_SIZE;
	y -= this.offset.y * SECTOR_SIZE;
	this.cells[x + y * SECTOR_SIZE].type = type;
};

////////////////////////////////////////////////////////////////////////////////
// class World
////////////////////////////////////////////////////////////////////////////////

function World() {
	this.offset = new Vector(0, 0); // This is in sectors, not cells
	this.size = new Vector(0, 0); // This is in sectors, not cells
	this.sectors = [];
	this.placeables = [];
	this.playerStart = new Vector(0, 0);
	this.playerGoal = new Vector(0, 0);
}

World.prototype.draw = function(c) {
	var x, y, i;
	
	// Draw the level itself
	c.strokeStyle = '#BFBFBF';
	c.fillStyle = '#BFBFBF';
	for (y = 0, i = 0; y < this.size.y; y++) {
		for (x = 0; x < this.size.x; x++, i++) {
			this.sectors[i].draw(c);
		}
	}
	
	Sprites.drawGoal(c, 1, this.playerGoal.add(new Vector(0.5, 0.5)), 0.6);
	Sprites.drawSpawnPoint(c, 1, this.playerStart.add(new Vector(0.5, 0.5)));
	
	// Draw placeables (doors, enemies, etc...)
	for (i = 0; i < this.placeables.length; i++) {
		this.placeables[i].draw(c);
	}
	
	// Draw selections around selected placeables
	c.fillStyle = rgba(0, 0, 0, 0.1);
	c.strokeStyle = rgba(0, 0, 0, 0.5);
	for (i = 0; i < this.placeables.length; i++) {
		if (this.placeables[i].selected) {
			this.placeables[i].drawSelection(c);
		}
	}
};

World.prototype.containsSectorPoint = function(sectorX, sectorY) {
	return sectorX >= this.offset.x && sectorX < this.offset.x + this.size.x &&
		sectorY >= this.offset.y && sectorY < this.offset.y + this.size.y;
};

World.prototype.getCell = function(x, y) {
	var sectorX = Math.floor(x / SECTOR_SIZE);
	var sectorY = Math.floor(y / SECTOR_SIZE);
	
	if (this.containsSectorPoint(sectorX, sectorY)) {
		return this.sectors[(sectorX - this.offset.x) + (sectorY - this.offset.y) * this.size.x].getCell(x, y);
	} else {
		return CELL_SOLID;
	}
};

World.prototype.setCell = function(x, y, type) {
	var sectorX = Math.floor(x / SECTOR_SIZE);
	var sectorY = Math.floor(y / SECTOR_SIZE);
	
	// Make sure the sector under the cell at (x, y) exists
	if (this.sectors.length == 0) {
		// Create the first sector
		this.sectors.push(new Sector(sectorX, sectorY));
		this.offset = new Vector(sectorX, sectorY);
		this.size = new Vector(1, 1);
	} else if (!this.containsSectorPoint(sectorX, sectorY)) {
		// Save the old sectors
		var oldOffset = this.offset;
		var oldSize = this.size;
		var oldSectors = this.sectors;

		// Create a new range of sectors that includes the old ones and the new one
		this.offset = new Vector(Math.min(sectorX, oldOffset.x), Math.min(sectorY, oldOffset.y));
		this.size = new Vector(
			Math.max(sectorX - oldOffset.x + 1, oldSize.x + (oldOffset.x - this.offset.x)),
			Math.max(sectorY - oldOffset.y + 1, oldSize.y + (oldOffset.y - this.offset.y)));
		this.sectors = new Array(this.size.x * this.size.y);

		// Fill in the new sectors from the old sectors
		for (var dy = 0, i = 0; dy < this.size.y; dy++) {
			var oldY = (this.offset.y + dy) - oldOffset.y;
			for (var dx = 0; dx < this.size.x; dx++, i++) {
				var oldX = (this.offset.x + dx) - oldOffset.x;
				if (oldX >= 0 && oldY >= 0 && oldX < oldSize.x && oldY < oldSize.y) {
					this.sectors[i] = oldSectors[oldX + oldY * oldSize.x];
				} else {
					this.sectors[i] = new Sector(this.offset.x + dx, this.offset.y + dy);
				}
			}
		}
	}

	this.sectors[(sectorX - this.offset.x) + (sectorY - this.offset.y) * this.size.x].setCell(x, y, type);
};

World.prototype.addPlaceable = function(placeable) {
	this.placeables.push(placeable);
};

World.prototype.removePlaceable = function(placeable) {
	for (var i = 0; i < this.placeables.length; i++) {
		if (this.placeables[i] == placeable) {
			this.placeables.splice(i--, 1);
		}
	}
};

World.prototype.closestPlaceableOfType = function(point, type) {
	var minDist = Number.MAX_VALUE;
	var placeable = null;
	for (var i = 0; i < this.placeables.length; i++) {
		var p = this.placeables[i];
		if (!(p instanceof type)) continue;
		var dist = p.getCenter().sub(point).length();
		if (dist < minDist) {
			placeable = p;
			minDist = dist;
		}
	}
	return placeable;
};

World.prototype.getSelection = function() {
	var selection = [];
	for (var i = 0; i < this.placeables.length; i++) {
		if (this.placeables[i].selected) {
			selection.push(this.placeables[i]);
		}
	}
	return selection;
};

World.prototype.selectionInRect = function(rect) {
	var selection = [];
	for (var i = 0; i < this.placeables.length; i++) {
		if (this.placeables[i].touchesRect(rect)) {
			selection.push(this.placeables[i]);
		}
	}
	return selection;
};

World.prototype.setSelection = function(selection) {
	for (var i = 0; i < this.placeables.length; i++) {
		var p = this.placeables[i];
		p.selected = false;
		for (var j = 0; j < selection.length; j++) {
			if (selection[j] == p) {
				p.selected = true;
				break;
			}
		}
	}
};
