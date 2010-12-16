// Tiles
var MODE_TILES_EMPTY = 0;
var MODE_TILES_SOLID = 1;
var MODE_TILES_DIAGONAL = 2;

// Walls
var MODE_WALLS_NORMAL = 3;
var MODE_WALLS_ONEWAY = 4;

// Buttons
var MODE_BUTTONS_OPEN = 5;
var MODE_BUTTONS_CLOSE = 6;
var MODE_BUTTONS_TOGGLE = 7;
var MODE_BUTTONS_LINK = 8;

// Colors
var MODE_COLORS_RED = 9;
var MODE_COLORS_BLUE = 10;
var MODE_COLORS_NEUTRAL = 11;

// Game Elements
var MODE_ELEMENTS_START = 12;
var MODE_ELEMENTS_GOAL = 13;
var MODE_ELEMENTS_COG = 14;
var MODE_ELEMENTS_SIGN = 15;

// Other
var MODE_OTHER_ENEMIES = 16;

function Editor(canvas) {
	this.canvas = canvas;
	this.c = canvas.getContext('2d');
	this.mode = MODE_TILES_EMPTY;
	this.worldCenter = new Vector(0, 0);
	this.worldScale = 50;
	this.currentTool = null;
}

Editor.prototype.setMode = function(mode) {
	this.mode = mode;
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
	
	// Set up camera transform
	c.save();
	c.translate(w / 2, h / 2);
	c.scale(this.worldScale, -this.worldScale);
	c.translate(-this.worldCenter.x, -this.worldCenter.y);
	c.lineWidth = 1 / this.worldScale;
	this.drawGrid();
	c.restore();
};

Editor.prototype.drawGrid = function() {
	var c = this.c;
	
	// blend away every other line as we zoom out
	var logWorldScale = Math.log(50 / this.worldScale) / Math.log(2);
	var currentResolution = (logWorldScale < 1) ? 1 : (1 << Math.floor(logWorldScale));
	var nextResolution = 2 * currentResolution;
	var percent = (logWorldScale < 0) ? 1 : (1 - logWorldScale + Math.floor(logWorldScale));

	// work out which lines we have to draw
	var min = this.viewportToWorld(new Vector(0, this.canvas.height));
	var max = this.viewportToWorld(new Vector(this.canvas.width, 0));
	var minX = Math.floor(min.x / nextResolution) * nextResolution;
	var minY = Math.floor(min.y / nextResolution) * nextResolution;
	var maxX = Math.ceil(max.x / nextResolution) * nextResolution;
	var maxY = Math.ceil(max.y / nextResolution) * nextResolution;

	// draw the lines
	var x, y;
	c.strokeStyle = 'rgba(0, 0, 0, 0.5)';
	c.beginPath();
	for (x = minX; x <= maxX; x += 2 * currentResolution)
	{
		c.moveTo(x, minY);
		c.lineTo(x, maxY);
	}
	for (y = minY; y <= maxY; y += 2 * currentResolution)
	{
		c.moveTo(minX, y);
		c.lineTo(maxX, y);
	}
	c.stroke();
	c.strokeStyle = 'rgba(0, 0, 0, ' + (0.5 * percent * percent) + ')';
	c.beginPath();
	for (x = minX + currentResolution; x <= maxX; x += 2 * currentResolution)
	{
		c.moveTo(x, minY);
		c.lineTo(x, maxY);
	}
	for (y = minY + currentResolution; y <= maxY; y += 2 * currentResolution)
	{
		c.moveTo(minX, y);
		c.lineTo(maxX, y);
	}
	c.stroke();
};

Editor.prototype.mouseDown = function(point) {
	this.currentTool = new CameraPanTool(this.worldCenter);
	this.currentTool.mouseDown(this.viewportToWorld(point));
};

Editor.prototype.mouseDragged = function(point) {
	if (this.currentTool !== null) {
		this.currentTool.mouseDragged(this.viewportToWorld(point));
		this.draw();
	}
};

Editor.prototype.mouseUp = function(point) {
	this.currentTool.mouseUp(this.viewportToWorld(point));
	this.currentTool = null;
};

Editor.prototype.mouseWheel = function(deltaX, deltaY) {
	// scale the camera keeping the current view centered
	this.worldScale = Math.max(1, this.worldScale * Math.pow(1.1, deltaY));
	this.draw();
};

Editor.prototype.viewportToWorld = function(viewportPoint) {
	// convenience method to convert from viewport to world coordinates
	var x = (viewportPoint.x - this.canvas.width / 2) / this.worldScale + this.worldCenter.x;
	var y = (this.canvas.height / 2 - viewportPoint.y) / this.worldScale + this.worldCenter.y;
	return new Vector(x, y);
};
