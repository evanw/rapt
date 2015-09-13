var WORLD_MARGIN = 60;

// class World
function World(w, h, spawnPoint, goal) {
	this.cells = new Array(w);
	for (var x = 0; x < w; ++x) {
		this.cells[x] = new Array(h);
		for (var y = 0; y < h; ++y) {
			this.cells[x][y] = new Cell(x, y, CELL_SOLID);
		}
	}
	
	this.width = w;
	this.height = h;
	this.safety = spawnPoint;

	this.spawnPoint = spawnPoint.add(new Vector(0.5, 0.5));
	this.goal = goal.add(new Vector(0.5, 0.5));
}

function rect(c, x, y, w, h) { c.fillRect(x, y, w, h); c.strokeRect(x, y, w, h); }

World.prototype.drawBorder = function(c, xmin, ymin, xmax, ymax) {
	var padding = 100;
	if(xmin < 0) rect(c, -padding, 0, padding, this.height);
	if(ymin < 0) rect(c, -padding, -padding, this.width + 2*padding, padding);
	if(xmax > this.width) rect(c, this.width, 0, padding, this.height);
	if(ymax > this.height) rect(c, -padding, this.height, this.width + 2*padding, padding);
};

World.prototype.draw = function(c, xmin, ymin, xmax, ymax) {
	c.fillStyle = '#7F7F7F';
	c.strokeStyle = '#7F7F7F';

	this.drawBorder(c, xmin, ymin, xmax, ymax);

	xmin = Math.max(0, Math.floor(xmin));
	ymin = Math.max(0, Math.floor(ymin));
	xmax = Math.min(this.width, Math.ceil(xmax));
	ymax = Math.min(this.height, Math.ceil(ymax));

	for(var x = xmin; x < xmax; x++) {
		for(var y = ymin; y < ymax; y++) {
			this.cells[x][y].draw(c);
		}
	}

	c.strokeStyle = 'black';
	for(var x = xmin; x < xmax; x++) {
		for(var y = ymin; y < ymax; y++) {
			this.cells[x][y].drawEdges(c);
		}
	}
};

// cells outside the world return null
World.prototype.getCell = function(x, y) {
	return (x >= 0 && y >= 0 && x < this.width && y < this.height) ? this.cells[x][y] : null;
};


// cells outside the world return solid
World.prototype.getCellType = function(x, y) {
	return (x >= 0 && y >= 0 && x < this.width && y < this.height) ? this.cells[x][y].type : CELL_SOLID;
};

World.prototype.setCell = function(x, y, type) {
	this.cells[x][y] = new Cell(x, y, type);
};

World.prototype.createAllEdges = function() {
	for (var x = 0; x < this.cells.length; x++) {
		for (var y = 0; y < this.cells[0].length; y++) {
			this.cells[x][y].edges = this.createEdges(x, y);
		}
	}
}


// is this side of the cell empty?
function IS_EMPTY_XNEG(type){ return type == CELL_EMPTY || type == CELL_FLOOR_DIAG_RIGHT || type == CELL_CEIL_DIAG_RIGHT; }
function IS_EMPTY_YNEG(type){ return type == CELL_EMPTY || type == CELL_CEIL_DIAG_LEFT || type == CELL_CEIL_DIAG_RIGHT; }
function IS_EMPTY_XPOS(type){ return type == CELL_EMPTY || type == CELL_FLOOR_DIAG_LEFT || type == CELL_CEIL_DIAG_LEFT; }
function IS_EMPTY_YPOS(type){ return type == CELL_EMPTY || type == CELL_FLOOR_DIAG_LEFT || type == CELL_FLOOR_DIAG_RIGHT; }

// is this side of the cell solid?
function IS_SOLID_XNEG(type){ return type == CELL_SOLID || type == CELL_FLOOR_DIAG_LEFT || type == CELL_CEIL_DIAG_LEFT; }
function IS_SOLID_YNEG(type){ return type == CELL_SOLID || type == CELL_FLOOR_DIAG_LEFT || type == CELL_FLOOR_DIAG_RIGHT; }
function IS_SOLID_XPOS(type){ return type == CELL_SOLID || type == CELL_FLOOR_DIAG_RIGHT || type == CELL_CEIL_DIAG_RIGHT; }
function IS_SOLID_YPOS(type){ return type == CELL_SOLID || type == CELL_CEIL_DIAG_LEFT || type == CELL_CEIL_DIAG_RIGHT; }

World.prototype.createEdges = function(x, y) {
	var edges = [];

	var cellType = this.getCellType(x, y);
	var cellTypeXneg = this.getCellType(x - 1, y);
	var cellTypeYneg = this.getCellType(x, y - 1);
	var cellTypeXpos = this.getCellType(x + 1, y);
	var cellTypeYpos = this.getCellType(x, y + 1);

	var lowerLeft = new Vector(x, y);
	var lowerRight = new Vector(x + 1, y);
	var upperLeft = new Vector(x, y + 1);
	var upperRight = new Vector(x + 1, y + 1);

	// add horizontal and vertical edges
	if(IS_EMPTY_XNEG(cellType) && IS_SOLID_XPOS(cellTypeXneg))
		edges.push(new Edge(lowerLeft, upperLeft, EDGE_NEUTRAL));
	if(IS_EMPTY_YNEG(cellType) && IS_SOLID_YPOS(cellTypeYneg))
		edges.push(new Edge(lowerRight, lowerLeft, EDGE_NEUTRAL));
	if(IS_EMPTY_XPOS(cellType) && IS_SOLID_XNEG(cellTypeXpos))
		edges.push(new Edge(upperRight, lowerRight, EDGE_NEUTRAL));
	if(IS_EMPTY_YPOS(cellType) && IS_SOLID_YNEG(cellTypeYpos))
		edges.push(new Edge(upperLeft, upperRight, EDGE_NEUTRAL));

	// add diagonal edges
	if(cellType == CELL_FLOOR_DIAG_RIGHT)
		edges.push(new Edge(upperRight, lowerLeft, EDGE_NEUTRAL));
	else if(cellType == CELL_CEIL_DIAG_LEFT)
		edges.push(new Edge(lowerLeft, upperRight, EDGE_NEUTRAL));
	else if(cellType == CELL_FLOOR_DIAG_LEFT)
		edges.push(new Edge(lowerRight, upperLeft, EDGE_NEUTRAL));
	else if(cellType == CELL_CEIL_DIAG_RIGHT)
		edges.push(new Edge(upperLeft, lowerRight, EDGE_NEUTRAL));

	return edges;
};

World.prototype.getEdgesInAabb = function(aabb, color) {
	var xmin = Math.max(0, Math.floor(aabb.getLeft()));
	var ymin = Math.max(0, Math.floor(aabb.getBottom()));
	var xmax = Math.min(this.width, Math.ceil(aabb.getRight()));
	var ymax = Math.min(this.height, Math.ceil(aabb.getTop()));
	var edges = [];

	for(var x = xmin; x < xmax; x++)
		for(var y = ymin; y < ymax; y++)
			edges = edges.concat(this.cells[x][y].getBlockingEdges(color));

	return edges;
};

World.prototype.getCellsInAabb = function(aabb) {
	var xmin = Math.max(0, Math.floor(aabb.getLeft()));
	var ymin = Math.max(0, Math.floor(aabb.getBottom()));
	var xmax = Math.min(this.width, Math.ceil(aabb.getRight()));
	var ymax = Math.min(this.height, Math.ceil(aabb.getTop()));
	var cells = [];

	for(var x = xmin; x < xmax; x++)
		for(var y = ymin; y < ymax; y++)
			cells = cells.concat(this.cells[x][y]);

	return cells;
};

World.prototype.getHugeAabb = function() {
	return new AABB(new Vector(-WORLD_MARGIN, -WORLD_MARGIN), new Vector(this.width + WORLD_MARGIN, this.height + WORLD_MARGIN));
}

World.prototype.getWidth = function() {
	return this.width;
}

World.prototype.getHeight = function() {
	return this.height;
}
