


var HEADACHE_RADIUS = .15;
var HEADACHE_ELASTICITY = 0;
var HEADACHE_SPEED = 3;
var HEADACHE_RANGE = 6;

var CHANGE_GAZE_TIME = 2;

Headache.extends(HoveringEnemy);

function Headache(center, target) {
	HoveringEnemy.prototype.constructor.call(this, ENEMY_HEADACHE, center, HEADACHE_RADIUS, HEADACHE_ELASTICITY);

    this.target = target;
    this.isAttached = false;
    this.isTracking = false;
    this.restingOffset = new Vector(0, -10);
    this.timeUntilNewRestingOffset = randInRange(0, CHANGE_GAZE_TIME);
}

Headache.prototype.move = function(seconds) {
    this.isTracking = false;

    // If the headache isn't yet attached to a Player
    if (!this.isAttached) {
        if (this.target.isDead()) return new Vector(0, 0);
        var delta = this.target.getCenter().sub(this.getCenter());
        if (delta.lengthSquared() < (HEADACHE_RANGE * HEADACHE_RANGE) && !CollisionDetector.lineOfSightWorld(this.getCenter(), this.target.getCenter(), gameState.world)) {
            // Seeks the top of the Player, not the center
            delta.y += 0.5;
            // Multiply be 3 so it attaches more easily if its close to a player
            if (delta.lengthSquared() > (HEADACHE_SPEED * seconds * HEADACHE_SPEED * seconds * 3))
            {
                this.isTracking = true;
                delta.normalize();
                delta = delta.mul(HEADACHE_SPEED * seconds);
            } else {
                this.isAttached = true;
            }
            return delta;
        }
    } else {
        // If a headache is attached to a dead player, it vanishes
        if (this.target.isDead()) {
            this.setDead(true);
        }
        // Otherwise it moves with the player
        var delta = this.target.getCenter().add(new Vector(0, 0.5)).sub(this.getCenter());
        // If player is crouching, adjust position
        if (this.target.getCrouch() && this.target.isOnFloor())
        {
            delta.y -= 0.3;
            if (this.target.facingRight) delta.x += 0.15;
            else delta.x -= 0.15;
        }
        this.hitCircle.moveBy(delta);
    }
    return new Vector(0, 0);
};

Headache.prototype.reactToWorld = function() {
    // Nothing happens
};

Headache.prototype.onDeath = function() {
    gameState.incrementStat(STAT_ENEMY_DEATHS);
    
    var position = this.getCenter();

    // body
    var direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
    Particle().position(position).velocity(direction).radius(HEADACHE_RADIUS).bounces(3).elasticity(0.5).decay(0.01).circle().gravity(5);

    // eyes
    direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
    Particle().position(position.add(new Vector(-0.075, 0.075))).velocity(direction).radius(0.075).bounces(3).elasticity(0.5).decay(0.01).color(1, 1, 1, 1).circle().gravity(3);
    direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
    Particle().position(position.add(new Vector(0.075, 0.075))).velocity(direction).radius(0.075).bounces(3).elasticity(0.5).decay(0.01).color(1, 1, 1, 1).circle().gravity(1);

    // pupils
    direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
    Particle().position(position.add(new Vector(-0.075, 0.075))).velocity(direction).radius(0.0375).bounces(3).elasticity(0.5).decay(0.01).circle().gravity(4);
    direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(randInRange(0, 0.05));
    Particle().position(position.add(new Vector(0.075, 0.075))).velocity(direction).radius(0.0375).bounces(3).elasticity(0.5).decay(0.01).circle().gravity(2);
};

Headache.prototype.reactToPlayer = function(player) {
    if (player === this.target) {
        player.disableJump();
    } else if (player.getVelocity().y < 0 && player.getCenter().y > this.getCenter().y) {
        // The other player must jump on the headache from above to kill it
        this.setDead(true);
    }
};

Headache.prototype.getTarget = function() {
    return this.target === gameState.playerB;
};

Headache.prototype.afterTick = function(seconds) {
    // periodically update the resting gaze offset
    this.timeUntilNewRestingOffset -= seconds;
    if (this.timeUntilNewRestingOffset < 0)
    {
        this.restingOffset = Vector(randInRange(-5, 5), randInRange(-5, 5));
        this.timeUntilNewRestingOffset += CHANGE_GAZE_TIME;
    }

    //bodySprite.SetOffsetBeforeRotation(GetCenter().x, GetCenter().y);
};

Headache.prototype.draw = function(c) {
    var position = this.getCenter();

    c.fillStyle = 'black';
    c.fillRect(position.x - HEADACHE_RADIUS, position.y - HEADACHE_RADIUS, HEADACHE_RADIUS, HEADACHE_RADIUS)

    /*
    //bodySprite.Draw();

    if (this.target === gameState.playerA) glColor3ub(205, 0, 0);
    else glColor3ub(0, 0, 255);
    var leftEye = position.add(new Vector(-0.075, 0.075));
    var rightEye = position.add(new Vector(0.075, 0.075));
    var leftTarget = leftEye.add(restingOffset);
    var rightTarget = rightEye.add(restingOffset);
    if (this.isTracking || this.isAttached) leftTarget = rightTarget = this.target.getCenter();

    glPointSize(0.075f * 50);
    glBegin(GL_POINTS);
    glVertex2fv((leftEye + (leftTarget - leftEye).Unit() * 0.025f).xy);
    glVertex2fv((rightEye + (rightTarget - rightEye).Unit() * 0.025f).xy);
    glEnd();

    // draw the mouth
    glColor3ub(255, 255, 255);
    if (this.isAttached) {
        // smile
        glBegin(GL_LINE_STRIP);
        Arc(position.x, position.y, 0.125f, M_PI*1.25f, M_PI*1.75f);
        glEnd();
    } else if (this.isTracking) {
        // "o" shape
        glBegin(GL_LINE_STRIP);
        Arc(position.x, position.y - 0.1f, 0.05f, 0, 2*M_PI);
        glEnd();
    } else {
        // flat line
        glBegin(GL_LINES);
        glVertex2f(position.x - 0.1f, position.y - 0.1f);
        glVertex2f(position.x + 0.1f, position.y - 0.1f);
        glEnd();
    }
    */
};
