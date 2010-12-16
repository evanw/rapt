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
var gameScale = 50;

Game.extends(Screen);

// class Game extends Screen
function Game() {
	this.camera = new Camera();
	this.fps = 0;

	gameState = new GameState();

    // For testing
    //gameState.addEnemy(new MultiGun(gameState.spawnPoint.add(new Vector(0.2, 9))));
    gameState.addEnemy(new ShockHawk(gameState.spawnPoint.add(new Vector(4.8, 10)), gameState.playerB));
    gameState.addEnemy(new SpikeBall(gameState.spawnPoint.add(new Vector(4.8, 8))));
    gameState.addEnemy(new RiotGun(gameState.spawnPoint.add(new Vector(5, 2)), Math.PI * 0.55));
    gameState.addEnemy(new RocketSpider(gameState.spawnPoint.add(new Vector(4, 3)), 0));
    //gameState.addEnemy(new BouncyRocketLauncher(gameState.spawnPoint.add(new Vector(1, 4)), gameState.playerA));
    //gameState.addEnemy(new GoldenCog(gameState.spawnPoint.add(new Vector(14, 0))));
    //gameState.addEnemy(new GoldenCog(gameState.spawnPoint.add(new Vector(0, 12))));
    //gameState.addEnemy(new Hunter(gameState.spawnPoint.add(new Vector(9, 0.2)), gameState.playerB));
    //gameState.addEnemy(new DoomMagnet(gameState.spawnPoint.add(new Vector(0, 6)), gameState.playerA));
    //gameState.addEnemy(new Bomber(gameState.spawnPoint.add(new Vector(4, 2.5)), 0));
    //gameState.addEnemy(new Wheeligator(gameState.spawnPoint.add(new Vector(3, 4.1)), 0));
    //gameState.addEnemy(new WallCrawler(gameState.spawnPoint.add(new Vector(0, 3)), 0));
    //gameState.addEnemy(new WallAvoider(gameState.spawnPoint.add(new Vector(1, 5)), gameState.playerA));
    //gameState.addEnemy(new Popper(gameState.spawnPoint.add(new Vector(5, .1))));
    //gameState.addEnemy(new CorrosionCloud(gameState.spawnPoint.add(new Vector(4, 4)), gameState.playerB));
    //gameState.addEnemy(new Headache(gameState.spawnPoint.add(new Vector(0, 6)), gameState.playerA));
    //gameState.addEnemy(new Grenadier(gameState.spawnPoint.add(new Vector(5, 5)), gameState.playerA));
}

Game.prototype.resize = function(w, h) {
	this.width = w;
	this.height = h;
	this.camera = new Camera(gameState.playerA, gameState.playerB, w / gameScale, h / gameScale);
};

Game.prototype.tick = function(seconds) {
	gameState.tick(seconds);
	Particle.tick(seconds);

	// smooth the fps a bit
	this.fps = lerp(this.fps, 1 / seconds, 0.05);
};

Game.prototype.render = function(c, center) {
	var halfWidth = this.width / (2 * gameScale);
	var halfHeight = this.height / (2 * gameScale);
	c.save();
	c.translate(-center.x, -center.y);
	gameState.draw(c, center.x - halfWidth, center.y - halfHeight, center.x + halfWidth, center.y + halfHeight);
	Particle.draw(c);
	c.restore();
};

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

	// draw the fps counter
	c.font = '10px Arial, sans-serif';
	c.fillStyle = 'black';
	var text = this.fps.toFixed(0) + ' FPS';
	c.fillText(text, this.width - 5 - c.measureText(text).width, this.height - 5);
};

Game.prototype.keyDown = function(key) {
	if(key in keyMapPlayerA) gameState.playerA[keyMapPlayerA[key]] = true;
	if(key in keyMapPlayerB) gameState.playerB[keyMapPlayerB[key]] = true;
};

Game.prototype.keyUp = function(key) {
	if(key in keyMapPlayerA) gameState.playerA[keyMapPlayerA[key]] = false;
	if(key in keyMapPlayerB) gameState.playerB[keyMapPlayerB[key]] = false;
};
