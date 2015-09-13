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
	this.cellX = null;
	this.cellY = null;
	this.cellType = null;
}

SetCellTool.prototype.mouseDown = function(point) {
	this.doc.undoStack.beginMacro();
	this.dragging = true;
	this.mouseMoved(point);
};

SetCellTool.prototype.mouseMoved = function(point) {
	this.cellX = Math.floor(point.x);
	this.cellY = Math.floor(point.y);

	if (this.mode == SETCELL_DIAGONAL) {
		// Pick a different cell type depending on the quadrant
		if (point.x - this.cellX < 0.5) {
			this.cellType = (point.y - this.cellY < 0.5) ? CELL_FLOOR_DIAG_LEFT : CELL_CEIL_DIAG_LEFT;
		} else {
			this.cellType = (point.y - this.cellY < 0.5) ? CELL_FLOOR_DIAG_RIGHT : CELL_CEIL_DIAG_RIGHT;
		}
	} else {
		this.cellType = (this.mode == SETCELL_EMPTY) ? CELL_EMPTY : CELL_SOLID;
	}
	
	// Only change the cell type if it's different
	if (this.dragging && this.doc.world.getCell(this.cellX, this.cellY) != this.cellType) {
		this.doc.setCell(this.cellX, this.cellY, this.cellType);
	}
};

SetCellTool.prototype.mouseUp = function(point) {
	this.doc.undoStack.endMacro();
	this.dragging = false;
};

SetCellTool.prototype.draw = function(c) {
	if (this.cellType != null) {
		// Fill in the empty space
		var cell = new Cell();
		cell.type = this.cellType;
		c.fillStyle = rgba(191, 191, 191, 0.5);
		cell.draw(c, this.cellX, this.cellY);
		
		// Fill in the solid space
		cell.flipType();
		c.fillStyle = rgba(127, 127, 127, 0.5);
		cell.draw(c, this.cellX, this.cellY);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class PlaceDoorTool
////////////////////////////////////////////////////////////////////////////////

function PlaceDoorTool(doc, isOneWay, isInitiallyOpen, color) {
	this.doc = doc;
	this.isOneWay = isOneWay;
	this.isInitiallyOpen = isInitiallyOpen;
	this.color = color;
	this.edge = null;
}

PlaceDoorTool.prototype.mouseDown = function(point) {
	this.mouseMoved(point);
	this.doc.addPlaceable(new Door(this.isOneWay, this.isInitiallyOpen, this.color, this.edge));
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
	if (this.edge.pointBehindEdge(point)) this.edge.flip();
};

PlaceDoorTool.prototype.mouseUp = function(point) {
};

PlaceDoorTool.prototype.draw = function(c) {
	if (this.edge != null) {
		var door = new Door(this.isOneWay, false, this.color, this.edge);
		door.draw(c, 0.5);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class SelectionTool
////////////////////////////////////////////////////////////////////////////////

var SELECTION_MODE_NONE = 0;
var SELECTION_MODE_SELECT = 1;
var SELECTION_MODE_MOVE = 2;
var SELECTION_MODE_ROTATE = 3;

function SelectionTool(doc) {
	this.doc = doc;
	this.mode = SELECTION_MODE_NONE;
	this.start = this.end = null;
	this.modifierKeyPressed = false;
	this.originalSelection = [];
	this.rotationOrigin = null;
}

SelectionTool.prototype.mouseDown = function(point) {
	var i, j;
	
	this.originalSelection = this.doc.world.getSelection();
	this.doc.undoStack.beginMacro();
	
	// Check if we clicked on an existing selection
	var clickedOnSelection = false;
	var padding = new Vector(0.1, 0.1);
	var selectionUnderMouse = this.doc.world.selectionInRect(new Rectangle(point.sub(padding), point.add(padding)));
	for (i = 0; i < selectionUnderMouse.length; i++) {
		for (j = 0; j < this.originalSelection.length; j++) {
			if (selectionUnderMouse[i] == this.originalSelection[j]) {
				clickedOnSelection = true;
				break;
			}
		}
	}
	
	// If we clicked on an existing selection, move it around instead
	if (clickedOnSelection) {
		this.mode = SELECTION_MODE_MOVE;
		this.start = point;
		return;
	}
	
	// Next, check if we clicked on an angle polygon
	var clickedOnAnglePolygon = false;
	for (i = 0; i < this.originalSelection.length; i++) {
		var s = this.originalSelection[i];
		if ((s instanceof Sprite) && s.hasAnglePolygon()) {
			var p = s.getAnglePolygon();
			if (p.containsPoint(point)) {
				clickedOnAnglePolygon = true;
				this.rotationOrigin = s.anchor;
				break;
			}
		}
	}
	
	// If we clicked on an angle polygon, rotate the selection instead (about that sprite)
	if (clickedOnAnglePolygon) {
		this.mode = SELECTION_MODE_ROTATE;
		this.start = point;
	} else if (!this.modifierKeyPressed && selectionUnderMouse.length > 0) {
		// If you drag an unselected element, set that as the selection so it doesn't take two clicks to move something
		this.mode = SELECTION_MODE_MOVE;
		this.start = point;
		this.doc.setSelection(selectionUnderMouse);
	} else {
		this.mode = SELECTION_MODE_SELECT;
		this.start = this.end = point;
		this.mouseMoved(point);
	}
};

SelectionTool.prototype.mouseMoved = function(point) {
	this.end = point;
	if (this.mode == SELECTION_MODE_SELECT) {
		var newSelection = this.doc.world.selectionInRect(new Rectangle(this.start, this.end));
		if (this.modifierKeyPressed) {
			// add anything in original but not in new (additive), and remove anything in both (subtractive)
			for (var i = 0; i < this.originalSelection.length; i++) {
				var s = this.originalSelection[i];
				for (var j = 0; j < newSelection.length; j++) {
					if (s == newSelection[j]) {
						break;
					}
				}
				if (j == newSelection.length) {
					// add element in original but not in new (additive)
					newSelection.push(s);
				} else {
					// remove element in both (subtractive)
					newSelection.splice(j--, 1);
				}
			}
		}
		this.doc.setSelection(newSelection);
	} else if (this.mode == SELECTION_MODE_MOVE) {
		this.doc.moveSelection(point.sub(this.start));
		this.start = point;
	} else if (this.mode == SELECTION_MODE_ROTATE) {
		var deltaAngle = point.sub(this.rotationOrigin).atan2() - this.start.sub(this.rotationOrigin).atan2();
		this.doc.rotateSelection(deltaAngle);
		this.start = point;
	}
};

SelectionTool.prototype.mouseUp = function(point) {
	if (this.mode == SELECTION_MODE_MOVE) {
		// Reset all anchors, needed for placeables that lock to the grid (walls/doors)
		var selection = this.doc.world.getSelection();
		for (var i = 0; i < selection.length; i++) {
			selection[i].resetAnchor();
		}
	}
	this.mode = SELECTION_MODE_NONE;
	this.doc.undoStack.endMacro();
};

SelectionTool.prototype.draw = function(c) {
	if (this.mode == SELECTION_MODE_SELECT) {
		c.fillStyle = rgba(0, 0, 0, 0.1);
		c.strokeStyle = rgba(0, 0, 0, 0.5);
		c.fillRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
		c.strokeRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerStartTool
////////////////////////////////////////////////////////////////////////////////

function SetPlayerStartTool(doc) {
	this.doc = doc;
	this.point = null;
	this.dragging = false;
}

SetPlayerStartTool.prototype.mouseDown = function(point) {
	this.dragging = true;
	this.doc.undoStack.beginMacro();
	this.mouseMoved(point);
};

SetPlayerStartTool.prototype.mouseMoved = function(point) {
	if (this.dragging) {
		this.doc.setPlayerStart(new Vector(Math.floor(point.x), Math.floor(point.y)));
	}
	this.point = point;
};

SetPlayerStartTool.prototype.mouseUp = function(point) {
	this.dragging = false;
	this.doc.undoStack.endMacro();
};

SetPlayerStartTool.prototype.draw = function(c) {
	if (this.point != null) {
		Sprites.drawSpawnPoint(c, 0.5, this.point.floor().add(new Vector(0.5, 0.5)));
	}
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerGoalTool
////////////////////////////////////////////////////////////////////////////////

function SetPlayerGoalTool(doc) {
	this.doc = doc;
	this.point = null;
	this.dragging = false;
}

SetPlayerGoalTool.prototype.mouseDown = function(point) {
	this.dragging = true;
	this.doc.undoStack.beginMacro();
	this.mouseMoved(point);
};

SetPlayerGoalTool.prototype.mouseMoved = function(point) {
	if (this.dragging) {
		this.doc.setPlayerGoal(new Vector(Math.floor(point.x), Math.floor(point.y)));
	}
	this.point = point;
};

SetPlayerGoalTool.prototype.mouseUp = function(point) {
	this.dragging = false;
	this.doc.undoStack.endMacro();
};

SetPlayerGoalTool.prototype.draw = function(c) {
	if (this.point != null) {
		Sprites.drawGoal(c, 0.5, this.point.floor().add(new Vector(0.5, 0.5)), 0.6);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class AddPlaceableTool
////////////////////////////////////////////////////////////////////////////////

function AddPlaceableTool(doc, placeableTemplate) {
	this.doc = doc;
	this.placeableTemplate = placeableTemplate;
	this.point = null;
}

AddPlaceableTool.prototype.mouseDown = function(point) {
	this.mouseMoved(point);
	
	var placeable = this.placeableTemplate.clone(this.point, this.placeableTemplate.color);
	this.doc.addPlaceable(placeable);
	
	if (this.placeableTemplate.id == SPRITE_SIGN) {
		this.doc.setSelection([placeable]);
		showSignTextDialog(placeable.text, function(text) {
			editor.doc.setSignText(placeable, text);
			editor.draw();
		});
	}
};

AddPlaceableTool.prototype.mouseMoved = function(point) {
	this.point = point;
};

AddPlaceableTool.prototype.mouseUp = function(point) {
};

AddPlaceableTool.prototype.draw = function(c) {
	if (this.point != null) {
		this.placeableTemplate.clone(this.point, this.placeableTemplate.color).draw(c, 0.5);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class LinkButtonToDoorTool
////////////////////////////////////////////////////////////////////////////////

function LinkButtonToDoorTool(doc) {
	this.doc = doc;
	this.from = null;
	this.to = null;
	this.isLinking = false;
	this.isValidLink = false;
}

LinkButtonToDoorTool.prototype.mouseDown = function(point) {
	this.mouseMoved(point);
	this.isLinking = (this.from !== null);
	this.mouseMoved(point);
};

LinkButtonToDoorTool.prototype.mouseMoved = function(point) {
	var button = this.doc.world.closestPlaceableOfType(point, Button);
	var door = this.doc.world.closestPlaceableOfType(point, Door);
	if (this.isLinking) {
		if (this.from instanceof Button) this.to = door;
		else if (this.from instanceof Door) this.to = button;
		else this.to = null;
		this.isValidLink = (this.from !== null && this.to !== null);
	} else {
		var pointToButton = (button !== null) ? button.getCenter().sub(point).lengthSquared() : Number.POSITIVE_INFINITY;
		var pointToDoor = (door !== null) ? door.getCenter().sub(point).lengthSquared() : Number.POSITIVE_INFINITY;
		this.from = (pointToButton < pointToDoor) ? button : door;
		this.to = null;
		this.isValidLink = false;
	}
};

LinkButtonToDoorTool.prototype.mouseUp = function(point) {
	this.mouseMoved(point);
	if (this.isValidLink) {
		var button = (this.from instanceof Button) ? this.from : this.to;
		var door = (this.from instanceof Door) ? this.from : this.to;
		
		// Check if this link already exists
		var linkAlreadyExists = false;
		var placeables = this.doc.world.placeables;
		for (var i = 0; i < placeables.length; i++) {
			if (placeables[i] instanceof Link && placeables[i].button == button && placeables[i].door == door) {
				linkAlreadyExists = true;
				break;
			}
		}
		
		// Only add the new link if it doesn't already exist
		if (!linkAlreadyExists) {
			this.doc.addPlaceable(new Link(button, door));
		}
	}
	this.isLinking = false;
	this.mouseMoved(point);
};

LinkButtonToDoorTool.prototype.draw = function(c) {
	c.fillStyle = rgba(0, 0, 0, 0);
	c.strokeStyle = rgba(0, 0, 0, 0.5);
	if (this.from !== null) this.from.drawSelection(c);
	if (this.to !== null) this.to.drawSelection(c);
	if (this.isValidLink) {
		var button = (this.from instanceof Button) ? this.from : this.to;
		var door = (this.from instanceof Door) ? this.from : this.to;
		dashedLine(c, button.getCenter(), door.getCenter());
	}
};

////////////////////////////////////////////////////////////////////////////////
// class ToggleInitiallyOpenTool
////////////////////////////////////////////////////////////////////////////////

function ToggleInitiallyOpenTool(doc) {
	this.doc = doc;
	this.door = null;
}

ToggleInitiallyOpenTool.prototype.mouseDown = function(point) {
	this.mouseMoved(point);
	if (this.door != null) {
		this.doc.toggleInitiallyOpen(this.door);
	}
};

ToggleInitiallyOpenTool.prototype.mouseMoved = function(point) {
	this.door = this.doc.world.closestPlaceableOfType(point, Door);
};

ToggleInitiallyOpenTool.prototype.mouseUp = function(point) {
};

ToggleInitiallyOpenTool.prototype.draw = function(c) {
	if (this.door != null) {
		c.fillStyle = rgba(0, 0, 0, 0);
		c.strokeStyle = rgba(0, 0, 0, 0.5);
		this.door.drawSelection(c);
	}
};
