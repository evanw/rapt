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

CameraPanTool.prototype.mouseDragged = function(point) {
	// Cannot set this.worldCenter because that wouldn't modify the original object
	this.worldCenter.x -= point.x - this.oldPoint.x;
	this.worldCenter.y -= point.y - this.oldPoint.y;
};

CameraPanTool.prototype.mouseUp = function(point) {
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
}

SetCellTool.prototype.mouseDown = function(point) {
	this.mouseDragged(point);
};

SetCellTool.prototype.mouseDragged = function(point) {
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

	this.doc.setCell(cellX, cellY, cellType);
};

SetCellTool.prototype.mouseUp = function(point) {
};
