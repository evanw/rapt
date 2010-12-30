// Bitmask for mouse buttons
var MOUSE_LEFT = (1 << 1);
var MOUSE_MIDDLE = (1 << 2);
var MOUSE_RIGHT = (1 << 3);

// Tiles
var MODE_TILES_EMPTY = 0;
var MODE_TILES_SOLID = 1;
var MODE_TILES_DIAGONAL = 2;

// Game Elements
var MODE_ELEMENTS_START = 3;
var MODE_ELEMENTS_GOAL = 4;
var MODE_ELEMENTS_COG = 5;
var MODE_ELEMENTS_SIGN = 6;

// Other
var MODE_OTHER_SELECT = 7;
var MODE_OTHER_ENEMIES = 8;
var MODE_OTHER_WALLS_BUTTONS = 9;
var MODE_OTHER_HELP = 10;

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
	this.setMode(MODE_TILES_EMPTY);
	this.selectedEnemy = 0;
	this.selectedWall = 0;
	this.isMouseOver = false;
	
	this.doc.world = loadWorldFromJSON('{"unique_id":1701400916,"width":40,"height":16,"start":[8,8],"end":[8,9],"entities":[{"class":"wall","start":[7,7],"end":[6,8],"oneway":false,"open":false,"color":0},{"class":"wall","start":[6,9],"end":[7,8],"oneway":false,"open":false,"color":0},{"class":"wall","start":[4,6],"end":[5,7],"oneway":false,"open":false,"color":0},{"class":"cog","pos":[4.49878,5.55471]},{"class":"button","type":0,"pos":[5.47134,6.61063],"walls":[2,0,1]},{"class":"sign","pos":[8.45018,10.5177],"text":"NO HELP FOR YOU"},{"class":"enemy","type":"bomber","pos":[10.451,11.5348],"color":0,"angle":3.14636},{"class":"enemy","type":"bouncy rocket launcher","pos":[11.48,11.46],"color":1,"angle":0},{"class":"enemy","type":"bouncy rocket launcher","pos":[12.46,11.44],"color":2,"angle":0},{"class":"enemy","type":"corrosion cloud","pos":[13.5,11.48],"color":1,"angle":0},{"class":"enemy","type":"corrosion cloud","pos":[14.5,11.44],"color":2,"angle":0},{"class":"enemy","type":"doom magnet","pos":[15.48,11.44],"color":0,"angle":0},{"class":"enemy","type":"grenadier","pos":[16.44,11.48],"color":1,"angle":0},{"class":"enemy","type":"grenadier","pos":[17.44,11.46],"color":2,"angle":0},{"class":"enemy","type":"headache","pos":[18.48,11.44],"color":1,"angle":0},{"class":"enemy","type":"headache","pos":[19.46,11.44],"color":2,"angle":0},{"class":"enemy","type":"hunter","pos":[20.46,11.44],"color":0,"angle":0},{"class":"enemy","type":"multi gun","pos":[21.46,11.46],"color":0,"angle":0},{"class":"enemy","type":"popper","pos":[22.48,11.48],"color":0,"angle":0},{"class":"enemy","type":"jet stream","pos":[23.5,11.46],"color":0,"angle":0},{"class":"enemy","type":"rocket spider","pos":[24.48,11.44],"color":0,"angle":0},{"class":"enemy","type":"shock hawk","pos":[25.48,11.46],"color":1,"angle":0},{"class":"enemy","type":"shock hawk","pos":[26.44,11.44],"color":2,"angle":0},{"class":"enemy","type":"spike ball","pos":[27.48,11.46],"color":0,"angle":0},{"class":"enemy","type":"stalacbat","pos":[28.5,11.48],"color":1,"angle":0},{"class":"enemy","type":"stalacbat","pos":[29.46,11.44],"color":2,"angle":0},{"class":"enemy","type":"wall avoider","pos":[30.46,11.5],"color":1,"angle":0},{"class":"enemy","type":"wall avoider","pos":[31.48,11.5],"color":2,"angle":0},{"class":"enemy","type":"wall crawler","pos":[32.5,11.46],"color":0,"angle":0},{"class":"enemy","type":"wheeligator","pos":[33.48,11.48],"color":0,"angle":0}],"cells":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,0,0,1,1,1,1,2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,0,0,0,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,5,4,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,3,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]}');
	this.worldCenter = this.doc.world.playerStart.add(new Vector(0.5, 0.5));
	
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

Editor.prototype.setMode = function(mode) {
	this.mode = mode;
	
	switch (mode) {
	case MODE_TILES_EMPTY:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_EMPTY);
		break;
	case MODE_TILES_SOLID:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_SOLID);
		break;
	case MODE_TILES_DIAGONAL:
		this.selectedTool = new SetCellTool(this.doc, SETCELL_DIAGONAL);
		break;
	case MODE_OTHER_SELECT:
		this.selectedTool = new SelectionTool(this.doc);
		break;
	case MODE_ELEMENTS_START:
		this.selectedTool = new SetPlayerStartTool(this.doc);
		break;
	case MODE_ELEMENTS_GOAL:
		this.selectedTool = new SetPlayerGoalTool(this.doc);
		break;
	case MODE_ELEMENTS_COG:
		this.selectedTool = new AddPlaceableTool(this.doc, spriteTemplates[SPRITE_COG].sprite);
		break;
	case MODE_OTHER_ENEMIES:
	case MODE_OTHER_WALLS_BUTTONS:
		this.setSidePanelTool();
		break;
	default:
		this.selectedTool = null;
		break;
	}
};

Editor.prototype.setSidePanelTool = function() {
	if (this.mode == MODE_OTHER_ENEMIES) {
		this.selectedTool = new AddPlaceableTool(this.doc, this.enemies[this.selectedEnemy].sprite);
	} else if (this.mode == MODE_OTHER_WALLS_BUTTONS) {
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
	this.canvas.width = width;
	this.canvas.height = height;
};

Editor.prototype.draw = function() {
	var c = this.c;
	var w = this.canvas.width;
	var h = this.canvas.height;
	
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
	var min = this.viewportToWorld(new Vector(0, this.canvas.height));
	var max = this.viewportToWorld(new Vector(this.canvas.width, 0));
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

Editor.prototype.mouseDown = function(point, buttons) {
	if (buttons == MOUSE_RIGHT) {
		// Camera pan on right click
		this.activeTool = new CameraPanTool(this.worldCenter);
		this.activeTool.mouseDown(this.viewportToWorld(point));
	} else if (buttons == MOUSE_LEFT) {
		// Use selected tool on left click
		this.activeTool = this.selectedTool;
		
		if (this.activeTool != null) {
			// Need to clear macro stack here if we get a mousedown event without a mouseup event
			this.doc.undoStack.endAllMacros();
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

Editor.prototype.viewportToWorld = function(viewportPoint) {
	// Convenience method to convert from viewport to world coordinates
	var x = (viewportPoint.x - this.canvas.width / 2) / this.worldScale + this.worldCenter.x;
	var y = (this.canvas.height / 2 - viewportPoint.y) / this.worldScale + this.worldCenter.y;
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
	// TODO
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
