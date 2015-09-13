(function(){

// commands.js
// document.js
// edgepicker.js
// editor.js
// main.js
// sidebar.js
// sprites.js
// tools.js
// world.js
// button.js
// door.js
// link.js
// sprite.js
// levelformat.js
// other.js
// shapes.js
// undo.js
// vector.js

////////////////////////////////////////////////////////////////////////////////
// class SetCellCommand
////////////////////////////////////////////////////////////////////////////////

function SetCellCommand(world, x, y, type) {
	this.world = world;
	this.x = x;
	this.y = y;
	this.type = type;
	this.oldType = world.getCell(x, y);
}

SetCellCommand.prototype.undo = function() {
	this.world.setCell(this.x, this.y, this.oldType);
};

SetCellCommand.prototype.redo = function() {
	this.world.setCell(this.x, this.y, this.type);
};

SetCellCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetCellCommand && this.x == command.x && this.y == command.y && this.type == command.type) {
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function SetSelectionCommand(world, selection) {
	this.world = world;
	this.oldSelection = world.getSelection();
	this.selection = selection;
}

SetSelectionCommand.prototype.undo = function() {
	this.world.setSelection(this.oldSelection);
};

SetSelectionCommand.prototype.redo = function() {
	this.world.setSelection(this.selection);
};

SetSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetSelectionCommand) {
		this.selection = command.selection;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class AddPlaceableCommand
////////////////////////////////////////////////////////////////////////////////

function AddPlaceableCommand(world, placeable) {
	this.world = world;
	this.placeable = placeable;
}

AddPlaceableCommand.prototype.undo = function() {
	this.world.removePlaceable(this.placeable);
};

AddPlaceableCommand.prototype.redo = function() {
	this.world.addPlaceable(this.placeable);
};

////////////////////////////////////////////////////////////////////////////////
// class RemovePlaceableCommand
////////////////////////////////////////////////////////////////////////////////

function RemovePlaceableCommand(world, placeable) {
	this.world = world;
	this.placeable = placeable;
}

RemovePlaceableCommand.prototype.undo = function() {
	this.world.addPlaceable(this.placeable);
};

RemovePlaceableCommand.prototype.redo = function() {
	this.world.removePlaceable(this.placeable);
};

////////////////////////////////////////////////////////////////////////////////
// class MoveSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function MoveSelectionCommand(world, delta) {
	this.world = world;
	this.delta = delta;
	this.oldAnchors = [];
	this.selection = world.getSelection();
	for (var i = 0; i < this.selection.length; i++) {
		this.oldAnchors.push(this.selection[i].getAnchor());
	}
};

MoveSelectionCommand.prototype.undo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAnchor(this.oldAnchors[i]);
	}
};

MoveSelectionCommand.prototype.redo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAnchor(this.oldAnchors[i].add(this.delta));
	}
};

MoveSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof MoveSelectionCommand) {
		this.delta = this.delta.add(command.delta);
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerStartCommand
////////////////////////////////////////////////////////////////////////////////

function SetPlayerStartCommand(world, playerStart) {
	this.world = world;
	this.playerStart = playerStart;
	this.oldPlayerStart = world.playerStart;
}

SetPlayerStartCommand.prototype.undo = function() {
	this.world.playerStart = this.oldPlayerStart;
};

SetPlayerStartCommand.prototype.redo = function() {
	this.world.playerStart = this.playerStart;
};

SetPlayerStartCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetPlayerStartCommand) {
		this.playerStart = command.playerStart;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerGoalCommand
////////////////////////////////////////////////////////////////////////////////

function SetPlayerGoalCommand(world, playerGoal) {
	this.world = world;
	this.playerGoal = playerGoal;
	this.oldPlayerGoal = world.playerGoal;
}

SetPlayerGoalCommand.prototype.undo = function() {
	this.world.playerGoal = this.oldPlayerGoal;
};

SetPlayerGoalCommand.prototype.redo = function() {
	this.world.playerGoal = this.playerGoal;
};

SetPlayerGoalCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetPlayerGoalCommand) {
		this.playerGoal = command.playerGoal;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class ToggleInitiallyOpenCommand
////////////////////////////////////////////////////////////////////////////////

function ToggleInitiallyOpenCommand(door) {
	this.door = door;
	this.isInitiallyOpen = door.isInitiallyOpen;
}

ToggleInitiallyOpenCommand.prototype.undo = function() {
	this.door.isInitiallyOpen = this.isInitiallyOpen;
};

ToggleInitiallyOpenCommand.prototype.redo = function() {
	this.door.isInitiallyOpen = !this.isInitiallyOpen;
};

////////////////////////////////////////////////////////////////////////////////
// class RotateSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function RotateSelectionCommand(world, deltaAngle) {
	this.world = world;
	this.deltaAngle = deltaAngle;
	this.oldAngles = [];
	this.selection = world.getSelection();
	for (var i = 0; i < this.selection.length; i++) {
		this.oldAngles.push(this.selection[i].getAngle());
	}
}

RotateSelectionCommand.prototype.undo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAngle(this.oldAngles[i]);
	}
};

RotateSelectionCommand.prototype.redo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAngle(this.oldAngles[i] + this.deltaAngle);
	}
};

RotateSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof RotateSelectionCommand) {
		this.deltaAngle += command.deltaAngle;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetSignTextCommand
////////////////////////////////////////////////////////////////////////////////

function SetSignTextCommand(sign, text) {
	this.sign = sign;
	this.text = text;
	this.oldText = sign.text;
}

SetSignTextCommand.prototype.undo = function() {
	this.sign.text = this.oldText;
};

SetSignTextCommand.prototype.redo = function() {
	this.sign.text = this.text;
};

////////////////////////////////////////////////////////////////////////////////
// class Document
////////////////////////////////////////////////////////////////////////////////

function Document() {
	this.world = new World();
	this.undoStack = new UndoStack();
}

Document.prototype.setCell = function(x, y, type) {
	this.undoStack.push(new SetCellCommand(this.world, x, y, type));
};

Document.prototype.addPlaceable = function(placeable) {
	this.undoStack.push(new AddPlaceableCommand(this.world, placeable));
};

Document.prototype.removePlaceable = function(placeable) {
	this.undoStack.push(new RemovePlaceableCommand(this.world, placeable));
	
	// Also remove all links with deleted buttons and doors
	if (placeable instanceof Button || placeable instanceof Door) {
		var deadLinks = [];
		var i;
		for (i = 0; i < this.world.placeables.length; i++) {
			var link = this.world.placeables[i];
			if (link instanceof Link && (link.button == placeable || link.door == placeable)) {
				deadLinks.push(link);
			}
		}
		for (i = 0; i < deadLinks.length; i++) {
			this.undoStack.push(new RemovePlaceableCommand(this.world, deadLinks[i]));
		}
	}
};

Document.prototype.setSelection = function(selection) {
	// Compare oldSelection and selection
	var oldSelection = this.world.getSelection();
	var sameSelection = (oldSelection.length == selection.length);
	if (sameSelection) {
		for (var i = 0; i < oldSelection.length; i++) {
			var found = false;
			for (var j = 0; j < selection.length; j++) {
				if (oldSelection[i] == selection[j]) {
					found = true;
					break;
				}
			}
			if (found == false) {
				sameSelection = false;
				break;
			}
		}
	}
	
	// Only change the selection if oldSelection and selection are different
	if (!sameSelection) {
		this.undoStack.push(new SetSelectionCommand(this.world, selection));
	}
};

Document.prototype.moveSelection = function(delta) {
	this.undoStack.push(new MoveSelectionCommand(this.world, delta));
};

Document.prototype.rotateSelection = function(deltaAngle) {
	this.undoStack.push(new RotateSelectionCommand(this.world, deltaAngle));
};

Document.prototype.setPlayerStart = function(playerStart) {
	this.undoStack.push(new SetPlayerStartCommand(this.world, playerStart));
};

Document.prototype.setPlayerGoal = function(playerGoal) {
	this.undoStack.push(new SetPlayerGoalCommand(this.world, playerGoal));
};

Document.prototype.toggleInitiallyOpen = function(door) {
	this.undoStack.push(new ToggleInitiallyOpenCommand(door));
};

Document.prototype.setSignText = function(sign, text) {
	this.undoStack.push(new SetSignTextCommand(sign, text));
};

Document.prototype.isClean = function() {
	var index = this.undoStack.currentIndex;
	var clean = this.undoStack.cleanIndex;
	
	// back up to ignore all selection commands, because changing the selection shouldn't count as a modification
	while (index > clean) {
		var c = this.undoStack.commands[index - 1];
		if (c instanceof SetSelectionCommand || (c instanceof MacroCommand && c.commands.length == 1 && c.commands[0] instanceof SetSelectionCommand)) {
			index--;
		} else {
			break;
		}
	}
	
	return index == clean;
};

////////////////////////////////////////////////////////////////////////////////
// class Edge
////////////////////////////////////////////////////////////////////////////////

function Edge(start, end) {
	this.start = start;
	this.end = end;
}

Edge.prototype.squaredDistanceToPoint = function(point) {
	var line = this.end.sub(this.start);
	var t = point.sub(this.start).dot(line) / line.lengthSquared();
	
	// The 0.01 is for disambiguating edges with the same end point (to pick the closer one)
	t = Math.max(0.01, Math.min(0.99, t));
	
	var closest = this.start.add(line.mul(t));
	return closest.sub(point).lengthSquared();
};

Edge.prototype.pointBehindEdge = function(point) {
	return point.sub(this.start).dot(this.end.sub(this.start).flip()) < 0;
};

Edge.prototype.flip = function() {
	var temp = this.start;
	this.start = this.end;
	this.end = temp;
};

Edge.prototype.pointAlongLine = function(fraction) {
	return this.start.mul(1 - fraction).add(this.end.mul(fraction));
};

Edge.prototype.drawDirectionIndicators = function(c, isInitiallyOpen) {
	var normal = this.end.sub(this.start).flip().unit();
	for (var i = 1, num = 10; i < num - 1; i++) {
		var point = this.pointAlongLine(i / (num - 1));
		var d = isInitiallyOpen ? 0.05 : 0;
		c.moveTo(point.x + normal.x * d, point.y + normal.y * d);
		c.lineTo(point.x + normal.x * 0.1, point.y + normal.y * 0.1);
	}
};

Edge.prototype.draw = function(c) {
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	this.drawDirectionIndicators(c, false);
	c.stroke();
};

Edge.prototype.drawOpen = function(c) {
	var a = this.pointAlongLine(1 / 9);
	var b = this.pointAlongLine(8 / 9);
	c.beginPath();
	c.moveTo(this.start.x, this.start.y);
	c.lineTo(this.end.x, this.end.y);
	this.drawDirectionIndicators(c, true);
	c.stroke();
};

////////////////////////////////////////////////////////////////////////////////
// class EdgePicker
////////////////////////////////////////////////////////////////////////////////

function EdgePicker() {
}

EdgePicker.getClosestEdge = function(point, edges) {
	var edge = null;
	var minDistance = Number.MAX_VALUE;
	for (var i = 0; i < edges.length; i++) {
		var distance = edges[i].squaredDistanceToPoint(point);
		if (distance < minDistance) {
			minDistance = distance;
			edge = edges[i];
		}
	}
	return edge;
};

// Bitmask for mouse buttons
var MOUSE_LEFT = (1 << 1);
var MOUSE_MIDDLE = (1 << 2);
var MOUSE_RIGHT = (1 << 3);

// Tiles
var MODE_EMPTY = 0;
var MODE_SOLID = 1;
var MODE_DIAGONAL = 2;

// Game Elements
var MODE_START = 3;
var MODE_GOAL = 4;
var MODE_COG = 5;
var MODE_SIGN = 6;

// Other
var MODE_SELECT = 7;
var MODE_ENEMIES = 8;
var MODE_WALLS_BUTTONS = 9;
var MODE_HELP = 10;
var MODE_SAVE_AND_EXIT = 11;

function todo(c, alpha) {
	Sprites.drawQuestionMark(c, alpha);
}

////////////////////////////////////////////////////////////////////////////////
// class Editor
////////////////////////////////////////////////////////////////////////////////

function Editor(canvas) {
	this.canvas = canvas;
	this.c = canvas.getContext('2d');
	this.worldCenter = new Vector(0, 0);
	this.worldScale = 50;
	this.activeTool = null;
	this.doc = new Document();
	this.setMode(MODE_EMPTY);
	this.selectedEnemy = 0;
	this.selectedWall = 0;
	this.isMouseOver = false;
	this.width = 0;
	this.height = 0;

	// simple default level
	this.doc.world.playerStart = new Vector(-2, -1);
	this.doc.world.playerGoal = new Vector(1, -1);
	this.doc.world.setCell(-2, -1, CELL_EMPTY);
	this.doc.world.setCell(-2, 0, CELL_EMPTY);
	this.doc.world.setCell(-1, 0, CELL_EMPTY);
	this.doc.world.setCell(0, 0, CELL_EMPTY);
	this.doc.world.setCell(1, 0, CELL_EMPTY);
	this.doc.world.setCell(1, -1, CELL_EMPTY);

	this.enemies = [];
	// add color-neutral enemies
	for (var i = SPRITE_BOMBER; i <= SPRITE_WHEELIGATOR; i++) {
		this.enemies.push({
			name: spriteTemplates[i].name,
			sprite: spriteTemplates[i].sprite
		});
	}
	// add color-specific enemies
	for (i = SPRITE_BOUNCY_ROCKET_LAUNCHER; i <= SPRITE_WALL_AVOIDER; i++) {
		this.enemies.push({
			name: spriteTemplates[i].name,
			sprite: spriteTemplates[i].sprite.clone(new Vector(0, 0), COLOR_RED)
		});
		this.enemies.push({
			name: spriteTemplates[i].name,
			sprite: spriteTemplates[i].sprite.clone(new Vector(0, 0), COLOR_BLUE)
		});
	}
}

Editor.prototype.loadFromJSON = function(json) {
	this.doc.world = loadWorldFromJSON(json);
	this.worldCenter = this.doc.world.playerStart.add(new Vector(0.5, 0.5));
	this.draw();
};

Editor.prototype.setMode = function(mode) {
	this.mode = mode;

	switch (mode) {
	case MODE_EMPTY:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_EMPTY);
		break;
	case MODE_SOLID:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_SOLID);
		break;
	case MODE_DIAGONAL:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_DIAGONAL);
		break;
	case MODE_SELECT:
		this.selectedTool = new SelectionTool(this.doc);
		break;
	case MODE_START:
		this.selectedTool = new SetPlayerStartTool(this.doc);
		break;
	case MODE_GOAL:
		this.selectedTool = new SetPlayerGoalTool(this.doc);
		break;
	case MODE_COG:
		this.selectedTool = new AddPlaceableTool(this.doc, spriteTemplates[SPRITE_COG].sprite);
		break;
	case MODE_SIGN:
		this.selectedTool = new AddPlaceableTool(this.doc, spriteTemplates[SPRITE_SIGN].sprite);
		break;
	case MODE_ENEMIES:
	case MODE_WALLS_BUTTONS:
		this.setSidePanelTool();
		break;
	default:
		this.selectedTool = null;
		break;
	}
};

Editor.prototype.setSidePanelTool = function() {
	if (this.mode == MODE_ENEMIES) {
		this.selectedTool = new AddPlaceableTool(this.doc, this.enemies[this.selectedEnemy].sprite);
	} else if (this.mode == MODE_WALLS_BUTTONS) {
		// TODO: constants for these
		if (this.selectedWall < 6) {
			this.selectedTool = new PlaceDoorTool(this.doc, (this.selectedWall & 1), false, Math.floor(this.selectedWall / 2));
		} else if (this.selectedWall < 9) {
			this.selectedTool = new AddPlaceableTool(this.doc, new Button(null, this.selectedWall - 6));
		} else if (this.selectedWall == 9) {
			this.selectedTool = new LinkButtonToDoorTool(this.doc);
		} else if (this.selectedWall == 10) {
			this.selectedTool = new ToggleInitiallyOpenTool(this.doc);
		} else {
			this.selectedTool = null;
		}
	}
};

Editor.prototype.resize = function(width, height) {
	// Retina support
	var ratio = window['devicePixelRatio'];
	this.width = width;
	this.height = height;
	this.canvas.width = Math.round(width * ratio);
	this.canvas.height = Math.round(height * ratio);
	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';
	this.c.scale(ratio, ratio);
};

Editor.prototype.draw = function() {
	var c = this.c;
	var w = this.width;
	var h = this.height;

	// Fill the background in
	c.fillStyle = '#7F7F7F';
	c.fillRect(0, 0, w, h);

	c.save();

	// Set up camera transform (make sure the lines start off sharp by translating 0.5)
	c.translate(Math.round(w / 2) + 0.5, Math.round(h / 2) + 0.5);
	c.scale(this.worldScale, -this.worldScale);
	c.translate(-this.worldCenter.x, -this.worldCenter.y);
	c.lineWidth = 1 / this.worldScale;

	// Render the view
	this.doc.world.draw(c);
	this.drawGrid();

	// Let the tool draw overlays if needed
	if (this.isMouseOver && this.selectedTool != null) this.selectedTool.draw(c);

	c.restore();
};

Editor.prototype.drawGrid = function() {
	var c = this.c;

	// Blend away every other line as we zoom out
	var logWorldScale = Math.log(50 / this.worldScale) / Math.log(2);
	var currentResolution = (logWorldScale < 1) ? 1 : (1 << Math.floor(logWorldScale));
	var nextResolution = 2 * currentResolution;
	var percent = (logWorldScale < 0) ? 1 : (1 - logWorldScale + Math.floor(logWorldScale));

	// Work out which lines we have to draw
	var min = this.viewportToWorld(new Vector(0, this.height));
	var max = this.viewportToWorld(new Vector(this.width, 0));
	var minX = Math.floor(min.x / nextResolution) * nextResolution;
	var minY = Math.floor(min.y / nextResolution) * nextResolution;
	var maxX = Math.ceil(max.x / nextResolution) * nextResolution;
	var maxY = Math.ceil(max.y / nextResolution) * nextResolution;

	// Draw the solid
	var x, y;
	c.strokeStyle = rgba(0, 0, 0, 0.2);
	c.beginPath();
	for (x = minX; x <= maxX; x += 2 * currentResolution) {
		c.moveTo(x, minY);
		c.lineTo(x, maxY);
	}
	for (y = minY; y <= maxY; y += 2 * currentResolution) {
		c.moveTo(minX, y);
		c.lineTo(maxX, y);
	}
	c.stroke();

	// Draw the fading lines
	c.strokeStyle = rgba(0, 0, 0, 0.2 * percent * percent);
	c.beginPath();
	for (x = minX + currentResolution; x <= maxX; x += 2 * currentResolution) {
		c.moveTo(x, minY);
		c.lineTo(x, maxY);
	}
	for (y = minY + currentResolution; y <= maxY; y += 2 * currentResolution) {
		c.moveTo(minX, y);
		c.lineTo(maxX, y);
	}
	c.stroke();
};

Editor.prototype.mouseDown = function(point, buttons, modifierKeyPressed) {
	if (buttons == MOUSE_MIDDLE || buttons == MOUSE_RIGHT) {
		// Camera pan on right click (or middle click because right click is broken in Safari)
		this.activeTool = new CameraPanTool(this.worldCenter);
		this.activeTool.mouseDown(this.viewportToWorld(point));
	} else if (buttons == MOUSE_LEFT) {
		// Use selected tool on left click
		this.activeTool = this.selectedTool;

		if (this.activeTool != null) {
			// Need to clear macro stack here if we get a mousedown event without a mouseup event
			this.doc.undoStack.endAllMacros();
			this.activeTool.modifierKeyPressed = modifierKeyPressed;
			this.activeTool.mouseDown(this.viewportToWorld(point));
		}
	}
	this.draw();
};

Editor.prototype.mouseMoved = function(point, buttons) {
	if (this.activeTool != null) {
		this.activeTool.mouseMoved(this.viewportToWorld(point));
	}
	if (this.selectedTool != null) {
		this.selectedTool.mouseMoved(this.viewportToWorld(point));
	}
	this.draw();
};

Editor.prototype.mouseUp = function(point, buttons) {
	if (this.activeTool != null) {
		this.activeTool.mouseUp(this.viewportToWorld(point));
	}
	this.activeTool = null;
	this.draw();
};

Editor.prototype.mouseWheel = function(deltaX, deltaY) {
	// Scale the camera keeping the current view centered
	this.worldScale = Math.max(1, this.worldScale * Math.pow(1.1, deltaY));
	this.draw();
};

Editor.prototype.mouseOver = function() {
	this.isMouseOver = true;
	this.draw();
};

Editor.prototype.mouseOut = function() {
	this.isMouseOver = false;
	this.draw();
};

Editor.prototype.doubleClick = function(point) {
	var worldPoint = this.viewportToWorld(point);
	var selection = this.doc.world.selectionInRect(new Rectangle(worldPoint, worldPoint));
	if (selection.length > 1) {
		overlay('Multiple selection');
	} else if (selection.length == 1 && (selection[0] instanceof Sprite) && selection[0].id == SPRITE_SIGN) {
		this.doc.setSelection(selection);
		this.draw();
		showSignTextDialog(selection[0].text, function(text) {
			editor.doc.setSignText(selection[0], text);
			editor.draw();
		});
	}
};

Editor.prototype.viewportToWorld = function(viewportPoint) {
	// Convenience method to convert from viewport to world coordinates
	var x = (viewportPoint.x - this.width / 2) / this.worldScale + this.worldCenter.x;
	var y = (this.height / 2 - viewportPoint.y) / this.worldScale + this.worldCenter.y;
	return new Vector(x, y);
};

Editor.prototype.undo = function() {
	this.doc.undoStack.undo();
	this.draw();
};

Editor.prototype.redo = function() {
	this.doc.undoStack.redo();
	this.draw();
};

Editor.prototype.save = function() {
	return saveWorldToJSON(this.doc.world);
};

Editor.prototype.deleteSeleciton = function() {
	var selection = this.doc.world.getSelection();
	this.doc.undoStack.beginMacro();
	for (var i = 0; i < selection.length; i++) {
		this.doc.removePlaceable(selection[i]);
	}
	this.doc.undoStack.endMacro();
	this.draw();
};

Editor.prototype.selectAll = function() {
	var selection = [];
	var placeables = this.doc.world.placeables;
	for (var i = 0; i < placeables.length; i++) {
		selection.push(placeables[i]);
	}
	this.doc.setSelection(selection);
	this.draw();
};

Editor.prototype.setSelectedEnemy = function(index) {
	this.selectedEnemy = index;
	this.setSidePanelTool();
};

Editor.prototype.setSelectedWall = function(index) {
	this.selectedWall = index;
	this.setSidePanelTool();
};


var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_CONTROL = 17;
var KEY_SHIFT = 16;
var KEY_META = 91;
var KEY_ALT = 18;

var overlayTimeout = null;

function overlay(text) {
	clearTimeout(overlayTimeout);
	overlayTimeout = setTimeout(function() {
		$('#overlay').fadeOut();
	}, 600);
	$('#overlay').html(text).show().stop().fadeTo(0, 1);
}

function getLevelLoadURL() {
	return '//' + location.host + '/data/' + username + '/' + levelname + '/';
}

function getLevelSaveURL() {
	return '//' + location.host + '/edit/' + levelname + '/';
}

function ajaxGetLevel(onSuccess) {
	function showError() {
		$('#loading').html('Could not load level from<br><b>' + getLevelURL() + '</b>');
	}

	$.ajax({
		'url': getLevelLoadURL(),
		'type': 'GET',
		'cache': false,
		'dataType': 'json',
		'success': function(data, status, request) {
			if (data != null) {
				onSuccess(JSON.parse(data['data']));
			} else {
				showError();
			}
		},
		'error': function(request, status, error) {
			showError();
		}
	});
}

function ajaxPutLevel(json, onSuccess) {
	function showError() {
		alert('Could not save level to\n' + getLevelURL());
	}

	overlay('Saving');
	$.ajax({
		'url': getLevelSaveURL(),
		'type': 'PUT',
    'beforeSend': function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
    },
		'dataType': 'json',
		'data': JSON.stringify({ 'level': { 'data': json } }),
		'contentType': 'application/json; charset=utf-8',
		'success': function(data, status, request) {
			overlay('Saved');
			if (onSuccess) onSuccess();
		},
		'error': function(request, status, error) {
			showError();
		}
	});
}

var idToModeMap = {
	'mode_empty': MODE_EMPTY,
	'mode_solid': MODE_SOLID,
	'mode_diagonal': MODE_DIAGONAL,
	'mode_start': MODE_START,
	'mode_goal': MODE_GOAL,
	'mode_cog': MODE_COG,
	'mode_sign': MODE_SIGN,
	'mode_select': MODE_SELECT,
	'mode_enemies': MODE_ENEMIES,
	'mode_walls_buttons': MODE_WALLS_BUTTONS,
	'mode_help': MODE_HELP,
	'mode_save_exit': MODE_SAVE_AND_EXIT
};

var editor = null;
var buttons = 0;

function resizeEditor() {
	var toolbarHeight = $('#toolbar').outerHeight();
	var sidebarWidth = 0;

	if (editor.mode == MODE_HELP) {
		$('#help').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#help').outerWidth();
	}

	if (editor.mode == MODE_ENEMIES) {
		$('#enemies').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#enemies').outerWidth();
	}

	if (editor.mode == MODE_WALLS_BUTTONS) {
		$('#walls').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#walls').outerWidth();
	}

	editor.resize($(window).width() - sidebarWidth, $(window).height() - toolbarHeight);
	editor.draw();
}

function showOrHidePanels(mode) {
	// Show or hide the help panel
	if (mode == MODE_HELP) {
		$('#help').show();
	} else {
		$('#help').hide();
	}

	// Show or hide the enemies panel
	if (mode == MODE_ENEMIES) {
		$('#enemies').show();
	} else {
		$('#enemies').hide();
	}

	// Show or hide the walls panel
	if (mode == MODE_WALLS_BUTTONS) {
		$('#walls').show();
	} else {
		$('#walls').hide();
	}

	resizeEditor();
}

function mousePoint(e) {
	var offset = $('#canvas').offset();
	return new Vector(e.pageX - offset.left, e.pageY - offset.top);
}

function fillHelp() {
	// Platform specific modifier keys
	var isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent); // $.browser.safari is broken
	var mac = (navigator.platform.indexOf('Mac') != -1);
	var ctrl = mac ? '^' : 'Ctrl+';
	var alt = mac ? '&#x2325;' : 'Alt+';
	var shift = mac ? '&#x21E7;' : 'Shift+';
	var meta = mac ? '&#x2318;' : 'Win+';
	var backspace = mac ? '&#x232B;' : 'Backspace';

	// Keyboard shortcuts
	var keys = [
		'Save', (mac ? meta : ctrl) + 'S',
		'Undo', (mac ? meta : ctrl) + 'Z',
		'Redo', mac ? shift + meta + 'Z' : ctrl + 'Y',
		'Select all', (mac ? meta : ctrl) + 'A',
		'Delete selection', backspace,
		'---', '---',
		'Pan camera', isSafari ? 'Middle-drag' : 'Right-drag', // Safari doesn't send mousemove messages when the right mouse button is pressed
		'Zoom camera', 'Scrollwheel',
		'Move selection', 'Left-drag',
		'---', '---',
		'Edit sign', 'Double-click'
	];

	// Generate keyboard shortcut html
	var gen = new SidebarGenerator();
	for (var i = 0; i < keys.length; i++) {
		gen.addCell(keys[i]);
	}
	$('#help').html(gen.getHTML() + '<hr>To change starting direction for Bombers, Jet Streams, Wall Crawlers, and ' +
		'Wheeligators, select them and drag the triangle (must be in "Select" mode).');
}

function fillEnemies() {
	var gen = new SidebarGenerator();

	// Create a <canvas> for each enemy
	var i;
	gen.addHeader('Color-neutral enemies');
	for (i = 0; i < editor.enemies.length; i++) {
		if (i == 10) gen.addHeader('Color-specific enemies');
		gen.addCell('<div class="cell" id="enemy' + i + '"><canvas id="enemy' + i + '-canvas" width="80" height="60"></canvas>' + editor.enemies[i].name + '</div>');
	}
	$('#enemies').html(gen.getHTML());
	$('#enemy' + editor.selectedEnemy).addClass('enemy-current');

	// Draw each enemy on its <canvas>
	for (i = 0; i < editor.enemies.length; i++) {
		var c = $('#enemy' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		c.fillStyle = c.strokeStyle = 'green';
		var sprite = editor.enemies[i].sprite;
		if (i == SPRITE_ROCKET_SPIDER) sprite = sprite.clone(new Vector(0, -0.2));
		sprite.draw(c);
	}

	// Add an action to each enemy button
	$('#enemies .cell').mousedown(function(e) {
		var selectedEnemy = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedEnemy(selectedEnemy);
		$('.enemy-current').removeClass('enemy-current');
		$(this).addClass('enemy-current');
		e.preventDefault();
	});
}

function fillWalls() {
	var gen = new SidebarGenerator();

	// Create a <canvas> for each wall type
	var i, c;
	gen.addHeader('Walls');
	gen.addInfo('Colored walls allow only the player of that color to pass through');
	for (i = 0; i < 6; i++) {
		var name = (i & 1) ? 'One-way' : 'Normal';
		gen.addCell('<div class="cell" id="wall' + i + '"><canvas id="wall' + i + '-canvas" width="80" height="60"></canvas>' + name + '</div>');
	}

	// Create a <canvas> for each button type
	gen.addHeader('Buttons');
	gen.addInfo('Buttons open and close linked doors');
	var buttons = [ 'Open', 'Close', 'Toggle', 'Link', 'Set Initially Open' ];
	for (i = 6; i < 9; i++) {
		gen.addCell('<div class="cell" id="button' + i + '"><canvas id="button' + i + '-canvas" width="80" height="60"></canvas>' + buttons.shift() + '</div>');
	}

	// Create a <canvas> for each door tool
	gen.addHeader('Doors');
	gen.addInfo('Create doors by linking walls and buttons');
	for (i = 9; i < 11; i++) {
		gen.addCell('<div class="cell" id="door' + i + '"><canvas id="door' + i + '-canvas" width="80" height="60"></canvas>' + buttons.shift() + '</div>');
	}

	$('#walls').html(gen.getHTML());
	$('#wall' + editor.selectedEnemy).addClass('wall-current');

	// Draw each wall on its <canvas>
	for (i = 0; i < 6; i++) {
		c = $('#wall' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		new Door(i & 1, false, Math.floor(i / 2), new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))).draw(c);
	}

	// Draw each button on its <canvas>
	for (i = 6; i < 9; i++) {
		c = $('#button' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		Sprites.drawButton(c, 1);
	}

	// Draw each button on its <canvas>
	for (i = 9; i < 11; i++) {
		c = $('#door' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		if (i == 9) {
			// Draw link
			c.strokeStyle = rgba(0, 0, 0, 0.5);
			dashedLine(c, new Vector(-0.3, 0.2), new Vector(0.3, 0));

			// Draw button
			c.translate(-0.3, 0.2);
			Sprites.drawButton(c, 1);
			c.translate(0.3, -0.2);

			// Draw door
			new Door(true, false, COLOR_NEUTRAL, new Edge(new Vector(0.7, 0.4), new Vector(-0.1, -0.4))).draw(c);
		} else {
			// Draw initially open door
			new Door(true, true, COLOR_NEUTRAL, new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))).draw(c);
		}
	}

	// Add an action to each wall button
	$('#walls .cell').mousedown(function(e) {
		var selectedWall = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedWall(selectedWall);
		$('.wall-current').removeClass('wall-current');
		$(this).addClass('wall-current');
		e.preventDefault();
	});
}

var signTextFocused = false;
var signTextCallback = null;

function showSignTextDialog(text, callback) {
	signTextCallback = callback;
	$('#sign-text-modal button').removeClass('sign-text-active');
	$('#sign-text-modal').show().animate({ top: 0 });
	$('#darken').fadeIn();
	$('#sign-text').val(text).focus().select();
}

function hideSignTextDialog() {
	$('#sign-text-modal').animate({ top: -115 }, function() {
		$('#sign-text-modal').hide();
	});
	$('#darken').fadeOut();
	return $('#sign-text').blur().val();
}

function changeSignText() {
	$('#sign-text-change').addClass('sign-text-active');
	var text = hideSignTextDialog();
	if (signTextCallback) signTextCallback(text);
}

function cancelSignText() {
	$('#sign-text-cancel').addClass('sign-text-active');
	hideSignTextDialog();
}

function loadEditor() {
	// Add an action to each toolbar button
	$('#toolbar .section a').mousedown(function(e) {
		var mode = idToModeMap[this.id];
		editor.setMode(mode);
		$('.toolbar-current').removeClass('toolbar-current');
		$(this).addClass('toolbar-current');
		e.preventDefault();
		showOrHidePanels(mode);
		if (mode == MODE_SAVE_AND_EXIT) {
			var cleanIndex = editor.doc.undoStack.getCurrentIndex();
			ajaxPutLevel(editor.save(), function() {
				editor.doc.undoStack.setCleanIndex(cleanIndex);

				// assuming we got here from our main site, press the browser's back button
				history.back();

				// if that doesn't work, then try to close the window
				window.close();
			});
		}
	});

	// Add actions to buttons on sign text dialog
	$('#sign-text-modal button').mousedown(function(e) {
		e.preventDefault();
	});
	$('#sign-text-change').mouseup(function(e) {
		changeSignText();
		e.preventDefault();
	});
	$('#sign-text-cancel').mouseup(function(e) {
		cancelSignText();
		e.preventDefault();
	});
	$('#sign-text').focus(function(e) {
		signTextFocused = true;
	});
	$('#sign-text').blur(function(e) {
		signTextFocused = false;
	});
	$('#sign-text').keydown(function(e) {
		if (e.which == KEY_ENTER) {
			changeSignText();
		} else if (e.which == KEY_ESCAPE) {
			cancelSignText();
		}
	});

	// Connect the canvas and the editor
	var canvas = $('#canvas')[0];
	editor = new Editor(canvas);
	resizeEditor();

	// Create HTML content for the sidebars
	fillEnemies();
	fillWalls();
	fillHelp();

	// Keep track of modifier key states
	var control = false;
	var shift = false;
	var meta = false;
	var alt = false;

	// Connect canvas events to editor events
	$(canvas).mousedown(function(e) {
		buttons |= (1 << e.which);
		editor.mouseDown(mousePoint(e), buttons, control | shift | meta | alt);
		e.preventDefault();
	});
	$(canvas).mousemove(function(e) {
		editor.mouseMoved(mousePoint(e), buttons);
		e.preventDefault();
	});
	$(canvas).mouseup(function(e) {
		buttons &= ~(1 << e.which);
		editor.mouseUp(mousePoint(e), buttons);
		e.preventDefault();
	});
	$(canvas).mousewheel(function(e, delta, deltaX, deltaY) {
		editor.mouseWheel(deltaX, deltaY);
		editor.mouseMoved(mousePoint(e));
		e.preventDefault();
	});
	$(canvas).mouseenter(function(e) {
		editor.mouseOver();
	});
	$(canvas).mouseleave(function(e) {
		editor.mouseOut();
	});
	$(canvas).dblclick(function(e) {
		buttons = 0;
		e.preventDefault();
		editor.doubleClick(mousePoint(e));
	});

	// Add handlers for window/document events
	$(window).resize(function() {
		resizeEditor();
	});
	$(document).bind('contextmenu', function(e) {
		e.preventDefault();
	});
	$(document).keydown(function(e) {
		if (e.which == KEY_CONTROL) control = true;
		else if (e.which == KEY_SHIFT) shift = true;
		else if (e.which == KEY_META) meta = true;
		else if (e.which == KEY_ALT) alt = true;
		else if (!signTextFocused) {
			if (e.ctrlKey || e.metaKey) {
				if (e.which == 'Z'.charCodeAt(0)) {
					if (e.shiftKey) editor.redo();
					else editor.undo();
					e.preventDefault();
				} else if (e.which == 'Y'.charCodeAt(0)) {
					editor.redo();
					e.preventDefault();
				} else if (e.which == 'S'.charCodeAt(0)) {
					e.preventDefault();
					var cleanIndex = editor.doc.undoStack.getCurrentIndex();
					ajaxPutLevel(editor.save(), function() {
						editor.doc.undoStack.setCleanIndex(cleanIndex);
					});
				} else if (e.which == 'A'.charCodeAt(0)) {
					editor.selectAll();
					e.preventDefault();
				}
			} else if (e.which == 8 /*BACKSPACE*/) {
				editor.deleteSeleciton();
				e.preventDefault();
			}
		}
	});
	$(document).keyup(function(e) {
		if (e.which == KEY_CONTROL) control = false;
		else if (e.which == KEY_SHIFT) shift = false;
		else if (e.which == KEY_META) meta = false;
		else if (e.which == KEY_ALT) alt = false;
	});

	// If user does something like alt-tab, we will get a keydown
	// but not a keyup, so reset the keyboard state in that case
	$(window).blur(function(e) {
		control = shift = meta = alt = false;
	});
	$(window).focusout(function(e) {
		control = shift = meta = alt = false;
	});

	$(window).bind('beforeunload', function() {
		if (!editor.doc.isClean()) {
			return 'Some of your edits are not saved, and will be lost if you close this window.  Continue?';
		}
	});
}

$(document).ready(function() {
	if (typeof username === "undefined") {
		loadEditor();
	} else {
		ajaxGetLevel(function(data) {
			loadEditor();
			editor.loadFromJSON(data);
		});
	}
});

////////////////////////////////////////////////////////////////////////////////
// class SidebarGenerator
////////////////////////////////////////////////////////////////////////////////

function SidebarGenerator() {
	this.inTable = false;
	this.numCells = 0;
	this.html = '';
}

SidebarGenerator.prototype.addCell = function(html) {
	this.setInTable(true);
	if (!(this.numCells & 1)) this.html += '<tr>';
	this.html += '<td>' + html.replace(/^---$/, '<hr>') + '</td>';
	if (this.numCells & 1) this.html += '</tr>';
	this.numCells++;
};

SidebarGenerator.prototype.addRow = function(html) {
	this.setInTable(true);
	this.html += '<tr><td colspan="2">' + html.replace(/^---$/, '<hr>') + '</td></tr>';
	this.numCells += 2;
};

SidebarGenerator.prototype.addHeader = function(html) {
	this.setInTable(false);
	this.html += '<div class="header">' + html + '</div>';
};

SidebarGenerator.prototype.addInfo = function(html) {
	this.setInTable(false);
	this.html += '<div class="info">' + html + '</div>';
};

SidebarGenerator.prototype.setInTable = function(inTable) {
	if (!this.inTable && inTable) {
		this.html += '<table>';
	} else if (this.inTable && !inTable) {
		this.html += '</table>';
		this.numCells = 0;
	}
	this.inTable = inTable;
};

SidebarGenerator.prototype.getHTML = function() {
	this.setInTable(false);
	return this.html;
};

////////////////////////////////////////////////////////////////////////////////
// class Sprites
////////////////////////////////////////////////////////////////////////////////

function Sprites() {
}

Sprites.drawSpawnPoint = function(c, alpha, point) {
	// Outer bubble
	c.strokeStyle = c.fillStyle = rgba(255, 255, 255, alpha * 0.1);
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	// Glow from base
	var gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, rgba(255, 255, 255, alpha * 0.75));
	gradient.addColorStop(1, rgba(255, 255, 255, 0));
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	// Black base
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(point.x - 0.1, point.y - 0.45);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.45);
	c.arc(point.x, point.y - 0.45, 0.2, 0, Math.PI, true);
	c.fill();
};

Sprites.drawGoal = function(c, alpha, point, time) {
	var percent = time - Math.floor(time);
	percent = 1 - percent;
	percent = (percent - Math.pow(percent, 6)) * 1.72;
	percent = 1 - percent;

	// Draw four arrows pointing inwards
	c.fillStyle = rgba(0, 0, 0, alpha);
	for (var i = 0; i < 4; ++i) {
		var angle = i * (2 * Math.PI / 4);
		var s = Math.sin(angle);
		var csn = Math.cos(angle);
		var radius = 0.45 - percent * 0.25;
		var size = 0.15;
		c.beginPath();
		c.moveTo(point.x + csn * radius - s * size, point.y + s * radius + csn * size);
		c.lineTo(point.x + csn * radius + s * size, point.y + s * radius - csn * size);
		c.lineTo(point.x + csn * (radius - size), point.y + s * (radius - size));
		c.fill();
	}
};

Sprites.drawCog = function(c, alpha, radius) {
	var innerRadius = radius * 0.2;
	var spokeRadius = radius * 0.8;
	var spokeWidth1 = radius * 0.2;
	var spokeWidth2 = radius * 0.075;
	var numVertices = 64;
	var numTeeth = 10;
	var numSpokes = 5;
	var i, angle, sin, cos, r;
	
	c.fillStyle = rgba(255, 255, 0, alpha);
	
	// Draw the outer rim with teeth
	c.beginPath();
	for (i = 0; i <= numVertices; i++) {
		angle = (i + 0.25) / numVertices * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		r = radius * (1 + Math.cos(angle * numTeeth) * 0.1);
		c.lineTo(cos * r, sin * r);
	}
	c.closePath();
	
	// Draw the inner rim
	c.arc(0, 0, radius * 0.65, 0, Math.PI * 2, true);
	c.closePath();
	
	// Draw the spokes
	for (i = 0; i < numSpokes; i++) {
		angle = i / numSpokes * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		c.moveTo(sin * spokeWidth1, -cos * spokeWidth1);
		c.lineTo(cos * spokeRadius + sin * spokeWidth2, sin * spokeRadius - cos * spokeWidth2);
		c.lineTo(cos * spokeRadius - sin * spokeWidth2, sin * spokeRadius + cos * spokeWidth2);
		c.lineTo(-sin * spokeWidth1, cos * spokeWidth1);
		c.closePath();
	}
	c.fill();
};

Sprites.drawBomber = function(c, alpha, reloadPercentage) {
	var bomberHeight = 0.4;
	var bombRadius = 0.15;
	
	c.save();
	c.translate(0, 0.05);
	
	// Bomber body
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-0.25, -0.2);
	c.lineTo(-0.25, -0.1);
	c.lineTo(-0.1, 0.05);
	c.lineTo(0.1, 0.05);
	c.lineTo(0.25, -0.1);
	c.lineTo(0.25, -0.2);
	c.arc(0, -bomberHeight * 0.5, bombRadius, 0, Math.PI, false);
	c.lineTo(-0.25, -0.2);
	c.moveTo(-0.1, 0.05);
	c.lineTo(-0.2, 0.15);
	c.moveTo(0.1, 0.05);
	c.lineTo(0.2, 0.15);
	c.stroke();

	// Growing bomb about to be dropped
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, -bomberHeight * 0.5, bombRadius * reloadPercentage, 0, 2 * Math.PI, false);
	c.fill();
	
	c.restore();
};

Sprites.drawBouncyRocketLauncher = function(c, alpha, redIsFirst) {
   // End of gun
	var v = Math.sqrt(0.2*0.2 - 0.1*0.1);
	c.strokeStyle = rgba(0, 0, 0, alpha);
   c.beginPath();
   c.moveTo(-v, -0.1);
   c.lineTo(-0.3, -0.1);
   c.lineTo(-0.3, 0.1);
   c.lineTo(-v, 0.1);
   c.stroke();

   // Main body
   c.fillStyle = rgba(255 * redIsFirst, 0, 255 * !redIsFirst, alpha);
   c.beginPath();
   c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, true);
   c.fill();
   c.fillStyle = rgba(255 * !redIsFirst, 0, 255 * redIsFirst, alpha);
   c.beginPath();
   c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, false);
   c.fill();

	// Line circling the two colors
   c.beginPath();
   c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
   c.stroke();

	// Line separating the two colors
   c.beginPath();
   c.moveTo(Math.cos(1.65 * Math.PI) * 0.2, Math.sin(1.65 * Math.PI) * 0.2);
   c.lineTo(Math.cos(2.35 * Math.PI) * 0.2, Math.sin(2.35 * Math.PI) * 0.2);
   c.stroke();
};

Sprites.drawDoomMagnet = function(c, alpha) {
	var length = 0.15;
	var outerRadius = 0.15;
	var innerRadius = 0.05;

	for (var scale = -1; scale <= 1; scale += 2) {
		// Draw red tips
	   c.fillStyle = rgba(0, 0, 255, alpha);
		c.beginPath();
		c.moveTo(-outerRadius - length, scale * innerRadius);
		c.lineTo(-outerRadius - length, scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * innerRadius);
		c.fill();

		// Draw blue tips
	   c.fillStyle = rgba(255, 0, 0, alpha);
		c.beginPath();
		c.moveTo(outerRadius + length, scale * innerRadius);
		c.lineTo(outerRadius + length, scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * innerRadius);
		c.fill();
	}
	c.strokeStyle = rgba(0, 0, 0, alpha);

	// Draw one prong of the magnet
	c.beginPath();
	c.arc(outerRadius, 0, outerRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
	c.lineTo(outerRadius + length, outerRadius);
	c.lineTo(outerRadius + length, innerRadius);

	c.arc(outerRadius, 0, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI, false);
	c.lineTo(outerRadius + length, -innerRadius);
	c.lineTo(outerRadius + length, -outerRadius);
	c.lineTo(outerRadius, -outerRadius);
	c.stroke();

	// Draw other prong
	c.beginPath();
	c.arc(-outerRadius, 0, outerRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
	c.lineTo(-outerRadius - length, outerRadius);
	c.lineTo(-outerRadius - length, innerRadius);

	c.arc(-outerRadius, 0, innerRadius, 2.5 * Math.PI, 1.5 * Math.PI, true);
	c.lineTo(-outerRadius - length, -innerRadius);
	c.lineTo(-outerRadius - length, -outerRadius);
	c.lineTo(-outerRadius, -outerRadius);
	c.stroke();
};

Sprites.drawGrenadier = function(c, alpha, isRed) {
	var barrelLength = 0.25;
	var outerRadius = 0.25;
	var innerRadius = 0.175;

	// Draw a 'V' shape
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-outerRadius, -barrelLength);
	c.lineTo(-innerRadius, -barrelLength);
	c.lineTo(-innerRadius, -0.02);
	c.lineTo(0, innerRadius);
	c.lineTo(innerRadius, -0.02);
	c.lineTo(innerRadius, -barrelLength);
	c.lineTo(outerRadius, -barrelLength);
	c.lineTo(outerRadius, 0);
	c.lineTo(0, outerRadius + 0.02);
	c.lineTo(-outerRadius, 0);
	c.closePath();
	c.fill();
	c.stroke();
};

Sprites.drawHunter = function(c, alpha) {
	function drawClaw(c) {
		c.beginPath();
		c.moveTo(0, 0.1);
		for(var i = 0; i <= 6; i++) {
			c.lineTo((i & 1) / 24, 0.2 + i * 0.05);
		}
		c.arc(0, 0.2, 0.3, 0.5*Math.PI, -0.5*Math.PI, true);
		c.stroke();
	}
	
	// Draw the eye
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, -0.2, 0.1, 0, 2*Math.PI, false);
	c.stroke();
	
	// Draw the claws
	var clawAngle = 0.1;
	c.save();
	c.translate(0, -0.2);
	c.rotate(-clawAngle);
	drawClaw(c);
	c.rotate(2 * clawAngle);
	c.scale(-1, 1);
	drawClaw(c);
	c.restore();
};

function drawLeg(c, x, y, angle1, angle2, legLength) {
	angle1 *= Math.PI / 180;
	angle2 = angle1 + angle2 * Math.PI / 180;
	var kneeX = x + Math.sin(angle1) * legLength;
	var kneeY = y - Math.cos(angle1) * legLength;
	
	// Draw leg with one joint
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(kneeX, kneeY);
	c.lineTo(kneeX + Math.sin(angle2) * legLength, kneeY - Math.cos(angle2) * legLength);
	c.stroke();
}

Sprites.drawPopper = function(c, alpha) {
	function drawBody(c, x, y) {
		c.save();
		c.translate(x, y);
		
		// Draw shell
		c.beginPath();
		c.moveTo(0.2, -0.2);
		c.lineTo(-0.2, -0.2);
		c.lineTo(-0.3, 0);
		c.lineTo(-0.2, 0.2);
		c.lineTo(0.2, 0.2);
		c.lineTo(0.3, 0);
		c.lineTo(0.2, -0.2);
		c.moveTo(0.15, -0.15);
		c.lineTo(-0.15, -0.15);
		c.lineTo(-0.23, 0);
		c.lineTo(-0.15, 0.15);
		c.lineTo(0.15, 0.15);
		c.lineTo(0.23, 0);
		c.lineTo(0.15, -0.15);
		c.stroke();

		// Draw eyes
		c.beginPath();
		c.arc(-0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.arc(0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.fill();
		
		c.restore();
	}
	
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	drawBody(c, 0, 0.1);
	drawLeg(c, -0.2, -0.1, -80, 100, 0.3);
	drawLeg(c, -0.1, -0.1, -80, 100, 0.3);
	drawLeg(c, 0.1, -0.1, 80, -100, 0.3);
	drawLeg(c, 0.2, -0.1, 80, -100, 0.3);
};

var cloudCircles = [];
for (var i = 0; i < 50; i++) {
	var angle = randInRange(0, Math.PI * 2);
	var radius = Math.sqrt(Math.random()) * 0.4;
	cloudCircles.push({
		centerX: Math.cos(angle) * radius,
		centerY: Math.sin(angle) * radius,
		radius: randInRange(0.05, 0.15),
		alpha: randInRange(0.1, 0.5)
	});
}

Sprites.drawCloud = function(c, alpha, isRed) {
	// Draw particles
	for (var i = 0; i < 50; i++) {
		c.fillStyle = rgba(127 * isRed, 0, 127 * !isRed, alpha * cloudCircles[i].alpha);
		c.beginPath();
		c.arc(cloudCircles[i].centerX, cloudCircles[i].centerY, cloudCircles[i].radius, 0, Math.PI * 2, false);
		c.fill();
	}
};

Sprites.drawShockHawk = function(c, alpha, isRed) {
	// Draw solid center
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.beginPath();
	c.moveTo(0, -0.15);
	c.lineTo(0.05, -0.1);
	c.lineTo(0, 0.1);
	c.lineTo(-0.05, -0.1);
	c.fill();

	// Draw outlines
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (var scale = -1; scale <= 1; scale += 2) {
		c.moveTo(0, -0.3);
		c.lineTo(scale * 0.05, -0.2);
		c.lineTo(scale * 0.1, -0.225);
		c.lineTo(scale * 0.1, -0.275);
		c.lineTo(scale * 0.15, -0.175);
		c.lineTo(0, 0.3);

		c.moveTo(0, -0.15);
		c.lineTo(scale * 0.05, -0.1);
		c.lineTo(0, 0.1);
	}
	c.stroke();
};

Sprites.drawStalacbat = function(c, alpha, isRed) {
	function drawWing(c) {
		var r = Math.sin(Math.PI / 4);
		c.beginPath();
		c.arc(0, 0, 0.2, 0, Math.PI / 2, false);
		c.arc(0, 0, 0.15, Math.PI / 2, 0, true);
		c.closePath();
		c.moveTo(r * 0.15, r * 0.15);
		c.lineTo(r * 0.1, r * 0.1);
		c.stroke();
	}
	
	// Draw body
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, Math.PI * 2 , false);
	c.fill();
	c.stroke();

	// Draw wings
	var wingAngle = Math.PI / 2;
	c.save();
	c.rotate(-wingAngle);
	drawWing(c);
	c.rotate(2 * wingAngle);
	c.scale(-1, 1);
	drawWing(c);
	c.restore();
};

Sprites.drawWallAvoider = function(c, alpha, isRed) {
	// Draw body
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();
	
	// Draw antennae
	c.beginPath();
	for (var i = 0; i < 4; i++)
	{
		var angle = i * (2 * Math.PI / 4);
		var cos = Math.cos(angle), sin = Math.sin(angle);
		c.moveTo(cos * 0.1, sin * 0.1);
		c.lineTo(cos * 0.3, sin * 0.3);
		c.moveTo(cos * 0.16 - sin * 0.1, sin * 0.16 + cos * 0.1);
		c.lineTo(cos * 0.16 + sin * 0.1, sin * 0.16 - cos * 0.1);
		c.moveTo(cos * 0.23 - sin * 0.05, sin * 0.23 + cos * 0.05);
		c.lineTo(cos * 0.23 + sin * 0.05, sin * 0.23 - cos * 0.05);
	}
	c.stroke();
};

Sprites.drawWallCrawler = function(c, alpha) {
	// Draw arms
	var space = 0.15;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.25 + space, Math.PI * 0.75 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.75 + space, Math.PI * 1.25 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.25 + space, Math.PI * 1.75 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.75 + space, Math.PI * 2.25 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.15, 0, 2 * Math.PI, false); c.stroke();
	c.beginPath();
	c.moveTo(0.15, 0); c.lineTo(0.25, 0);
	c.moveTo(0, 0.15); c.lineTo(0, 0.25);
	c.moveTo(-0.15, 0); c.lineTo(-0.25, 0);
	c.moveTo(0, -0.15); c.lineTo(0, -0.25);
	c.stroke();
	
	// Draw bodt
	c.beginPath();
	c.arc(0, 0, 0.05, 0, 2 * Math.PI, false);
	c.fill();
};

Sprites.drawWheeligator = function(c, alpha) {
	// Draw wheel
	var radius = 0.3;
	var rim = 0.1;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, radius, 0, 2 * Math.PI, false);
	c.arc(0, 0, radius - rim, Math.PI, 3 * Math.PI, false);
	c.stroke();

	// Fill in notches on wheel
	for (var i = 0; i < 4; i++) {
		var startAngle = i * (2 * Math.PI / 4);
		var endAngle = startAngle + Math.PI / 4;
		c.beginPath();
		c.arc(0, 0, radius, startAngle, endAngle, false);
		c.arc(0, 0, radius - rim, endAngle, startAngle, true);
		c.fill();
	}
};

function makeDrawSpikes(count) {
	var spikeBallRadius = 0.2;
	var radii = [];
	for (var i = 0; i < count; i++) {
		radii.push(spikeBallRadius * randInRange(0.5, 1.5));
	}
	return function(c) {
		c.beginPath();
		for (var i = 0; i < count; i++) {
			var angle = i * (2 * Math.PI / count);
			var radius = radii[i];
			c.moveTo(0, 0);
			c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
		}
		c.stroke();
	};
}

var spikeDrawFuncs = [
	makeDrawSpikes(11),
	makeDrawSpikes(13),
	makeDrawSpikes(7)
];

Sprites.drawSpikeBall = function(c, alpha) {
	c.strokeStyle = rgba(0, 0, 0, alpha);
	spikeDrawFuncs[0](c);
	spikeDrawFuncs[1](c);
	spikeDrawFuncs[2](c);
};

Sprites.drawRiotGun = function(c, alpha, reloadAnimation, directionAngle) {
	function drawWheel() {
		var numBarrels = 3;
		c.beginPath();
		for (var i = 0; i < numBarrels; i++) {
			var angle = i * (2 * Math.PI / numBarrels);
			c.moveTo(0, 0);
			c.lineTo(0.2 * Math.cos(angle), 0.2 * Math.sin(angle));
		}
		c.stroke();
	}
	
	var numBarrels = 3;
	var angle = reloadAnimation * (2 * Math.PI / numBarrels);
	var targetAngle = directionAngle - Math.PI / 2;
	var bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);
	
	c.fillStyle = rgba(255, 255, 0, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	
	c.save();
	c.translate(-0.2, 0);
	c.rotate(targetAngle + angle);
	drawWheel();
	c.restore();
	
	c.save();
	c.translate(0.2, 0);
	c.rotate(targetAngle - angle);
	drawWheel();
	c.restore();
	
	for (var side = -1; side <= 1; side += 2)
	{
		for (var i = 0; i < numBarrels; i++)
		{
			var theta = i * (2 * Math.PI / numBarrels) - side * angle;
			var reload = (reloadAnimation - i * side) / numBarrels + (side == 1) * 0.5;
			var pos = bodyOffset.mul(side).add(bodyOffset.rotate(theta));
			reload -= Math.floor(reload);
			c.beginPath();
			c.arc(pos.x, pos.y, 0.1 * reload, 0, 2 * Math.PI, false);
			c.fill();
			c.stroke();
		}
	}
};

Sprites.drawMultiGun = function(c, alpha) {
	var w = 0.25;
	var h = 0.25;
	var r = 0.1;

	c.strokeStyle = rgba(0, 0, 0, alpha);
	for (var a = -1; a <= 1; a += 2) {
		for (var b = -1; b <= 1; b += 2) {
			// Draw edge
			c.beginPath();
			c.moveTo(-w, h * a + r * b);
			c.lineTo(w, h * a + r * b);
			c.moveTo(w * a + r * b, -h);
			c.lineTo(w * a + r * b, h);
			c.stroke();
			
			// Draw gun
			c.beginPath();
			c.arc(w * a, h * b, r, 0, Math.PI * 2, false);
			c.stroke();
		}
	}
};

Sprites.drawSpider = function(c, alpha) {
	c.save();
	c.translate(0, 0.51);
	
	// Draw body
	var i, radius, angle;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (i = 0; i <= 21; i++)
	{
		angle = (0.25 + 0.5 * i / 21) * Math.PI;
		radius = 0.6 + 0.05 * (i & 2);
		c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius - 0.5);
	}
	c.arc(0, -0.5, 0.5, Math.PI * 0.75, Math.PI * 0.25, true);
	c.fill();
	
	// Draw legs
	var w = 0.9;
	drawLeg(c, w * 0.35, 0, -10, 70, 0.5);
	drawLeg(c, w * 0.15, 0, 10, 20, 0.5);
	drawLeg(c, w * -0.05, 0, -10, 20, 0.5);
	drawLeg(c, w * -0.25, 0, -20, 10, 0.5);
	drawLeg(c, w * 0.25, 0, -10, 20, 0.5);
	drawLeg(c, w * 0.05, 0, -20, 10, 0.5);
	drawLeg(c, w * -0.15, 0, -10, 70, 0.5);
	drawLeg(c, w * -0.35, 0, 10, 20, 0.5);
	
	c.restore();
};

Sprites.drawButton = function(c, alpha) {
	var buttonSlices = 3;
	var buttonRadius = 0.11;
	
   c.fillStyle = rgba(255, 255, 255, alpha);
   c.strokeStyle = rgba(0, 0, 0, alpha);
   c.beginPath();
   c.arc(0, 0, buttonRadius, 0, 2 * Math.PI, false);
   c.fill();
   c.stroke();

   c.beginPath();
   for (var i = 0; i < buttonSlices; i++) {
       c.moveTo(0, 0);
       var nextPos = Vector.fromAngle(i * (2 * Math.PI / buttonSlices)).mul(buttonRadius);
       c.lineTo(nextPos.x, nextPos.y);
   }
   c.stroke();
};

var headachePoints = [];
for (var i = 0; i < 50; i++) {
	var angle = randInRange(0, Math.PI * 2);
	var radius = Math.sqrt(Math.random()) * 0.3;
	headachePoints.push({
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius
	});
}

Sprites.drawHeadache = function(c, alpha, isRed) {
	var headacheRadius = 0.15 * 0.75;
	
	// draw the ache
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (var i = 0; i < headachePoints.length; i++) {
		var p = headachePoints[i];
		c.lineTo(p.x, p.y);
	}
	c.stroke();
	
	// draw the head
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.beginPath();
	c.arc(0, 0, headacheRadius, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();
};

Sprites.drawSign = function(c, alpha, text) {
	c.save();
	c.textAlign = "center";
	c.scale(1 / 50, -1 / 50);
	c.lineWidth *= 50;
	
	c.save();
	c.font = "bold 34px sans-serif";
	c.fillStyle = "yellow";
	c.strokeStyle = "black";
	c.translate(0, 12);
	c.fillText('?', 0, 0);
	c.strokeText('?', 0, 0);
	c.restore();
	
	var textArray = splitUpText(c, text);
	var fontSize = 13;
	var xCenter = 0;
	var yCenter = -0.5 * 50 - (fontSize + 2) * textArray.length / 2;
	drawTextBox(c, textArray, xCenter, yCenter, fontSize);
	
	c.restore();
};

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

var BUTTON_OPEN = 0;
var BUTTON_CLOSE = 1;
var BUTTON_TOGGLE = 2;

////////////////////////////////////////////////////////////////////////////////
// class Button
////////////////////////////////////////////////////////////////////////////////

function Button(anchor, type) {
	this.anchor = anchor;
	this.type = type;
}

Button.prototype.draw = function(c, alpha) {
	var text = ['Open', 'Close', 'Toggle'][this.type];
	c.save();
	c.translate(this.anchor.x, this.anchor.y);
	Sprites.drawButton(c, alpha || 1);
	c.fillStyle = rgba(0, 0, 0, alpha || 1);
	c.scale(1 / 150, -1 / 150);
	c.font = '15px "Lucida Grande", Helvetica, Arial, sans-serif';
	c.fillText(text, -c.measureText(text).width / 2, 35);
	c.restore();
};

Button.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.anchor.x, this.anchor.y, 0.3, 0, Math.PI * 2, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Button.prototype.touchesRect = function(rect) {
	return new Circle(this.anchor, 0.11).intersectsRect(rect);
};

Button.prototype.getAnchor = function() {
	return this.anchor;
};

Button.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
};

Button.prototype.resetAnchor = function() {
};

Button.prototype.clone = function(newAnchor) {
	return new Button(newAnchor, this.type);
};

Button.prototype.getCenter = function() {
	return this.anchor;
};

Button.prototype.getAngle = function() {
	return 0;
};

Button.prototype.setAngle = function(newAngle) {
};

///////////////////////////////////////////////////////////////////////////////
// class Door
////////////////////////////////////////////////////////////////////////////////

function Door(isOneWay, isInitiallyOpen, color, edge) {
	this.isOneWay = isOneWay;
	this.isInitiallyOpen = isInitiallyOpen;
	this.edge = edge;
	this.color = color;
	this.selected = false;
	this.resetAnchor();
	this.offsetToStart = edge.start.sub(this.anchor);
	this.offsetToEnd = edge.end.sub(this.anchor);
}

Door.prototype.draw = function(c, alpha) {
	c.strokeStyle = rgba(255 * (this.color == COLOR_RED), 0, 255 * (this.color == COLOR_BLUE), alpha || 1);
	if (this.isInitiallyOpen) {
		this.edge.drawOpen(c);
		if (!this.isOneWay) {
			this.edge.flip();
			this.edge.drawOpen(c);
			this.edge.flip();
		}
	} else {
		this.edge.draw(c);
		if (!this.isOneWay) {
			this.edge.flip();
			this.edge.draw(c);
			this.edge.flip();
		}
	}
};

Door.prototype.drawSelection = function(c) {
	var radius = 0.2;
	var angle = this.edge.end.sub(this.edge.start).atan2() + Math.PI / 2;
	c.beginPath();
	c.arc(this.edge.start.x, this.edge.start.y, radius, angle, angle + Math.PI, false);
	c.arc(this.edge.end.x, this.edge.end.y, radius, angle + Math.PI, angle, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Door.prototype.touchesRect = function(rect) {
	// Test if the bounding boxes intersect and the box actually lies across the line
	return (rect.intersectsRect(new Rectangle(this.edge.start, this.edge.end))
		&& rect.intersectsEdge(this.edge));
};

Door.prototype.getAnchor = function() {
	return this.anchor;
};

Door.prototype.setAnchor = function(anchor) {
	var floorAnchor = new Vector(Math.floor(anchor.x + 0.5), Math.floor(anchor.y + 0.5));
	this.anchor = anchor;
	this.edge.start = floorAnchor.add(this.offsetToStart);
	this.edge.end = floorAnchor.add(this.offsetToEnd);
};

Door.prototype.resetAnchor = function() {
	this.anchor = new Vector(Math.min(this.edge.start.x, this.edge.end.x), Math.min(this.edge.start.y, this.edge.end.y));
};

Door.prototype.getCenter = function() {
	return this.edge.start.add(this.edge.end).div(2);
};

Door.prototype.getAngle = function() {
	return 0;
};

Door.prototype.setAngle = function(newAngle) {
};

////////////////////////////////////////////////////////////////////////////////
// class Link
////////////////////////////////////////////////////////////////////////////////

function Link(button, door) {
	this.button = button;
	this.door = door;
}

Link.prototype.draw = function(c, alpha) {
	c.strokeStyle = rgba(0, 0, 0, 0.5);
	dashedLine(c, this.button.getCenter(), this.door.getCenter());
};

Link.prototype.drawSelection = function(c) {
	var start = this.button.getCenter();
	var end = this.door.getCenter();
	var radius = 0.2;
	var angle = end.sub(start).atan2() + Math.PI / 2;
	c.beginPath();
	c.arc(start.x, start.y, radius, angle, angle + Math.PI, false);
	c.arc(end.x, end.y, radius, angle + Math.PI, angle, false);
	c.closePath();
	c.fill();
	c.stroke();
};

Link.prototype.touchesRect = function(rect) {
	// Test if the bounding boxes intersect and the box actually lies across the line
	var start = this.button.getCenter();
	var end = this.door.getCenter();
	return (rect.intersectsRect(new Rectangle(start, end)) && rect.intersectsEdge(new Edge(start, end)));
};

Link.prototype.getAnchor = function() {
	return new Vector(0, 0);
};

Link.prototype.setAnchor = function(anchor) {
};

Link.prototype.resetAnchor = function() {
};

Link.prototype.getAngle = function() {
	return 0;
};

Link.prototype.setAngle = function(newAngle) {
};

var SPRITE_BOMBER = 0;
var SPRITE_DOOM_MAGNET = 1;
var SPRITE_HUNTER = 2;
var SPRITE_MULTI_GUN = 3;
var SPRITE_POPPER = 4;
var SPRITE_JET_STREAM = 5;
var SPRITE_ROCKET_SPIDER = 6;
var SPRITE_SPIKE_BALL = 7;
var SPRITE_WALL_CRAWLER = 8;
var SPRITE_WHEELIGATOR = 9;
var SPRITE_BOUNCY_ROCKET_LAUNCHER = 10;
var SPRITE_CORROSION_CLOUD = 11;
var SPRITE_GRENADIER = 12;
var SPRITE_HEADACHE = 13;
var SPRITE_SHOCK_HAWK = 14;
var SPRITE_STALACBAT = 15;
var SPRITE_WALL_AVOIDER = 16;
var SPRITE_COG = 17;
var SPRITE_SIGN = 18;

function Sprite(id, radius, drawFunc, anchor, color, angle) {
	this.id = id;
	this.radius = radius;
	this.drawFunc = drawFunc;
	this.anchor = anchor || new Vector(0, 0);
	this.color = color || 0;
	this.angle = angle || 0;
	this.text = '';
	this.textRect = null;
}

Sprite.prototype.getAnglePolygon = function() {
	var direction = Vector.fromAngle(this.angle);
	return new Polygon(
		this.anchor.add(direction.mul(this.radius + 0.4)),
		this.anchor.add(direction.mul(this.radius + 0.2).add(direction.flip().mul(0.2))),
		this.anchor.add(direction.mul(this.radius + 0.2).sub(direction.flip().mul(0.2)))
	);
};

Sprite.prototype.hasAnglePolygon = function() {
	return (this.id == SPRITE_JET_STREAM || this.id == SPRITE_WALL_CRAWLER || this.id == SPRITE_WHEELIGATOR || this.id == SPRITE_BOMBER);
};

Sprite.prototype.draw = function(c, alpha) {
	c.save();
	this.calcTextRect(c);
	c.translate(this.anchor.x, this.anchor.y);
	this.drawFunc(c, alpha || 1, this.color, this.angle);
	c.restore();
};

Sprite.prototype.calcTextRect = function(c) {
	var textArray = splitUpText(c, this.text);
	var textSize = 13;
	var center = new Vector(0, 0.5 * 50 + (textSize + 2) * textArray.length / 2);
	var numLines = textArray.length;
	c.font = textSize + 'px Arial, sans-serif';
	var lineHeight = textSize + 2;
	var textHeight = lineHeight * numLines;
	var textWidth = -1;
	for (var i = 0; i < numLines; ++i) {
		var currWidth = c.measureText(textArray[i]).width;
		if (textWidth < currWidth) {
			textWidth = currWidth;
		}
	}
	this.textRect = new Rectangle(center, center).expand(textWidth / 2 + TEXT_BOX_X_MARGIN, textHeight / 2 + TEXT_BOX_Y_MARGIN);
	this.textRect.min = this.textRect.min.div(50).add(this.anchor);
	this.textRect.max = this.textRect.max.div(50).add(this.anchor);
}

Sprite.prototype.drawSelection = function(c) {
	c.beginPath();
	c.arc(this.anchor.x, this.anchor.y, this.radius + 0.1, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();
	
	if (this.hasAnglePolygon()) {
		this.getAnglePolygon().draw(c);
	}
	
	if (this.id == SPRITE_SIGN) {
		this.calcTextRect(c);
		var rect = this.textRect.expand(0.1, 0.1);
		var x = rect.min.x;
		var y = rect.min.y;
		var w = rect.max.x - rect.min.x;
		var h = rect.max.y - rect.min.y;
		c.fillRect(x, y, w, h);
		c.strokeRect(x, y, w, h);
	}
};

Sprite.prototype.touchesRect = function(rect) {
	return new Circle(this.anchor, this.radius).intersectsRect(rect) || (this.textRect !== null && this.textRect.intersectsRect(rect));
};

Sprite.prototype.getAnchor = function() {
	return this.anchor;
};

Sprite.prototype.setAnchor = function(anchor) {
	this.anchor = anchor;
};

Sprite.prototype.resetAnchor = function() {
};

Sprite.prototype.clone = function(newAnchor, newColor, newAngle) {
	return new Sprite(this.id, this.radius, this.drawFunc, newAnchor, newColor, newAngle);
};

Sprite.prototype.getCenter = function() {
	return this.anchor;
};

Sprite.prototype.getAngle = function() {
	return this.angle;
};

Sprite.prototype.setAngle = function(newAngle) {
	this.angle = newAngle;
};

var spriteTemplates = [
	// color-neutral enemies
	{ name: 'Bomber', sprite: new Sprite(SPRITE_BOMBER, 0.3, function(c, alpha) { Sprites.drawBomber(c, alpha, 0.7); }) },
	{ name: 'Doom Magnet', sprite: new Sprite(SPRITE_DOOM_MAGNET, 0.35, function(c, alpha) { Sprites.drawDoomMagnet(c, alpha); }) },
	{ name: 'Hunter', sprite: new Sprite(SPRITE_HUNTER, 0.3, function(c, alpha) { Sprites.drawHunter(c, alpha); }) },
	{ name: 'Multi-Gun', sprite: new Sprite(SPRITE_MULTI_GUN, 0.45, function(c, alpha) { Sprites.drawMultiGun(c, alpha); }) },
	{ name: 'Popper', sprite: new Sprite(SPRITE_POPPER, 0.5, function(c, alpha) { Sprites.drawPopper(c, alpha); }) },
	{ name: 'Jet Stream', sprite: new Sprite(SPRITE_JET_STREAM, 0.45, function(c, alpha, color, angle) { c.rotate(angle - Math.PI / 2); Sprites.drawRiotGun(c, alpha, 0.75, Math.PI / 2); }) },
	{ name: 'Rocket Spider', sprite: new Sprite(SPRITE_ROCKET_SPIDER, 0.5, function(c, alpha) { Sprites.drawSpider(c, alpha); }) },
	{ name: 'Spike Ball', sprite: new Sprite(SPRITE_SPIKE_BALL, 0.3, function(c, alpha) { Sprites.drawSpikeBall(c, alpha); }) },
	{ name: 'Wall Crawler', sprite: new Sprite(SPRITE_WALL_CRAWLER, 0.25, function(c, alpha) { Sprites.drawWallCrawler(c, alpha); }) },
	{ name: 'Wheeligator', sprite: new Sprite(SPRITE_WHEELIGATOR, 0.3, function(c, alpha) { Sprites.drawWheeligator(c, alpha); }) },
	
	// color-specific enemies
	{ name: 'Bouncy Rockets', sprite: new Sprite(SPRITE_BOUNCY_ROCKET_LAUNCHER, 0.3, function(c, alpha, color) { Sprites.drawBouncyRocketLauncher(c, alpha, color == 1); }) },
	{ name: 'Corrosion Cloud', sprite: new Sprite(SPRITE_CORROSION_CLOUD, 0.5, function(c, alpha, color) { Sprites.drawCloud(c, alpha, color == 1); }) },
	{ name: 'Grenadier', sprite: new Sprite(SPRITE_GRENADIER, 0.35, function(c, alpha, color) { Sprites.drawGrenadier(c, alpha, color == 1); }) },
	{ name: 'Headache', sprite: new Sprite(SPRITE_HEADACHE, 0.5, function(c, alpha, color) { Sprites.drawHeadache(c, alpha, color == 1); }) },
	{ name: 'Shock Hawk', sprite: new Sprite(SPRITE_SHOCK_HAWK, 0.3, function(c, alpha, color) { Sprites.drawShockHawk(c, alpha, color == 1); }) },
	{ name: 'Stalacbat', sprite: new Sprite(SPRITE_STALACBAT, 0.2, function(c, alpha, color) { Sprites.drawStalacbat(c, alpha, color == 1); }) },
	{ name: 'Wall Avoider', sprite: new Sprite(SPRITE_WALL_AVOIDER, 0.3, function(c, alpha, color) { Sprites.drawWallAvoider(c, alpha, color == 1); }) },
	
	// game objects
	{ name: 'Cog', sprite: new Sprite(SPRITE_COG, 0.25, function(c, alpha) { Sprites.drawCog(c, alpha, 0.25); }) },
	{ name: 'Sign', sprite: new Sprite(SPRITE_SIGN, 0.25, function(c, alpha) { Sprites.drawSign(c, alpha, this.text); }) }
];


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

var COLOR_NEUTRAL = 0;
var COLOR_RED = 1;
var COLOR_BLUE = 2;

// Need to use toFixed() so the negative exponent doesn't show up for small numbers
function rgba(r, g, b, a) {
	return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(5) + ')';
}

function randInRange(min, max) {
	return min + (max - min) * Math.random();
}

function dashedLine(c, start, end) {
	var dir = end.sub(start);
	var n = dir.length() * 10;
	dir = dir.div(n);
	c.beginPath();
	for (var i = 0; i + 1 < n; i += 2) {
		c.moveTo(start.x, start.y);
		start = start.add(dir);
		c.lineTo(start.x, start.y);
		start = start.add(dir);
	}
	if (i < n) {
		c.moveTo(start.x, start.y);
		start = start.add(dir.mul(n - i));
		c.lineTo(start.x, start.y);
	}
	c.stroke();
}

var TEXT_BOX_X_MARGIN = 6;
var TEXT_BOX_Y_MARGIN = 6;
var HELP_SIGN_TEXT_WIDTH = 1.5;

// Splits up a string into an array of phrases based on the width of the sign
function splitUpText(c, phrase) {
	var words = phrase.split(" ");
	var phraseArray = new Array();
	var lastPhrase = "";
	c.font = "12px sans serif";
	var maxWidth = HELP_SIGN_TEXT_WIDTH * 50;
	var measure = 0;
	for (var i = 0; i < words.length; ++i) {
		var word = words[i];
		measure = c.measureText(lastPhrase + word).width;
		if (measure < maxWidth) {
			lastPhrase += " " + word;
		} else {
			if (lastPhrase.length > 0) phraseArray.push(lastPhrase);
			lastPhrase = word;
		}
		if (i == words.length - 1) {
			phraseArray.push(lastPhrase);
			break;
		}
	}
	return phraseArray;
}

// Draw a text box, takes in an array of lines
function drawTextBox(c, textArray, xCenter, yCenter, textSize) {
	var numLines = textArray.length;
	if (numLines < 1) return;

	// Calculate the height of all lines and the widest line's width
	c.font = textSize + 'px Arial, sans-serif';
	var lineHeight = textSize + 2;
	var textHeight = lineHeight * numLines;
	var textWidth = -1;
	for (var i = 0; i < numLines; ++i) {
		var currWidth = c.measureText(textArray[i]).width;
		if (textWidth < currWidth) {
			textWidth = currWidth;
		}
	}

	// Draw the box
	c.fillStyle = '#BFBFBF';
	c.strokeStyle = '#7F7F7F';
	var xLeft = xCenter - textWidth / 2 - TEXT_BOX_X_MARGIN;
	var yBottom = yCenter - textHeight / 2 - TEXT_BOX_Y_MARGIN;
	c.fillRect(xLeft, yBottom, textWidth + TEXT_BOX_X_MARGIN * 2, textHeight + TEXT_BOX_Y_MARGIN * 2);
	c.strokeRect(xLeft, yBottom, textWidth + TEXT_BOX_X_MARGIN * 2, textHeight + TEXT_BOX_Y_MARGIN * 2);

	// Draw the text
	c.fillStyle = 'black';
	c.textAlign = 'center';
	// yCurr starts at the top, so subtract half of height of box
	var yCurr = yCenter + 4 - (numLines - 1) * lineHeight / 2;
	for (var i = 0; i < numLines; ++i) {
		c.fillText(textArray[i], xCenter, yCurr);
		yCurr += lineHeight;
	}
}

////////////////////////////////////////////////////////////////////////////////
// class Rectangle
////////////////////////////////////////////////////////////////////////////////

function Rectangle(start, end) {
	this.min = new Vector(Math.min(start.x, end.x), Math.min(start.y, end.y));
	this.max = new Vector(Math.max(start.x, end.x), Math.max(start.y, end.y));
}

Rectangle.prototype.intersectsRect = function(rect) {
	return (this.min.x < rect.max.x && rect.min.x < this.max.x
		&& this.min.y < rect.max.y && rect.min.y < this.max.y);
};

Rectangle.prototype.intersectsEdge = function(edge) {
	var total = 0;
	total += edge.pointBehindEdge(this.min);
	total += edge.pointBehindEdge(new Vector(this.min.x, this.max.y));
	total += edge.pointBehindEdge(new Vector(this.max.x, this.min.y));
	total += edge.pointBehindEdge(this.max);
	return (total != 0 && total != 4);
};

Rectangle.prototype.containsPoint = function(point) {
	return point.x >= this.min.x && point.x < this.max.x && point.y >= this.min.y && point.y < this.max.y;
};

Rectangle.prototype.expand = function(x, y) {
	var padding = new Vector(x, y);
	return new Rectangle(this.min.sub(padding), this.max.add(padding));
};

////////////////////////////////////////////////////////////////////////////////
// class Circle
////////////////////////////////////////////////////////////////////////////////

function Circle(center, radius) {
	this.center = center;
	this.radius = radius;
}

Circle.prototype.intersectsRect = function(rect) {
	var topLeft = new Vector(rect.min.x, rect.max.y);
	var topRight = rect.max;
	var bottomLeft = rect.min;
	var bottomRight = new Vector(rect.max.x, rect.min.y);
	return (rect.containsPoint(this.center)
		|| this.intersectsEdge(new Edge(topLeft, topRight))
		|| this.intersectsEdge(new Edge(topRight, bottomRight))
		|| this.intersectsEdge(new Edge(bottomRight, bottomLeft))
		|| this.intersectsEdge(new Edge(bottomLeft, topLeft))
		|| this.containsPoint(rect.min));
};

Circle.prototype.intersectsEdge = function(edge) {
	var dir = edge.end.sub(edge.start);
	var fromCenter = edge.start.sub(this.center);
	var a = dir.lengthSquared();
	var b = 2 * dir.dot(fromCenter);
	var c = fromCenter.lengthSquared() - this.radius * this.radius;
	var discriminant = b * b - 4 * a * c;
	if (discriminant >= 0)
	{
		var tb = -b / (2 * a);
		var td = Math.sqrt(discriminant) / (2 * a);
		var t1 = tb + td;
		var t2 = tb - td;
		return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
	}
	return false;
};

Circle.prototype.containsPoint = function(point) {
	return this.center.sub(point).lengthSquared() < this.radius * this.radius;
};

////////////////////////////////////////////////////////////////////////////////
// class Polygon
////////////////////////////////////////////////////////////////////////////////

function Polygon() {
	this.vertices = Array.prototype.slice.call(arguments);
}

Polygon.prototype.draw = function(c) {
	c.beginPath();
	for (var i = 0; i < this.vertices.length; i++) {
		var v = this.vertices[i];
		c.lineTo(v.x, v.y);
	}
	c.closePath();
	c.fill();
	c.stroke();
};

Polygon.prototype.containsPoint = function(point) {
	// Use winding number test (sum of angles == +/-2PI iff point in polygon)
	var total = 0;
	for (var i = 0; i < this.vertices.length; i++) {
		var j = (i + 1) % this.vertices.length;
		var di = this.vertices[i].sub(point).unit();
		var dj = this.vertices[j].sub(point).unit();
		total += Math.acos(di.dot(dj));
	}
	return Math.abs(Math.abs(total) - 2 * Math.PI) < 0.001;
};

////////////////////////////////////////////////////////////////////////////////
// class MacroCommand
//
// This is a group of commands that are all undone and redone at once.  For
// example, most text editors group adjacent character insert commands so that
// when you undo, the entire run of character insertions is done at once.
////////////////////////////////////////////////////////////////////////////////

function MacroCommand() {
	this.commands = [];
}

MacroCommand.prototype.undo = function() {
	for (var i = this.commands.length - 1; i >= 0; i--) {
		this.commands[i].undo();
	}
};

MacroCommand.prototype.redo = function() {
	for (var i = 0; i < this.commands.length; i++) {
		this.commands[i].redo();
	}
};

////////////////////////////////////////////////////////////////////////////////
// class UndoStack
//
// This class is based off QUndoStack from the Qt framework:
// http://doc.qt.nokia.com/stable/qundostack.html
////////////////////////////////////////////////////////////////////////////////

function UndoStack() {
	this.macros = [];
	this.commands = [];
	this.currentIndex = 0;
	this.cleanIndex = 0;
}

UndoStack.prototype._push = function(command) {
	// Only push the macro if it's non-empty, otherwise it leads to weird behavior
	if (command instanceof MacroCommand && command.commands.length == 0) {
		return;
	}
	
	if (this.macros.length == 0) {
		// Remove all commands after our position in the undo buffer (these are
		// ones we have undone, and once we do something else we shouldn't be able
		// to redo these anymore)
		this.commands = this.commands.slice(0, this.currentIndex);
		
		// If we got to the current position by undoing from a clean state, set
		// the clean state to invalid because we won't be able to get there again
		if (this.cleanIndex > this.currentIndex) this.cleanIndex = -1;
		
		this.commands.push(command);
		this.currentIndex++;
	} else {
		// Merge adjacent commands together in the same macro by calling mergeWith()
		// on the previous command and passing it the next command.  If it returns
		// true, the information from the next command has been merged with the
		// previous command and we can forget about the next command (so we return
		// instead of pushing it).
		var commands = this.macros[this.macros.length - 1].commands;
		if (commands.length > 0) {
			var prevCommand = commands[commands.length - 1];
			if ('mergeWith' in prevCommand && prevCommand.mergeWith(command)) {
				return;
			}
		}
		
		commands.push(command);
	}
};

UndoStack.prototype.push = function(command) {
	this._push(command);
	command.redo();
};

UndoStack.prototype.canUndo = function() {
	return this.macros.length == 0 && this.currentIndex > 0;
};

UndoStack.prototype.canRedo = function() {
	return this.macros.length == 0 && this.currentIndex < this.commands.length;
};

UndoStack.prototype.beginMacro = function() {
	this.macros.push(new MacroCommand());
};

UndoStack.prototype.endMacro = function() {
	if (this.macros.length > 0) this._push(this.macros.pop());
};

UndoStack.prototype.endAllMacros = function() {
	while (this.macros.length > 0) this.endMacro();
};

UndoStack.prototype.undo = function() {
	if (this.canUndo()) this.commands[--this.currentIndex].undo();
};

UndoStack.prototype.redo = function() {
	if (this.canRedo()) this.commands[this.currentIndex++].redo();
};

UndoStack.prototype.getCurrentIndex = function() {
	return this.currentIndex;
};

UndoStack.prototype.setCleanIndex = function(index) {
	this.cleanIndex = index;
};

UndoStack.prototype.clear = function() {
	this.macros = [];
	this.commands = [];
	this.currentIndex = this.cleanIndex = 0;
};

////////////////////////////////////////////////////////////////////////////////
// class Vector
////////////////////////////////////////////////////////////////////////////////

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

// binary operations
Vector.prototype.add = function(v) { return new Vector(this.x + v.x, this.y + v.y); };
Vector.prototype.sub = function(v) { return new Vector(this.x - v.x, this.y - v.y); };
Vector.prototype.mul = function(f) { return new Vector(this.x * f, this.y * f); };
Vector.prototype.div = function(f) { return new Vector(this.x / f, this.y / f); };
Vector.prototype.eq = function(v) { return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) < 0.001; };

// other functions
Vector.prototype.dot = function(v) { return this.x*v.x + this.y*v.y; };
Vector.prototype.lengthSquared = function() { return this.dot(this); };
Vector.prototype.length = function() { return Math.sqrt(this.lengthSquared()); };
Vector.prototype.unit = function() { return this.div(this.length()); };
Vector.prototype.normalize = function() { var len = this.length(); this.x /= len; this.y /= len; };
Vector.prototype.flip = function() { return new Vector(this.y, -this.x); }; // turns 90 degrees right
Vector.prototype.atan2 = function() { return Math.atan2(this.y, this.x); };
Vector.prototype.angleBetween = function(v) { return this.atan2() - v.atan2(); };
Vector.prototype.rotate = function(theta) { var s = Math.sin(theta), c = Math.cos(theta); return new Vector(this.x*c - this.y*s, this.x*s + this.y*c); };
Vector.prototype.minComponents = function(v) { return new Vector(Math.min(this.x, v.x), Math.min(this.y, v.y)); };
Vector.prototype.maxComponents = function(v) { return new Vector(Math.max(this.x, v.x), Math.max(this.y, v.y)); };
Vector.prototype.projectOntoAUnitVector = function(v) { return v.mul(this.dot(v)); };
Vector.prototype.toString = function() { return '(' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ')'; };
Vector.prototype.adjustTowardsTarget = function(target, maxDistance) {
    var v = ((target.sub(this)).lengthSquared() < maxDistance * maxDistance) ? target : this.add((target.sub(this)).unit().mul(maxDistance));
    this.x = v.x;
    this.y = v.y;
};
Vector.prototype.floor = function() { return new Vector(Math.floor(this.x), Math.floor(this.y)); };

// static functions
Vector.fromAngle = function(theta) { return new Vector(Math.cos(theta), Math.sin(theta)); };
Vector.lerp = function(a, b, percent) { return a.add(b.sub(a).mul(percent)); };
})();

