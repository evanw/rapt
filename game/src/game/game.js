#require <class.js>
#require <screen.js>

// player key mappings
var keyMapPlayerA = {
	38: 'jumpKey',   // up arrow key
	40: 'crouchKey', // down arrow key
	37: 'leftKey',   // left arrow key
	39: 'rightKey'   // right arrow key
};
var keyMapPlayerB = {
	87: 'jumpKey',   // w key
	83: 'crouchKey', // s key
	65: 'leftKey',   // a key
	68: 'rightKey'   // d key
};
var keyMapGame = {
    75: 'killKey'       // k key
};
var gameScale = 50;

// enum GameStatus
var GAME_IN_PLAY = 0;
var GAME_WON = 1;
var GAME_LOST = 2;

// text constants
var GAME_WIN_TEXT = "You won!  Hit SPACE to play the next level or ESC for the level selection menu.";
var GOLDEN_COG_TEXT = "You earned a golden cog!";
var SILVER_COG_TEXT = "You earned a silver cog!";
var GAME_LOSS_TEXT = "You lost!  Hit SPACE to restart, or ESC to select a new level.";
var TEXT_BOX_X_MARGIN = 6;
var TEXT_BOX_Y_MARGIN = 6;

Game.subclasses(Screen);

// class Game extends Screen
function Game() {
	this.camera = new Camera();
	this.fps = 0;
    this.gameStatus = GAME_IN_PLAY;

	gameState = new GameState();
}

Game.prototype.resize = function(w, h) {
	this.width = w;
	this.height = h;
	this.camera = new Camera(gameState.playerA, gameState.playerB, w / gameScale, h / gameScale);
};

Game.prototype.tick = function(seconds) {
    if (this.gameStatus === GAME_WON || gameState.gameWon()) {
        this.gameStatus = GAME_WON;
    } else if (this.gameStatus === GAME_LOST || gameState.gameLost()) {
        this.gameStatus = GAME_LOST;
    }
	gameState.tick(seconds);
	Particle.tick(seconds);

	// smooth the fps a bit
	this.fps = lerp(this.fps, 1 / seconds, 0.05);
};

Game.prototype.render = function(c, center, width, height) {
	var halfWidth = width / 2;
	var halfHeight = height / 2;
	c.save();
	c.translate(-center.x, -center.y);
	gameState.draw(c, center.x - halfWidth, center.y - halfHeight, center.x + halfWidth, center.y + halfHeight);
	Particle.draw(c);
	c.restore();
};

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
    c.lineWidth = 1;
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

Game.prototype.draw = function(c) {
	// clear the background
	c.fillStyle = '#BFBFBF';
	c.fillRect(0, 0, this.width, this.height);

	// draw the game
	c.save();
	c.translate(this.width / 2, this.height / 2);
	c.scale(gameScale, -gameScale);
	c.lineWidth = 1 / gameScale;
	this.camera.draw(c, this);
	c.restore();

    if (this.gameStatus === GAME_WON) {
        // draw winning text
        c.save();
        drawTextBox(c, [GAME_WIN_TEXT], this.width / 2, this.height / 2, 14);
        c.restore();
    } else if (this.gameStatus === GAME_LOST) {
        // draw losing text
        c.save();
        drawTextBox(c, [GAME_LOSS_TEXT], this.width / 2, this.height / 2, 14);
        c.restore();
    }

	// draw the fps counter
	c.font = '10px Arial, sans-serif';
	c.fillStyle = 'black';
	var text = this.fps.toFixed(0) + ' FPS';
	c.fillText(text, this.width - 5 - c.measureText(text).width, this.height - 5);
};

Game.prototype.keyDown = function(key) {
    if (key in keyMapGame) gameState[keyMapGame[key]] = true;
	if (key in keyMapPlayerA) gameState.playerA[keyMapPlayerA[key]] = true;
	if (key in keyMapPlayerB) gameState.playerB[keyMapPlayerB[key]] = true;
};

Game.prototype.keyUp = function(key) {
    if (key in keyMapGame) gameState[keyMapGame[key]] = true;
	if (key in keyMapPlayerA) gameState.playerA[keyMapPlayerA[key]] = false;
	if (key in keyMapPlayerB) gameState.playerB[keyMapPlayerB[key]] = false;
};
