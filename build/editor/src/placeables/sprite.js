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
