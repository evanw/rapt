// caching strategy: cache the level background around each player on two
// canvases twice the size of the screen and re-center them as needed

// FPS data:
// ff = Firefox 4.0b7 on Mac 10.6.5
// ch = Chrome 9.0.597.42 beta on Mac 10.6.5

// fixed physics tick
//
// Level		   |  ff cache	|  ff no cache	|  ch cache  |	ch no cache
// ----------------+------------+---------------+------------+---------------
// Intro 1 (whole) |	 38		|	   52		|	  56	 |		60
// Intro 1 (split) |	 26		|	   32		|	  33	 |		46
// Cube (whole)    |	  9		|		9		|	  36	 |		43
// Cube (split)    |	  5		|		6		|	  15	 |		17

// variable physics tick (note: while this improved speed in ff quite a bit,
// physics were noticably wrong -- wall crawlers got stuck and wheeligators
// would hop up and down while rolling)
//
// Level		   |  ff cache	|  ff no cache	|  ch cache  |	ch no cache
// ----------------+------------+---------------+------------+---------------
// Intro 1 (whole) |	 40		|	   60		|	  56	 |		60
// Intro 1 (split) |	 28		|	   38		|	  34	 |		44
// Cube (whole)    |	 26		|	   28		|	  37	 |		43
// Cube (split)    |	 17		|	   14		|	  20	 |		20

// class BackgroundCache
function BackgroundCache(name) {
	// create a <canvas>, unless we already created one in a previous game
	var id = 'background-cache-' + name;
	this.canvas = document.getElementById(id);
	if (this.canvas === null) {
		this.canvas = document.createElement('canvas');
		this.canvas.id = id;
		this.canvas.style.display = 'none';
		document.body.appendChild(this.canvas);
	}
	this.c = this.canvas.getContext('2d');

	// the cache is empty at first
	this.xmin = 0;
	this.ymin = 0;
	this.xmax = 0;
	this.ymax = 0;

	this.width = 0;
	this.height = 0;
	this.ratio = 0;

	this.modificationCount = -1;
}

BackgroundCache.prototype.draw = function(c, xmin, ymin, xmax, ymax) {
	var ratio = globalScaleFactor(); // Retina support

	// if cache is invalid, update cache
	if (this.modificationCount != gameState.modificationCount || xmin < this.xmin || xmax > this.xmax || ymin < this.ymin || ymax > this.ymax || this.ratio != ratio) {
		this.modificationCount = gameState.modificationCount;

		// set bounds of cached image
		var viewportWidth = 2 * (xmax - xmin);
		var viewportHeight = 2 * (ymax - ymin);
		this.xmin = xmin - viewportWidth / 4;
		this.ymin = ymin - viewportHeight / 4;
		this.xmax = xmax + viewportWidth / 4;
		this.ymax = ymax + viewportHeight / 4;

		// resize canvas bigger if needed
		var width = Math.ceil(viewportWidth * gameScale);
		var height = Math.ceil(viewportHeight * gameScale);
		this.width = width;
		this.height = height;
		this.canvas.width = Math.round(this.width * ratio);
		this.canvas.height = Math.round(this.height * ratio);
		this.c.scale(ratio, ratio);

		// clear the background
		this.c.fillStyle = '#BFBFBF';
		this.c.fillRect(0, 0, width, height);

		// set up transform
		this.c.save();
		this.c.translate(width / 2, height / 2);
		this.c.scale(gameScale, -gameScale);
		this.c.lineWidth = 1 / gameScale;

		// render
		this.c.translate(-(this.xmin + this.xmax) / 2, -(this.ymin + this.ymax) / 2);
		gameState.world.draw(this.c, this.xmin, this.ymin, this.xmax, this.ymax);

		// undo transform
		this.c.restore();

		// draw an X so we can see the cache (for debugging)
		/*this.c.strokeStyle = 'rgba(0, 0, 0, 0.1)';
		this.c.lineWidth = 5;
		this.c.beginPath();
		this.c.moveTo(0, 0);
		this.c.lineTo(width, height);
		this.c.moveTo(width, 0);
		this.c.lineTo(0, height);
		this.c.stroke();*/
	}

	// draw from cache
	// for performance, we MUST make sure the image is drawn at an integer coordinate to take
	// advantage of fast blitting, otherwise browsers will use slow software bilinear interpolation
	c.mozImageSmoothingEnabled = false;
	c.save();
	var ratio = globalScaleFactor(); // Retina support
	c.setTransform(ratio, 0, 0, ratio, 0, 0);
	c.drawImage(this.canvas,
		Math.round((this.xmin - xmin) * gameScale),
		Math.round((2 * ymin - ymax - this.ymin) * gameScale),
		this.width,
		this.height
	);
	c.restore();
};
