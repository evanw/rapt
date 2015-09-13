#require <class.js>
#require <entity.js>
#require <keyframe.js>

// constants
var PAUSE_AFTER_DEATH = 2;
var RESPAWN_INTERPOLATION_TIME = 1;
var PAUSE_BEFORE_RESPAWN = 0.3;
var PLAYER_ACCELERATION = 50
var PLAYER_MAX_SPEED = 8;
var PLAYER_WIDTH = 0.2;
var PLAYER_HEIGHT = 0.75;
var PLAYER_SUPER_JUMP_SPEED = 10;
var PLAYER_CLAMBER_ACCEL_X = 5;
var PLAYER_CLAMBER_ACCEL_Y = 10;
var PLAYER_DEATH_SPEED = 15;
var PLAYER_GRAVITY = 10;
var SLIDE_PARTICLE_TIMER_PERIOD = 1 / 5;
var SUPER_PARTICLE_TIMER_PERIOD = 1 / 40;
var JUMP_MIN_WAIT = 0.5;
var WALL_FRICTION = 0.1;

// enum PlayerState
var PLAYER_STATE_FLOOR = 0;
var PLAYER_STATE_AIR = 1;
var PLAYER_STATE_CLAMBER = 2;
var PLAYER_STATE_LEFT_WALL = 3;
var PLAYER_STATE_RIGHT_WALL = 4;

var runningKeyframes = [
	new Keyframe(0, -5 / 50).add(5, -10, 65, -55, 20, 40, -20, -30, -30, 10),
	new Keyframe(0, -2 / 50).add(5, -10, 35, -25, 0, 30, 18, -110, 0, 20),
	new Keyframe(0, 0).add(5, -10, 10, -30, -20, 20, 60, -100, 10, 30),

	new Keyframe(0, -5 / 50).add(5, -10, -20, -30, -30, 10, 65, -55, 20, 40),
	new Keyframe(0, -2 / 50).add(5, -10, 18, -110, 0, 20, 35, -25, 0, 30),
	new Keyframe(0, 0).add(5, -10, 60, -100, 10, 30, 10, -30, -20, 20)
];
var jumpingKeyframes = [
	new Keyframe(0, 0).add(0, -10, 150, -170, -40, 30, -30, -20, 20, 150),
	new Keyframe(0, 0).add(-20, 10, 60, -100, -80, 30, 30, -20, 30, 30)
];
var wallSlidingKeyframe =
	new Keyframe((0.4 - PLAYER_WIDTH) / 2, 0).add(0, -10, 150, -130, 140, 50, 50, -30, 50, 130);
var crouchingKeyframe =
	new Keyframe(0, -0.2).add(30, -30, 130, -110, -30, 40, 60, -120, 20, 20);
var fallingKeyframes = [
	new Keyframe(0, 0).add(-20, 5, 10, -30, -120, -30, 40, -20, 120, 30),
	new Keyframe(0, 0).add(-20, 5, 10, -30, -130, -60, 40, -20, 150, 50)
];
var clamberingKeyframes = [
	new Keyframe((0.4 - PLAYER_WIDTH) / 2, 0).add(0, -10, 150, -130, 140, 50, 50, -30, 50, 130),
	new Keyframe(0, -0.2).add(30, -30, 160, -180, -30, 40, 20, -10, 20, 20)
];

// enum PlayerSpriteIndex
var PLAYER_HEAD = 0;
var PLAYER_TORSO = 1;
var PLAYER_LEFT_UPPER_LEG = 2;
var PLAYER_LEFT_LOWER_LEG = 3;
var PLAYER_LEFT_UPPER_ARM = 4;
var PLAYER_LEFT_LOWER_ARM = 5;
var PLAYER_RIGHT_UPPER_LEG = 6;
var PLAYER_RIGHT_LOWER_LEG = 7;
var PLAYER_RIGHT_UPPER_ARM = 8;
var PLAYER_RIGHT_LOWER_ARM = 9;
var PLAYER_NUM_SPRITES = 10;

function drawPlayerQuad(c, x1, x2, y1, y2)
{
	x1 /= 50;
	x2 /= 50;
	y1 /= 50;
	y2 /= 50;
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.lineTo(-x2, y2);
	c.lineTo(-x1, y1);
	c.closePath();
	c.fill();
	c.stroke();
}

function drawPlayerHead(c, x1, x2, y1, y2, y3)
{
	drawPlayerQuad(c, x1, x2, y1, y2);
	y2 /= 50;
	y3 /= 50;
	c.beginPath();
	c.moveTo(0, y2);
	c.lineTo(0, y3 - 0.02);
	c.arc(0, y3, 0.02, -Math.PI / 2, Math.PI * 3 / 2, false);
	c.stroke();
}

function createPlayerSprites() {
	var sprites = [];

	for(var i = 0; i < PLAYER_NUM_SPRITES; i++) {
		sprites.push(new Sprite());
	}

	sprites[PLAYER_HEAD].drawGeometry = function(c) { drawPlayerHead(c, 2.5, 2.5, 1, 10, 18); };
	sprites[PLAYER_TORSO].drawGeometry = function(c) { drawPlayerQuad(c, 1.5, 1.5, 0, 15); };
	sprites[PLAYER_LEFT_UPPER_LEG].drawGeometry = sprites[PLAYER_RIGHT_UPPER_LEG].drawGeometry = function(c) { drawPlayerQuad(c, 1.5, 1, 0, -10); };
	sprites[PLAYER_LEFT_LOWER_LEG].drawGeometry = sprites[PLAYER_RIGHT_LOWER_LEG].drawGeometry = function(c) { drawPlayerQuad(c, 1, 1.5, 0, -10); };
	sprites[PLAYER_LEFT_UPPER_ARM].drawGeometry = sprites[PLAYER_RIGHT_UPPER_ARM].drawGeometry = function(c) { drawPlayerQuad(c, 1.5, 0.5, 0, -9); };
	sprites[PLAYER_LEFT_LOWER_ARM].drawGeometry = sprites[PLAYER_RIGHT_LOWER_ARM].drawGeometry = function(c) { drawPlayerQuad(c, 0.5, 1.5, 0, -10); };

	sprites[PLAYER_HEAD].setParent(sprites[PLAYER_TORSO]);
	sprites[PLAYER_LEFT_UPPER_ARM].setParent(sprites[PLAYER_TORSO]);
	sprites[PLAYER_RIGHT_UPPER_ARM].setParent(sprites[PLAYER_TORSO]);
	sprites[PLAYER_LEFT_LOWER_ARM].setParent(sprites[PLAYER_LEFT_UPPER_ARM]);
	sprites[PLAYER_RIGHT_LOWER_ARM].setParent(sprites[PLAYER_RIGHT_UPPER_ARM]);
	sprites[PLAYER_LEFT_UPPER_LEG].setParent(sprites[PLAYER_TORSO]);
	sprites[PLAYER_RIGHT_UPPER_LEG].setParent(sprites[PLAYER_TORSO]);
	sprites[PLAYER_LEFT_LOWER_LEG].setParent(sprites[PLAYER_LEFT_UPPER_LEG]);
	sprites[PLAYER_RIGHT_LOWER_LEG].setParent(sprites[PLAYER_RIGHT_UPPER_LEG]);

	sprites[PLAYER_HEAD].offsetBeforeRotation = new Vector(0, 17 / 50);
	sprites[PLAYER_LEFT_LOWER_LEG].offsetBeforeRotation = new Vector(0, -10 / 50);
	sprites[PLAYER_RIGHT_LOWER_LEG].offsetBeforeRotation = new Vector(0, -10 / 50);
	sprites[PLAYER_LEFT_UPPER_ARM].offsetBeforeRotation = new Vector(0, 15 / 50);
	sprites[PLAYER_RIGHT_UPPER_ARM].offsetBeforeRotation = new Vector(0, 15 / 50);
	sprites[PLAYER_LEFT_LOWER_ARM].offsetBeforeRotation = new Vector(0, -9 / 50);
	sprites[PLAYER_RIGHT_LOWER_ARM].offsetBeforeRotation = new Vector(0, -9 / 50);

	return sprites;
}

Player.subclasses(Entity);

// class Player extends Entity
function Player(center, color) {
	Entity.prototype.constructor.call(this);
	this.reset(center, color);
}

// this is necessary because if we just set gameState.playerA = new Player()
// it'll wipe out everyone's references (for targets and so on)
Player.prototype.reset = function(center, color) {
	// keys (will be set automatically)
	this.jumpKey = false;
	this.crouchKey = false;
	this.leftKey = false;
	this.rightKey = false;

	// the player is modeled as a triangle so it behaves like a
	// box on top (so it has width) and behaves like a point on
	// bottom (so it slides down when walking off ledges)
	this.polygon = new Polygon(
		center,
		new Vector(PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2),
		new Vector(-PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2),
		new Vector(0, -PLAYER_HEIGHT / 2)
	);

	// physics stuff
	this.velocity = new Vector(0, 0);
	this.actualVelocity = new Vector(0, 0);
	this.boost = 0;
	this.boostTime = 0;
	this.boostMagnitude = 0;
	this.onDiagLastTick = false;
	this.jumpDisabled = false;
	this.lastContact = null;
	this.state = PLAYER_STATE_FLOOR;
	this.prevState = PLAYER_STATE_FLOOR;

	// animation stuff
	this.sprites = createPlayerSprites();
	this.facingRight = false;
	this.runningFrame = 0;
	this.fallingFrame = 0;
	this.crouchTimer = 0;
	this.timeSinceDeath = 0;
	this.positionOfDeath = new Vector(0, 0);
	this.slideParticleTimer = 0;
	this.superJumpParticleTimer = 0;

	// other stuff
	this.isSuperJumping = false;
	this.color = color;
};

Player.prototype.getShape = function(){ return this.polygon; };
Player.prototype.getColor = function(){ return this.color; };

// returns 0 for red player and 1 for blue player
Player.prototype.getPlayerIndex = function() {
	return (this == gameState.playerB);
};

Player.prototype.getCrouch = function() {
	return this.crouchKey;
};

Player.prototype.disableJump = function() {
	this.jumpDisabled = true;
};

Player.prototype.addToVelocity = function(v) {
	this.velocity.inplaceAdd(v);
};

Player.prototype.collideWithOtherPlayer = function() {
	// Do a co-op jump if a bunch of conditions hold: Both players on floor, the other player is crouching, and the two are colliding
	var otherPlayer = gameState.getOtherPlayer(this);

	if(otherPlayer.crouchKey && !otherPlayer.isDead() && this.state == PLAYER_STATE_FLOOR && otherPlayer.state == PLAYER_STATE_FLOOR)
	{
		// Other player not moving, this player moving fast enough in x
		if(otherPlayer.velocity.lengthSquared() < 0.01 &&
			Math.abs(this.velocity.x) > 4 /* && TODO: HAD TO COMMENT THIS OUT BECAUSE Y VELOCITY IS BIGGER THAN 0.1, WHY IS THIS
			Math.abs(this.velocity.y) < 0.1*/)
		{
			var relativePos = this.getCenter().sub(otherPlayer.getCenter());

			// if y-position within 0.01 and x-position within 0.1
			if(Math.abs(relativePos.y) <= 0.01 && Math.abs(relativePos.x) < 0.1)
			{
				this.velocity = new Vector(0, PLAYER_SUPER_JUMP_SPEED);
				this.isSuperJumping = true;
			}
		}

		// Change the spawn point if the players are within 1 unit and we have waited for at least 1 second
		if(this.getCenter().sub(otherPlayer.getCenter()).lengthSquared() < 1 &&
			this.crouchTimer > 1 && otherPlayer.crouchTimer >= this.crouchTimer)
		{
			gameState.setSpawnPoint(otherPlayer.getCenter());
		}
	}
};

Player.prototype.tick = function(seconds) {
	this.tickDeath(seconds);

	if(!this.isDead()) {
		this.tickPhysics(seconds);
		this.tickParticles(seconds);
		this.tickAnimation(seconds);
	}
};

Player.prototype.tickDeath = function(seconds) {
	// increment the death timer
	if(!this.isDead()) this.timeSinceDeath = 0;
	else this.timeSinceDeath += seconds;

	// respawn as needed (but only if the other player isn't also dead)
	if(this.timeSinceDeath > PAUSE_AFTER_DEATH + RESPAWN_INTERPOLATION_TIME + PAUSE_BEFORE_RESPAWN && !gameState.getOtherPlayer(this).isDead()) {
		this.setDead(false);
	}

	// if we're dead, interpolate back to the spawn point
	if(this.isDead()) {
		// smoothly interpolate the position of death to the spawn point (speeding up at the beginning and slowing down at the end)
		var destination = gameState.getSpawnPoint();
		var percent = (this.timeSinceDeath - PAUSE_AFTER_DEATH) / RESPAWN_INTERPOLATION_TIME;
		percent = Math.max(0, Math.min(1, percent));
		percent = 0.5 - 0.5 * Math.cos(percent * Math.PI);
		percent = 0.5 - 0.5 * Math.cos(percent * Math.PI);
		this.setCenter(Vector.lerp(this.positionOfDeath, destination, percent));
	}
};

Player.prototype.tickPhysics = function(seconds) {
	// if we hit something, stop the boost
	if(this.lastContact != null)
	{
		this.boostMagnitude = 0;
		this.boostTime = 0;
	}

	// if we're not in a boost, decrease the boost magnitude
	this.boostTime -= seconds;
	if(this.boostTime < 0)
		this.boostMagnitude *= Math.pow(0.1, seconds);

	// if we hit something or fall down, turn super jumping off
	if(this.lastContact != null || this.velocity.y < 0)
		this.isSuperJumping = false;

	// move the player horizontally
	var moveLeft = (this.leftKey && !this.rightKey && !this.crouchKey);
	var moveRight = (this.rightKey && !this.leftKey && !this.crouchKey);

	// check for edge collisions.  sometimes if we hit an edge hard, we won't actually be within the margin
	// but we will have a contact so we use both methods to detect an edge contact
	// THIS IS A GLOBAL NOW var edgeQuad = new EdgeQuad();
	CollisionDetector.onEntityWorld(this, edgeQuad, gameState.world);

	var onGround = (edgeQuad.edges[EDGE_FLOOR] != null) || (this.lastContact != null && Edge.getOrientation(this.lastContact.normal) == EDGE_FLOOR);
	var onLeft = (edgeQuad.edges[EDGE_LEFT] != null) || (this.lastContact != null && Edge.getOrientation(this.lastContact.normal) == EDGE_LEFT);
	var onRight = (edgeQuad.edges[EDGE_RIGHT] != null) || (this.lastContact != null && Edge.getOrientation(this.lastContact.normal) == EDGE_RIGHT);
	var onCeiling = (edgeQuad.edges[EDGE_CEILING] != null) || (this.lastContact != null && Edge.getOrientation(this.lastContact.normal) == EDGE_CEILING);

	if (!this.jumpDisabled && this.jumpKey)
	{
		// do a vertical jump
		if(onGround)
		{
			this.velocity.y = 6.5;
			this.boostTime = 0;
			this.boost = 0;
			this.boostMagnitude = 0;

			// boost away from the wall
			if(onLeft || onRight)
			{
				this.boostTime = 0.5;
				this.boost = 1;
				this.boostMagnitude = 0.5;
			}

			// if it's on the right wall, just switch the boost direction
			if(onRight)
				this.boost = -this.boost;

			// if the other player is super jumping, make us super jumping too!
			if(gameState.getOtherPlayer(this).isSuperJumping)
			{
				this.velocity.y = PLAYER_SUPER_JUMP_SPEED;
				this.isSuperJumping = true;
			}
		}
		// wall jump off the left wall
		else if(onLeft && !moveLeft && this.boostTime < 0)
		{
			this.velocity = new Vector(3.5, 6.5);
			this.boostTime = JUMP_MIN_WAIT;
			this.boost = 2.5;
			this.boostMagnitude = 1;
		}
		// wall jump off the right wall
		else if(onRight && !moveRight && this.boostTime < 0)
		{
			this.velocity = new Vector(-3.5, 6.5);
			this.boostTime = JUMP_MIN_WAIT;
			this.boost = -2.5;
			this.boostMagnitude = 1;
		}
	}

	// kill the boost when we hit a ceiling
	if(onCeiling) {
		this.boostTime = 0;
		this.boost = 0;
		this.boostMagnitude = 0;
	}

	// accelerate left and right (but not on ceilings, unless you are also on the ground for diagonal corners)
	if(onGround || !onCeiling) {
		if(moveLeft) {
			this.velocity.x -= PLAYER_ACCELERATION * seconds;
			this.velocity.x = Math.max(this.velocity.x, -PLAYER_MAX_SPEED);
		}
		if(moveRight) {
			this.velocity.x += PLAYER_ACCELERATION * seconds;
			this.velocity.x = Math.min(this.velocity.x, PLAYER_MAX_SPEED);
		}
	}

	if(edgeQuad.edges[EDGE_FLOOR]) this.state = PLAYER_STATE_FLOOR;
	else if(edgeQuad.edges[EDGE_LEFT]) this.state = PLAYER_STATE_LEFT_WALL;
	else if(edgeQuad.edges[EDGE_RIGHT]) this.state = PLAYER_STATE_RIGHT_WALL;
	else this.state = PLAYER_STATE_AIR;

	var ref_closestPointWorld = {}, ref_closestPointShape = {};
	var closestPointDistance = CollisionDetector.closestToEntityWorld(this, 0.1, ref_closestPointShape, ref_closestPointWorld, gameState.world);

	if(this.state == PLAYER_STATE_LEFT_WALL || this.state == PLAYER_STATE_RIGHT_WALL) {
		// apply wall friction if the player is sliding down
		if (this.velocity.y < 0) {
			this.velocity.y *= Math.pow(WALL_FRICTION, seconds);
		}
		if (this.velocity.y > -0.5 && this.prevState === PLAYER_STATE_CLAMBER) {
			// continue clambering to prevent getting stuck alternating between clambering and climbing
			this.state = PLAYER_STATE_CLAMBER;
		}
	}


	// start clambering if we're touching something below us, but not on a floor, wall, or ceiling
	if(this.state == PLAYER_STATE_AIR && closestPointDistance < 0.01 && ref_closestPointShape.ref.y > ref_closestPointWorld.ref.y)
		this.state = PLAYER_STATE_CLAMBER;

	if(this.state == PLAYER_STATE_CLAMBER)
	{	
		// clamber left
		if(this.leftKey && ref_closestPointWorld.ref.x - this.polygon.getCenter().x < 0) {
			this.velocity.x -= PLAYER_CLAMBER_ACCEL_X * seconds;
			this.velocity.y += PLAYER_CLAMBER_ACCEL_Y * seconds;
		}
		// clamber right
		if(this.rightKey && ref_closestPointWorld.ref.x - this.polygon.getCenter().x > 0) {
			this.velocity.x += PLAYER_CLAMBER_ACCEL_X * seconds;
			this.velocity.y += PLAYER_CLAMBER_ACCEL_Y * seconds;
		}
	}

	this.crouchTimer += seconds;
	if(!this.crouchKey || this.state != PLAYER_STATE_FLOOR)
		this.crouchTimer = 0;

	// If on a floor
	if(this.state == PLAYER_STATE_FLOOR) {
		if (this.crouchKey) {
			this.velocity.inplaceMul(Math.pow(0.000001, seconds));
		} else {
			this.velocity.y -= PLAYER_GRAVITY * seconds;
			if (!this.jumpKey && this.leftKey != this.rightKey && 
				this.onDiagLastTick && edgeQuad.edges[EDGE_FLOOR].segment.normal.y < 0.99) {
				// If running down on a diagonal floor, dont let the player run off
				this.velocity = this.velocity.projectOntoAUnitVector(edgeQuad.edges[EDGE_FLOOR].segment.normal.flip()).mul(0.99);
				this.velocity.y += .001;
			}
		}
	} else {
		this.velocity.y -= PLAYER_GRAVITY * seconds;
	}

	this.onDiagLastTick = (this.state == PLAYER_STATE_FLOOR && edgeQuad.edges[EDGE_FLOOR].segment.normal.y < 0.99);
	this.collideWithOtherPlayer();

	// boost the velocity in the x direction
	this.actualVelocity = Vector.lerp(this.velocity, new Vector(this.boost, this.velocity.y), this.boostMagnitude);
	if(this.boost != 0 && this.velocity.x / this.boost > 1)
		this.actualVelocity.x = this.velocity.x;

	var deltaPosition = this.actualVelocity.mul(seconds);
	// Time independent version of multiplying by 0.909511377
	this.velocity.x *= Math.pow(0.000076, seconds);

	var ref_deltaPosition = {ref: deltaPosition}, ref_velocity = {ref: this.velocity};
	var newContact = CollisionDetector.collideEntityWorld(this, ref_deltaPosition, ref_velocity, 0, gameState.world, true);
	deltaPosition = ref_deltaPosition.ref;
	this.velocity = ref_velocity.ref;
	this.lastContact = newContact;

	this.polygon.moveBy(deltaPosition);

	if(this.actualVelocity.y < -PLAYER_DEATH_SPEED && newContact != null && newContact.normal.y > 0.9) {
		this.setDead(true);
		this.onDeath();
	}

	// After everything, reenable jump
	this.prevState = this.state;
	this.jumpDisabled = false;
};

Player.prototype.onDeath = function() {
	this.velocity = new Vector(0, 0);
	this.state = PLAYER_STATE_AIR;
	this.boost = this.boostMagnitude = 0;
	this.isSuperJumping = false;

	this.timeSinceDeath = 0;
	this.positionOfDeath = this.polygon.center;

	var isRed = (gameState.playerA == this);
	var r = isRed ? 1 : 0.1;
	var g = 0.1;
	var b = isRed ? 0.1 : 1;

	for(var i = 0; i < 500; i++)
	{
		var direction = Vector.fromAngle(lerp(0, 2*Math.PI, Math.random()));
		direction = this.velocity.add(direction.mul(lerp(1, 10, Math.random())));

		Particle().triangle().position(this.polygon.center).velocity(direction).radius(0.01, 0.1).bounces(0, 4).elasticity(0.05, 0.9).decay(0.01, 0.02).expand(1, 1.2).color(r/2, g/2, b/2, 1).mixColor(r, g, b, 1);
	}
	gameState.incrementStat(STAT_PLAYER_DEATHS);
};

Player.prototype.onRespawn = function() {
};

Player.prototype.tickParticles = function(seconds) {
	// wall sliding particles
	if(this.state == PLAYER_STATE_LEFT_WALL || this.state == PLAYER_STATE_RIGHT_WALL) {
		var directionMultiplier = (this.state == PLAYER_STATE_RIGHT_WALL) ? -1 : 1;
		var bounds = this.polygon.getAabb();
		var up = this.velocity.y;

		this.slideParticleTimer -= seconds * this.velocity.length();
		while(this.slideParticleTimer < 0) {
			this.slideParticleTimer += SLIDE_PARTICLE_TIMER_PERIOD;

			// distribute the particles along the side of the bounding box closest to the world (add 0.25 because the hands reach over the bounding box)
			var position = new Vector(
				(this.state == PLAYER_STATE_RIGHT_WALL) ? bounds.getRight() : bounds.getLeft(),
				lerp(bounds.getBottom(), bounds.getTop() + 0.25, Math.random()));
			var velocity = new Vector(
				lerp(0, directionMultiplier, Math.random()),
				lerp(up, 2*up, Math.random()));

			Particle().color(0.3, 0.3, 0.3, 1).mixColor(0.5, 0.3, 0.3, 1).position(position).circle().radius(0.02, 0.04).decay(0.01, 0.2).gravity(15).bounces(2, 4).velocity(velocity).elasticity(0.05, 0.1);
		}
	} else {
		this.slideParticleTimer = 0;
	}

	// super jump particles
	if(this.isSuperJumping) {
		this.superJumpParticleTimer -= seconds;
		while(this.superJumpParticleTimer < 0) {
			this.superJumpParticleTimer += SUPER_PARTICLE_TIMER_PERIOD;
			var position = this.polygon.center.add(new Vector(randInRange(-0.2, 0.2), randInRange(-0.4, 0.4)));
			Particle().color(1, 1, 0, 1).mixColor(1, 1, 0, 0.75).position(position).circle().radius(0.03, 0.05).expand(1.1, 1.2).decay(0.1, 0.2).gravity(5).bounces(2, 3);
		}
	} else {
		this.superJumpParticleTimer = 0;
	}
};

Player.prototype.tickAnimation = function(seconds) {
	var frame;
	var slowDownScale = 1;

	this.runningFrame += seconds * Math.abs(this.actualVelocity.x) * Math.PI;
	this.fallingFrame += 8 * seconds;

	if(this.state == PLAYER_STATE_LEFT_WALL) {
		this.facingRight = false;
		frame = wallSlidingKeyframe;
	} else if(this.state == PLAYER_STATE_RIGHT_WALL) {
		this.facingRight = true;
		frame = wallSlidingKeyframe;
	} else if(this.state == PLAYER_STATE_AIR) {
		if(this.actualVelocity.x < 0) this.facingRight = false;
		else if(this.actualVelocity.x > 0) this.facingRight = true;

		if(this.actualVelocity.y > -PLAYER_DEATH_SPEED) {
			var percent = this.actualVelocity.y / 4;
			percent = (percent < 0) ? 1 / (1 - percent) - 1 : 1 - 1 / (1 + percent);
			percent = 0.5 - 0.5 * percent;
			frame = jumpingKeyframes[0].lerpWith(jumpingKeyframes[1], percent);
		} else {
			frame = Keyframe.lerp(fallingKeyframes, this.fallingFrame);
		}
	} else if(this.state == PLAYER_STATE_CLAMBER) {
		var ref_shapePoint = {}, ref_worldPoint = {};
		CollisionDetector.closestToEntityWorld(this, 2, ref_shapePoint, ref_worldPoint, gameState.world);

		// this should be from -0.5 to 0.5, so add 0.5 so it is from 0 to 1
		var percent = (this.getCenter().y - ref_worldPoint.ref.y) / PLAYER_HEIGHT;
		percent += 0.5;

		frame = clamberingKeyframes[0].lerpWith(clamberingKeyframes[1], percent);

		this.facingRight = (ref_shapePoint.ref.x < ref_worldPoint.ref.x);
	} else if(this.crouchKey) {
		frame = crouchingKeyframe;
	} else {
		frame = Keyframe.lerp(runningKeyframes, this.runningFrame);
		if(this.actualVelocity.x < -0.1) this.facingRight = false;
		else if(this.actualVelocity.x > 0.1) this.facingRight = true;

		slowDownScale = Math.abs(this.actualVelocity.x) / 5;
		if(slowDownScale > 1) slowDownScale = 1;
	}

	for(var i = 0; i < this.sprites.length; i++) {
		this.sprites[i].angle = frame.angles[i] * slowDownScale;
	}

	var offset = frame.center.mul(slowDownScale);
	this.sprites[PLAYER_TORSO].offsetBeforeRotation = new Vector(this.getCenter().x + offset.x * (this.facingRight ? -1 : 1), this.getCenter().y + offset.y);
	this.sprites[PLAYER_TORSO].flip = !this.facingRight;
};

Player.prototype.draw = function(c) {
	if(!this.isDead()) {
		if(this.isSuperJumping) {
			var alpha = Math.max(0, this.velocity.y / PLAYER_SUPER_JUMP_SPEED);
			c.strokeStyle = 'rgba(255, 255, 0, ' + alpha.toFixed(3) + ')';
			c.lineWidth *= 3;
			this.sprites[PLAYER_TORSO].draw(c);
			c.lineWidth /= 3;
		}

		c.fillStyle = (this.getPlayerIndex() == 0) ? 'red' : 'blue';
		c.strokeStyle = 'black';
		this.sprites[PLAYER_TORSO].draw(c);
	}
};
