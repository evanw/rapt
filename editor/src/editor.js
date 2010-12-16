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
	
	c.fillStyle = '#7F7F7F';
	c.fillRect(0, 0, w, h);
	
	c.strokeStyle = '#3F3F3F';
	c.beginPath();
	c.moveTo(0, 0);
	c.lineTo(w, h);
	c.moveTo(w, 0);
	c.lineTo(0, h);
	c.stroke();
};
