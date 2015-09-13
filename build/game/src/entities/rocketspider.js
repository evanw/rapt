#require <class.js>
#require <spawningenemy.js>
#require <rocketspiderlegs.js>
#require <keyframe.js>

var SPIDER_LEG_HEIGHT = 0.5;

var SPIDER_BODY = 0;
var SPIDER_LEG1_TOP = 1;
var SPIDER_LEG2_TOP = 2;
var SPIDER_LEG3_TOP = 3;
var SPIDER_LEG4_TOP = 4;
var SPIDER_LEG5_TOP = 5;
var SPIDER_LEG6_TOP = 6;
var SPIDER_LEG7_TOP = 7;
var SPIDER_LEG8_TOP = 8;
var SPIDER_LEG1_BOTTOM = 9;
var SPIDER_LEG2_BOTTOM = 10;
var SPIDER_LEG3_BOTTOM = 11;
var SPIDER_LEG4_BOTTOM = 12;
var SPIDER_LEG5_BOTTOM = 13;
var SPIDER_LEG6_BOTTOM = 14;
var SPIDER_LEG7_BOTTOM = 15;
var SPIDER_LEG8_BOTTOM = 16;
var SPIDER_NUM_SPRITES = 17;

var spiderWalkingKeyframes = [
	new Keyframe().add(0, -10, -20, -10, 10, -10, 10, -10, -20, 20, 10, 70, 20, 70, 20, 20, 10),
	new Keyframe().add(0, 10, -10, -20, -10, -20, -10, 10, -10, 20, 20, 10, 70, 10, 70, 20, 20),
	new Keyframe().add(0, -10, 10, -10, -20, -10, -20, -10, 10, 70, 20, 20, 10, 20, 10, 70, 20),
	new Keyframe().add(0, -20, -10, 10, -10, 10, -10, -20, -10, 10, 70, 20, 20, 20, 20, 10, 70)
];

var spiderFallingKeyframes = [
	new Keyframe().add(0, 7, 3, -1, -5, 5, 1, -3, -7, -14, -6, 2, 10, -10, -2, 6, 14),
	new Keyframe().add(0, 30, 10, -30, -20, 30, 40, -10, -35, -50, -90, 40, 20, -50, -40, 70, 30)
];

var SPIDER_WIDTH = 0.9;
var SPIDER_HEIGHT = 0.3;
var SPIDER_SHOOT_FREQ = 2.0;
var SPIDER_SPEED = 1.0;
var SPIDER_ELASTICITY = 1.0;
var SPIDER_FLOOR_DIST = 1.0;
// Spiders can only see this many cells high
var SPIDER_SIGHT_HEIGHT = 10;

function drawSpiderBody(c) {
	var innerRadius = 0.5;
	c.beginPath();
	for(var i = 0; i <= 21; i++)
	{
		var angle = (0.25 + 0.5 * i / 21) * Math.PI;
		var radius = 0.6 + 0.05 * (i & 2);
		c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius - 0.5);
	}
	for(var i = 21; i >= 0; i--)
	{
		var angle = (0.25 + 0.5 * i / 21) * Math.PI;
		c.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius - 0.5);
	}
	c.fill();
}

function drawSpiderLeg(c) {
	c.beginPath();
	c.moveTo(0, 0);
	c.lineTo(0, -SPIDER_LEG_HEIGHT);
	c.stroke();
}

function createSpiderSprites() {
	var sprites = [];
	for(var i = 0; i < SPIDER_NUM_SPRITES; i++) {
		sprites.push(new Sprite());
		sprites[i].drawGeometry = (i == 0) ? drawSpiderBody : drawSpiderLeg;
	}

	for(var i = SPIDER_LEG1_TOP; i <= SPIDER_LEG8_TOP; i++) {
		sprites[i].setParent(sprites[SPIDER_BODY]);
	}

	for(var i = SPIDER_LEG1_BOTTOM; i <= SPIDER_LEG8_BOTTOM; i++) {
		sprites[i].setParent(sprites[i - SPIDER_LEG1_BOTTOM + SPIDER_LEG1_TOP]);
	}

	sprites[SPIDER_LEG1_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * 0.35, 0);
	sprites[SPIDER_LEG2_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * 0.15, 0);
	sprites[SPIDER_LEG3_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * -0.05, 0);
	sprites[SPIDER_LEG4_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * -0.25, 0);

	sprites[SPIDER_LEG5_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * 0.25, 0);
	sprites[SPIDER_LEG6_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * 0.05, 0);
	sprites[SPIDER_LEG7_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * -0.15, 0);
	sprites[SPIDER_LEG8_TOP].offsetBeforeRotation = new Vector(SPIDER_WIDTH * -0.35, 0);

	for(var i = SPIDER_LEG1_BOTTOM; i <= SPIDER_LEG8_BOTTOM; i++)
		sprites[i].offsetBeforeRotation = new Vector(0, -SPIDER_LEG_HEIGHT);

	return sprites;
}

RocketSpider.subclasses(SpawningEnemy);

function RocketSpider(center, angle) {
	SpawningEnemy.prototype.constructor.call(this, ENEMY_ROCKET_SPIDER, center.add(new Vector(0, 0.81 - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT * 0.5)),
					  SPIDER_WIDTH, SPIDER_HEIGHT, SPIDER_ELASTICITY, SPIDER_SHOOT_FREQ, 0);
	this.leftChasesA = true;
	this.leftSpawnPoint = new Vector(0, 0);
	this.rightSpawnPoint = new Vector(0, 0);
	this.timeSinceStart = 0;
	this.legs = new RocketSpiderLegs(center, angle, this);
	gameState.addEnemy(this.legs, this.legs.getShape().getCenter());

	this.sprites = createSpiderSprites();
	
	// spiders periodically "twitch" when their animation resets because the
	// collision detection doesn't see them as on the floor, so only change
	// to a falling animation if we haven't been on the floor for a few ticks
	this.animationDelay = 0;
	this.animationIsOnFloor = 0;
}

RocketSpider.prototype.canCollide = function() { return false; }

// Returns true iff the target is in the spider's sight line
RocketSpider.prototype.playerInSight = function(target) {
	if (target.isDead()) return false;
	var relativePos = target.getCenter().sub(this.getCenter());
	var relativeAngle = relativePos.atan2();
	// Player needs to be within a certain height range, in the line of sight, and between the angle of pi/4 and 3pi/4
	if (relativePos.y < SPIDER_SIGHT_HEIGHT && (relativeAngle > Math.PI * .25) && (relativeAngle < Math.PI * .75)) {
		return (!CollisionDetector.lineOfSightWorld(this.getCenter(), target.getCenter(), gameState.world));
	}
	return false;
}

RocketSpider.prototype.spawnRocket = function(loc, target, angle) {
	gameState.addEnemy(new Rocket(loc, target, angle), this.getCenter());
}

// When either Player is above the cone of sight extending above the spider, shoot
RocketSpider.prototype.spawn = function() {
	var center = this.getCenter();
	this.leftSpawnPoint = new Vector(center.x - SPIDER_WIDTH * .4, center.y + SPIDER_HEIGHT * .4);
	this.rightSpawnPoint = new Vector(center.x + SPIDER_WIDTH * .4, center.y + SPIDER_HEIGHT * .4);

	if (this.playerInSight(gameState.playerA)) {
		if (this.playerInSight(gameState.playerB)) {
			this.spawnRocket(this.leftChasesA ? this.leftSpawnPoint : this.rightSpawnPoint, gameState.playerA, this.leftChasesA ? Math.PI * .75 : Math.PI * .25);
			this.spawnRocket(this.leftChasesA ? this.rightSpawnPoint : this.leftSpawnPoint, gameState.playerB, this.leftChasesA ? Math.PI * .25 : Math.PI * .75);
			this.leftChasesA = !this.leftChasesA;
			return true;
		} else {
			this.spawnRocket(this.leftSpawnPoint, gameState.playerA, Math.PI * .75);
			this.spawnRocket(this.rightSpawnPoint, gameState.playerA, Math.PI * .25);
			return true;
		}
	} else if (this.playerInSight(gameState.playerB)) {
		this.spawnRocket(this.leftSpawnPoint, gameState.playerB, Math.PI * .75);
		this.spawnRocket(this.rightSpawnPoint, gameState.playerB, Math.PI * .25);
		return true;
	}
	return false;
}

// Rocket spiders hover slowly over the floor, bouncing off walls with elasticity 1
RocketSpider.prototype.move = function(seconds) {
	// The height difference is h = player_height - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT / 2
	return this.legs.getCenter().sub(this.getCenter()).add(new Vector(0, 0.81 - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT * 0.5));
}

RocketSpider.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.sprites[SPIDER_BODY].offsetBeforeRotation = position;
	this.sprites[SPIDER_BODY].flip = (this.legs.velocity.x > 0);

	// work out whether the spider is on the floor (walking animation) or in the air (falling animation)
	var isOnFloor = this.legs.isOnFloor();
	if (isOnFloor != this.animationIsOnFloor) {
		// wait 1 tick before changing the animation to avoid "twitching"
		if (++this.animationDelay > 1) {
			this.animationIsOnFloor = isOnFloor;
			this.animationDelay = 0;
		}
	} else {
		this.animationDelay = 0;
	}

	this.timeSinceStart += seconds * 0.5;
	var frame;
	if(!this.animationIsOnFloor)
	{
		var percent = this.legs.velocity.y * -0.25;
		percent = (percent < 0.01) ? 0 : 1 - 1 / (1 + percent);
		frame = spiderFallingKeyframes[0].lerpWith(spiderFallingKeyframes[1], percent);
	}
	else frame = Keyframe.lerp(spiderWalkingKeyframes, 10 * this.timeSinceStart);

	for(var i = 0; i < SPIDER_NUM_SPRITES; i++) {
		this.sprites[i].angle = frame.angles[i];
	}
}

// The body of the Spider kills the player
RocketSpider.prototype.reactToPlayer = function(player) {
	player.setDead(true);
}

RocketSpider.prototype.onDeath = function() {
	// don't add this death to the stats because it is added in the legs OnDeath() method

	// add something that looks like the body
	Particle().position(this.getCenter()).bounces(1).gravity(5).decay(0.1).custom(drawSpiderBody).color(0, 0, 0, 1).angle(0).angularVelocity(randInRange(-Math.PI, Math.PI));
}

RocketSpider.prototype.draw = function(c) {
	c.strokeStyle = 'black';
	c.fillStyle = 'black';
	this.sprites[SPIDER_BODY].draw(c);
}
