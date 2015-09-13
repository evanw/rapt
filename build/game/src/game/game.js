#require <class.js>
#require <screen.js>

var gameScale = 50;

// text constants
var GAME_WIN_TEXT = "You won!  Hit SPACE to play the next level or ESC for the level selection menu.";
var GOLDEN_COG_TEXT = "You earned a golden cog!";
var SILVER_COG_TEXT = "You earned a silver cog!";
var GAME_LOSS_TEXT = "You lost.  Hit SPACE to restart, or ESC to select a new level.";
var TEXT_BOX_X_MARGIN = 6;
var TEXT_BOX_Y_MARGIN = 6;
var SECONDS_BETWEEN_TICKS = 1 / 60;
var useFixedPhysicsTick = true;

Game.subclasses(Screen);

// class Game extends Screen
function Game() {
	this.camera = new Camera();
	this.fps = 0;
	this.fixedPhysicsTick = 0;

	this.isDone = false;
	this.onWin = null;

	// whether this game is the last level in the menu, this will be updated by main.js when the menu loads
	this.lastLevel = false;

	gameState = new GameState();
}

Game.prototype.resize = function(w, h) {
	this.width = w;
	this.height = h;
	this.camera = new Camera(gameState.playerA, gameState.playerB, w / gameScale, h / gameScale);
};

Game.prototype.tick = function(seconds) {
	// when the screen isn't split, standing at the original spawn point:
	// * Triple Threat
	//	 - variable physics tick: 30 FPS
	//	 - fixed physics tick: 25 FPS
	// * Cube
	//	 - variable physics tick: 35 FPS
	//	 - fixed physics tick: 30 FPS
	// * Coordinated Panic
	//	 - variable physics tick: 55 FPS
	//	 - fixed physics tick: 50 FPS
	// overall, a fixed physics tick provides about 5 FPS drop but fixes a lot of
	// gameplay issues (measurements above approximate but within about +/-1)

	if (useFixedPhysicsTick) {
		// fixed physics tick
		var count = 0;
		this.fixedPhysicsTick += seconds;
		while (++count <= 3 && this.fixedPhysicsTick >= 0) {
			this.fixedPhysicsTick -= SECONDS_BETWEEN_TICKS;
			gameState.tick(SECONDS_BETWEEN_TICKS);
			Particle.tick(SECONDS_BETWEEN_TICKS);
		}
	} else {
		// variable physics tick
		gameState.tick(seconds);
		Particle.tick(seconds);
	}

	// smooth the fps a bit
	this.fps = lerp(this.fps, 1 / seconds, 0.05);

	// handle winning the game
	if (!this.isDone && gameState.gameStatus != GAME_IN_PLAY) {
		this.isDone = true;
		if (gameState.gameStatus == GAME_WON && this.onWin) {
			this.onWin();
		}
	}
};

Game.prototype.render = function(c, center, width, height, backgroundCache) {
	var halfWidth = width / 2;
	var halfHeight = height / 2;
	var xmin = center.x - halfWidth;
	var ymin = center.y - halfHeight;
	var xmax = center.x + halfWidth;
	var ymax = center.y + halfHeight;
	c.save();
	c.translate(-center.x, -center.y);

	// draw the background, backgroundCache is an optional argument
	if (backgroundCache) {
		backgroundCache.draw(c, xmin, ymin, xmax, ymax);
	} else {
		gameState.world.draw(c, xmin, ymin, xmax, ymax);
	}

	gameState.draw(c, xmin, ymin, xmax, ymax);
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
	if (!useBackgroundCache) {
		// clear the background
		c.fillStyle = '#BFBFBF';
		c.fillRect(0, 0, this.width, this.height);
	}

	// draw the game
	c.save();
	c.translate(this.width / 2, this.height / 2);
	c.scale(gameScale, -gameScale);
	c.lineWidth = 1 / gameScale;
	this.camera.draw(c, this);
	c.restore();

	if (gameState.gameStatus === GAME_WON) {
		// draw winning text
		c.save();
		var gameWinText = (this.lastLevel ? "Congratulations, you beat the last level in this set!	Press SPACE or ESC to return to the level selection menu." : GAME_WIN_TEXT);
		var cogsCollectedText = "Cogs Collected: " + gameState.stats[STAT_COGS_COLLECTED] + "/" + gameState.stats[STAT_NUM_COGS];
		drawTextBox(c, [gameWinText, "", cogsCollectedText], this.width / 2, this.height / 2, 14);
		c.restore();
	} else if (gameState.gameStatus === GAME_LOST) {
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

Game.prototype.keyDown = function(e) {
	var keyCode = e.which;
	var action = Keys.fromKeyCode(keyCode);
	if (action != null) {
		if (action.indexOf('a-') == 0) gameState.playerA[action.substr(2)] = true;
		else if (action.indexOf('b-') == 0) gameState.playerB[action.substr(2)] = true;
		else gameState[action] = true;
		e.preventDefault();
		e.stopPropagation();
	}
};

Game.prototype.keyUp = function(e) {
	var keyCode = e.which;
	var action = Keys.fromKeyCode(keyCode);
	if (action != null) {
		if (action.indexOf('a-') == 0) gameState.playerA[action.substr(2)] = false;
		else if (action.indexOf('b-') == 0) gameState.playerB[action.substr(2)] = false;
		else gameState[action] = false;
		e.preventDefault();
		e.stopPropagation();
	}
};
