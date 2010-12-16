////////////////////////////////////////////////////////////////////////////////
// class CameraPanTool
////////////////////////////////////////////////////////////////////////////////

function CameraPanTool(worldCenter) {
	this.worldCenter = worldCenter;
	this.oldPoint = new Vector(0, 0);
}

CameraPanTool.prototype.mouseDown = function(point) {
	this.oldPoint = point;
};

CameraPanTool.prototype.mouseMoved = function(point) {
	// Cannot set this.worldCenter directly because that wouldn't modify the original object
	this.worldCenter.x -= point.x - this.oldPoint.x;
	this.worldCenter.y -= point.y - this.oldPoint.y;
};

CameraPanTool.prototype.mouseUp = function(point) {
};

CameraPanTool.prototype.draw = function(c) {
};

////////////////////////////////////////////////////////////////////////////////
// class SetCellTool
////////////////////////////////////////////////////////////////////////////////

var SETCELL_EMPTY = 0;
var SETCELL_SOLID = 1;
var SETCELL_DIAGONAL = 2;

function SetCellTool(doc, mode) {
	this.doc = doc;
	this.mode = mode;
	this.dragging = false;
}

SetCellTool.prototype.mouseDown = function(point) {
	this.doc.undoStack.beginMacro();
	this.dragging = true;
	this.mouseMoved(point);
};

SetCellTool.prototype.mouseMoved = function(point) {
	var cellX = Math.floor(point.x);
	var cellY = Math.floor(point.y);
	var cellType;

	if (this.mode == SETCELL_DIAGONAL) {
		// Pick a different cell type depending on the quadrant
		if (point.x - cellX < 0.5) {
			cellType = (point.y - cellY < 0.5) ? CELL_FLOOR_DIAG_LEFT : CELL_CEIL_DIAG_LEFT;
		} else {
			cellType = (point.y - cellY < 0.5) ? CELL_FLOOR_DIAG_RIGHT : CELL_CEIL_DIAG_RIGHT;
		}
	} else {
		cellType = (this.mode == SETCELL_EMPTY) ? CELL_EMPTY : CELL_SOLID;
	}
	
	if (this.dragging) this.doc.setCell(cellX, cellY, cellType);
};

SetCellTool.prototype.mouseUp = function(point) {
	this.doc.undoStack.endMacro();
	this.dragging = false;
};

SetCellTool.prototype.draw = function(c) {
};

////////////////////////////////////////////////////////////////////////////////
// class PlaceDoorTool
////////////////////////////////////////////////////////////////////////////////

function PlaceDoorTool(doc, isOneWay) {
	this.doc = doc;
	this.isOneWay = isOneWay;
	this.edge = null;
}

PlaceDoorTool.prototype.mouseDown = function(point) {
	this.mouseMoved(point);
	this.doc.addPlaceable(new Door(this.isOneWay, this.edge));
};

PlaceDoorTool.prototype.mouseMoved = function(point) {
	// Generate all the edges in the cell under point
	var x = Math.floor(point.x);
	var y = Math.floor(point.y);
	var p00 = new Vector(x, y);
	var p10 = new Vector(x + 1, y);
	var p01 = new Vector(x, y + 1);
	var p11 = new Vector(x + 1, y + 1);
	var edges = [
		new Edge(p00, p10),
		new Edge(p01, p00),
		new Edge(p00, p11),
		new Edge(p10, p01),
		new Edge(p10, p11),
		new Edge(p11, p01)
	];
	
	// Pick the closest edge facing away from point
	this.edge = EdgePicker.getClosestEdge(point, edges);
	if (!this.edge.pointBehindEdge(point)) this.edge.flip();
};

PlaceDoorTool.prototype.mouseUp = function(point) {
};

PlaceDoorTool.prototype.draw = function(c) {
	if (this.edge != null) {
		c.strokeStyle = 'black';
		this.edge.draw(c);
		
		if (!this.isOneWay) {
			this.edge.flip();
			this.edge.draw(c);
			this.edge.flip();
		}
	}
};

////////////////////////////////////////////////////////////////////////////////
// class SelectionTool
////////////////////////////////////////////////////////////////////////////////

function SelectionTool() {
	this.start = this.end = null;
}

SelectionTool.prototype.mouseDown = function(point) {
	this.start = this.end = point;
};

SelectionTool.prototype.mouseMoved = function(point) {
	this.end = point;
};

SelectionTool.prototype.mouseUp = function(point) {
	this.start = this.end = null;
};

SelectionTool.prototype.draw = function(c) {
	if (this.start != null) {
		c.fillStyle = 'rgba(0, 0, 0, 0.1)';
		c.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		c.fillRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
		c.strokeRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
	}
};
