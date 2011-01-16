#require <class.js>
#require <walkingenemy.js>
#require <keyframe.js>

var LEG_LENGTH = 0.3;

var POPPER_BODY = 0;
var POPPER_LEG1_UPPER = 1;
var POPPER_LEG2_UPPER = 2;
var POPPER_LEG3_UPPER = 3;
var POPPER_LEG4_UPPER = 4;
var POPPER_LEG1_LOWER = 5;
var POPPER_LEG2_LOWER = 6;
var POPPER_LEG3_LOWER = 7;
var POPPER_LEG4_LOWER = 8;
var POPPER_NUM_SPRITES = 9;

var popperStandingKeyframe =
	new Keyframe(0, 0.1).add(0, -80, -80, 80, 80, 100, 100, -100, -100);
var popperJumpingKeyframes = [
	new Keyframe(0, 0.2).add(0, -40, -30, 30, 40, 40, 40, -40, -40),
	new Keyframe(0, 0.1).add(0, -80, -80, 80, 80, 100, 100, -100, -100)
];

var POPPER_RADIUS = 0.4;
var POPPER_JUMP_DELAY = 0.5;
var POPPER_MIN_JUMP_Y = 2.5;
var POPPER_MAX_JUMP_Y = 6.5;
var POPPER_ELASTICITY = 0.5;
var POPPER_ACCEL = -6;

function createPopperSprites() {
	var sprites = [];

	for(var i = 0; i < POPPER_NUM_SPRITES; i++) {
		sprites.push(new Sprite());
	}

	sprites[POPPER_BODY].drawGeometry = function(c) {
		c.strokeStyle = 'black';
		c.fillStyle = 'black';
		c.beginPath();
		c.moveTo(0.2, -0.2);
		c.lineTo(-0.2, -0.2);
		c.lineTo(-0.3, 0);
		c.lineTo(-0.2, 0.2);
		c.lineTo(0.2, 0.2);
		c.lineTo(0.3, 0);
		c.lineTo(0.2, -0.2);
		c.moveTo(0.15, -0.15);
		c.lineTo(-0.15, -0.15);
		c.lineTo(-0.23, 0);
		c.lineTo(-0.15, 0.15);
		c.lineTo(0.15, 0.15);
		c.lineTo(0.23, 0);
		c.lineTo(0.15, -0.15);
		c.stroke();

		c.beginPath();
		c.arc(-0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.arc(0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.fill();
	};

	var legDrawGeometry = function(c) {
		c.strokeStyle = 'black';
		c.beginPath();
		c.moveTo(0, 0);
		c.lineTo(0, -LEG_LENGTH);
		c.stroke();
	};

	for(var i = 0; i < 4; i++) {
		sprites[POPPER_LEG1_UPPER + i].drawGeometry = legDrawGeometry;
		sprites[POPPER_LEG1_LOWER + i].drawGeometry = legDrawGeometry;
		sprites[POPPER_LEG1_UPPER + i].setParent(sprites[POPPER_BODY]);
		sprites[POPPER_LEG1_LOWER + i].setParent(sprites[POPPER_LEG1_UPPER + i]);
		sprites[POPPER_LEG1_LOWER + i].offsetBeforeRotation = new Vector(0, -LEG_LENGTH);
	}

	sprites[POPPER_LEG1_UPPER].offsetBeforeRotation = new Vector(-0.2, -0.2);
	sprites[POPPER_LEG2_UPPER].offsetBeforeRotation = new Vector(-0.1, -0.2);
	sprites[POPPER_LEG3_UPPER].offsetBeforeRotation = new Vector(0.1, -0.2);
	sprites[POPPER_LEG4_UPPER].offsetBeforeRotation = new Vector(0.2, -0.2);

	return sprites;
}

Popper.subclasses(WalkingEnemy);

function Popper(center) {
	WalkingEnemy.prototype.constructor.call(this, ENEMY_POPPER, center, POPPER_RADIUS, POPPER_ELASTICITY);

	this.onFloor = false;
	this.timeToNextJump = POPPER_JUMP_DELAY;
	this.sprites = createPopperSprites();
}

Popper.prototype.move = function(seconds) {
	if (this.timeToNextJump <= 0) {
		// POPPER_MIN_JUMP_Y <= velocity.y < POPPER_MAX_JUMP_Y
		this.velocity.y = randInRange(POPPER_MIN_JUMP_Y, POPPER_MAX_JUMP_Y);
		// -(POPPER_MAX_JUMP_Y - POPPER_MIN_JUMP_Y) <= velocity.x <= (POPPER_MAX_JUMP_Y - POPPER_MIN_JUMP_Y)
		this.velocity.x = (Math.random() > 0.5) ? POPPER_MAX_JUMP_Y - this.velocity.y : -POPPER_MAX_JUMP_Y + this.velocity.y;

		this.timeToNextJump = POPPER_JUMP_DELAY;
		this.onFloor = false;
	} else if (this.onFloor) {
		this.timeToNextJump = this.timeToNextJump - seconds;
	}
	return this.accelerate(new Vector(0, POPPER_ACCEL), seconds);
};

Popper.prototype.reactToWorld = function(contact) {
	if (contact.normal.y >= .999) {
		this.velocity.x = 0;
		this.velocity.y = 0;
		this.onFloor = true;
	}
};

Popper.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	this.sprites[POPPER_BODY].offsetBeforeRotation = position;

	// unfortunate hax because poppers bounce a little bit because of the way Enemy::Tick() works
	var ref_shapePoint = {}, ref_worldPoint = {};
	var distance = CollisionDetector.closestToEntityWorld(this, 2 * POPPER_RADIUS, ref_shapePoint, ref_worldPoint, gameState.world);
	var isOnFloor = (distance < 3 * POPPER_RADIUS && ref_shapePoint.ref.eq(position.add(new Vector(0, -POPPER_RADIUS))) && ref_worldPoint.ref.sub(ref_shapePoint.ref).length() < 0.1);

	var frame;
	if(!isOnFloor)
	{
		var percent = this.velocity.y * -0.25;
		percent = (percent < 0) ? 1 / (1 - percent) - 1 : 1 - 1 / (1 + percent);
		frame = popperJumpingKeyframes[0].lerpWith(popperJumpingKeyframes[1], percent);
	}
	else frame = popperStandingKeyframe;

	this.sprites[POPPER_BODY].offsetAfterRotation = frame.center;
	for(var i = 0; i < POPPER_NUM_SPRITES; i++) {
		this.sprites[i].angle = frame.angles[i];
	}
};

Popper.prototype.draw = function(c) {
	this.sprites[POPPER_BODY].draw(c);
};

Popper.prototype.avoidsSpawn = function() {
	return true;
};
