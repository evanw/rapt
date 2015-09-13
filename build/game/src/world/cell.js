var CELL_EMPTY = 0;
var CELL_SOLID = 1;
var CELL_FLOOR_DIAG_LEFT = 2;
var CELL_FLOOR_DIAG_RIGHT = 3;
var CELL_CEIL_DIAG_LEFT = 4;
var CELL_CEIL_DIAG_RIGHT = 5;

// class Cell
function Cell(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.edges = [];
}

Cell.prototype.bottomLeft = function() { return new Vector(this.x, this.y); }
Cell.prototype.bottomRight = function() { return new Vector(this.x + 1, this.y); }
Cell.prototype.topLeft = function() { return new Vector(this.x, this.y + 1); }
Cell.prototype.topRight = function() { return new Vector(this.x + 1, this.y + 1); }

Cell.prototype.ceilingOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_CEIL_DIAG_LEFT || this.type === CELL_CEIL_DIAG_RIGHT;
}

Cell.prototype.floorOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_FLOOR_DIAG_LEFT || this.type === CELL_FLOOR_DIAG_RIGHT;
}

Cell.prototype.leftWallOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_FLOOR_DIAG_LEFT || this.type === CELL_CEIL_DIAG_LEFT;
}

Cell.prototype.rightWallOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_FLOOR_DIAG_RIGHT || this.type === CELL_CEIL_DIAG_RIGHT;
}

// This diagonal: /
Cell.prototype.posDiagOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_FLOOR_DIAG_RIGHT || this.type === CELL_CEIL_DIAG_LEFT;
}

// This diagonal: \
Cell.prototype.negDiagOccupied = function() {
    return this.type === CELL_SOLID || this.type === CELL_FLOOR_DIAG_LEFT || this.type === CELL_CEIL_DIAG_RIGHT;
}

Cell.prototype.addEdge = function(newEdge) {
	this.edges.push(newEdge);
}

Cell.prototype.removeEdge = function(edge) {
	var edgeIndex = this.getEdge(edge);
	this.edges.splice(edgeIndex, 1);
}

// returns all edges that block this color
Cell.prototype.getBlockingEdges = function(color) {
	var blockingEdges = [];
	for(var i = 0; i < this.edges.length; i++) {
		if(this.edges[i].blocksColor(color)) {
			blockingEdges.push(this.edges[i]);
		}
	}
	return blockingEdges;
}

Cell.prototype.getEdge = function(edge) {
	for (var i = 0; i < this.edges.length; ++i) {
		var thisEdge = this.edges[i];
		if ((thisEdge.getStart().sub(edge.getStart())).lengthSquared() < 0.001 &&
		   (thisEdge.getEnd().sub(edge.getEnd())).lengthSquared() < 0.001) {
			return i;
		}
	}
	return -1;
}

// returns a polygon that represents this cell
Cell.prototype.getShape = function() {
	var vxy = new Vector(this.x, this.y);
	var v00 = new Vector(0, 0);
	var v01 = new Vector(0, 1);
	var v10 = new Vector(1, 0);
	var v11 = new Vector(1, 1);
	switch(this.type) {
		case CELL_SOLID: return new Polygon(vxy, v00, v10, v11, v01);
		case CELL_FLOOR_DIAG_LEFT: return new Polygon(vxy, v00, v10, v01);
		case CELL_FLOOR_DIAG_RIGHT: return new Polygon(vxy, v00, v10, v11);
		case CELL_CEIL_DIAG_LEFT: return new Polygon(vxy, v00, v11, v01);
		case CELL_CEIL_DIAG_RIGHT: return new Polygon(vxy, v01, v10, v11);
	}
	return null;
}

Cell.prototype.draw = function(c) {
	var x = this.x, y = this.y;
	c.beginPath();
	if(this.type == CELL_SOLID)
	{
		c.moveTo(x, y);
		c.lineTo(x, y + 1);
		c.lineTo(x + 1, y + 1);
		c.lineTo(x + 1, y);
	}
	else if(this.type == CELL_FLOOR_DIAG_LEFT)
	{
		c.moveTo(x, y);
		c.lineTo(x + 1, y);
		c.lineTo(x, y + 1);
	}
	else if(this.type == CELL_FLOOR_DIAG_RIGHT)
	{
		c.moveTo(x, y);
		c.lineTo(x + 1, y + 1);
		c.lineTo(x + 1, y);
	}
	else if(this.type == CELL_CEIL_DIAG_LEFT)
	{
		c.moveTo(x, y);
		c.lineTo(x, y + 1);
		c.lineTo(x + 1, y + 1);
	}
	else if(this.type == CELL_CEIL_DIAG_RIGHT)
	{
		c.moveTo(x + 1, y);
		c.lineTo(x, y + 1);
		c.lineTo(x + 1, y + 1);
	}
	c.closePath()
	c.fill();
	c.stroke();
}

Cell.prototype.drawEdges = function(c) {
	for(var i = 0; i < this.edges.length; i++) {
		this.edges[i].draw(c);
	}
}
