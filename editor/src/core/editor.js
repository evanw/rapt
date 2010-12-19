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

var enemies = [
	{ name: 'Bomber', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawBomber(c, alpha, 0.7); }) },
	{ name: 'Doom Magnet', sprite: new Sprite(0.35, function(c, alpha) { Sprites.drawDoomMagnet(c, alpha); }) },
	{ name: 'Hunter', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawHunter(c, alpha); }) },
	{ name: 'Multi-Gun', sprite: new Sprite(0.45, function(c, alpha) { Sprites.drawMultiGun(c, alpha); }) },
	{ name: 'Popper', sprite: new Sprite(0.5, function(c, alpha) { Sprites.drawPopper(c, alpha); }) },
	{ name: 'Jet Stream', sprite: new Sprite(0.45, function(c, alpha) { Sprites.drawRiotGun(c, alpha, 0.75, Math.PI / 2); }) },
	{ name: 'Rocket Spider', sprite: new Sprite(0.5, function(c, alpha) { Sprites.drawSpider(c, alpha); }) },
	{ name: 'Spike Ball', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawSpikeBall(c, alpha); }) },
	{ name: 'Wall Crawler', sprite: new Sprite(0.25, function(c, alpha) { Sprites.drawWallCrawler(c, alpha); }) },
	{ name: 'Wheeligator', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawWheeligator(c, alpha); }) },
	{ name: 'Bouncy Rockets', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawBouncyRocketLauncher(c, alpha, true); }) },
	{ name: 'Bouncy Rockets', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawBouncyRocketLauncher(c, alpha, false); }) },
	{ name: 'Corrosion Cloud', sprite: new Sprite(0.5, function(c, alpha) { Sprites.drawCloud(c, alpha, true); }) },
	{ name: 'Corrosion Cloud', sprite: new Sprite(0.5, function(c, alpha) { Sprites.drawCloud(c, alpha, false); }) },
	{ name: 'Grenadier', sprite: new Sprite(0.35, function(c, alpha) { Sprites.drawGrenadier(c, alpha, true); }) },
	{ name: 'Grenadier', sprite: new Sprite(0.35, function(c, alpha) { Sprites.drawGrenadier(c, alpha, false); }) },
	{ name: 'Headache', sprite: new Sprite(0.5, todo) },
	{ name: 'Headache', sprite: new Sprite(0.5, todo) },
	{ name: 'Shock Hawk', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawShockHawk(c, alpha, true); }) },
	{ name: 'Shock Hawk', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawShockHawk(c, alpha, false); }) },
	{ name: 'Stalacbat', sprite: new Sprite(0.2, function(c, alpha) { Sprites.drawStalacbat(c, alpha, true); }) },
	{ name: 'Stalacbat', sprite: new Sprite(0.2, function(c, alpha) { Sprites.drawStalacbat(c, alpha, false); }) },
	{ name: 'Wall Avoider', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawWallAvoider(c, alpha, true); }) },
	{ name: 'Wall Avoider', sprite: new Sprite(0.3, function(c, alpha) { Sprites.drawWallAvoider(c, alpha, false); }) }
];
var cogSprite = new Sprite(0.25, function(c, alpha) { Sprites.drawCog(c, alpha, 0.25); });

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
	
	this.doc.world.playerStart = new Vector(-2, -1);
	this.doc.world.playerGoal = new Vector(1, -1);
	this.doc.world.setCell(-2, -1, CELL_EMPTY);
	this.doc.world.setCell(-2, 0, CELL_EMPTY);
	this.doc.world.setCell(-1, 0, CELL_EMPTY);
	this.doc.world.setCell(0, 0, CELL_EMPTY);
	this.doc.world.setCell(1, 0, CELL_EMPTY);
	this.doc.world.setCell(1, -1, CELL_EMPTY);
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
		this.selectedTool = new AddPlaceableTool(this.doc, cogSprite);
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
		this.selectedTool = new AddPlaceableTool(this.doc, enemies[this.selectedEnemy].sprite);
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
