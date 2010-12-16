#require <class.js>
#require <rotatingenemy.js>

var DOOM_MAGNET_RADIUS = .3;
var DOOM_MAGNET_ELASTICITY = 0.5;
var DOOM_MAGNET_RANGE = 10;
var DOOM_MAGNET_ACCEL = 2;

DoomMagnet.extends(RotatingEnemy);

function DoomMagnet(center) {
	RotatingEnemy.prototype.constructor.call(this, ENEMY_MAGNET, center, DOOM_MAGNET_RADIUS, 0, DOOM_MAGNET_ELASTICITY);
}

DoomMagnet.prototype.avoidsSpawn = function() { 
    return true;
};

DoomMagnet.prototype.calcHeadingVector = function(target) {
    if (target.isDead()) return new Vector(0, 0);
    var delta = target.getCenter().sub(this.getCenter());
    if (delta.lengthSquared() > (DOOM_MAGNET_RANGE * DOOM_MAGNET_RANGE)) return new Vector(0, 0);
    delta.normalize();
    return delta;
};

DoomMagnet.prototype.move = function(seconds) {
    var playerA = gameState.playerA;
    var playerB = gameState.playerB;

    var headingA = this.calcHeadingVector(playerA);
    var headingB = this.calcHeadingVector(playerB);
    var heading = (headingA.add(headingB)).mul(DOOM_MAGNET_ACCEL);

    var delta = this.accelerate(heading, seconds);
    this.velocity = this.velocity.mul(.994);

    var center = this.getCenter();
    var oldAngle = 0;
    //var oldAngle = bodySprite.getAngle() * (Math.PI / 180);
    var targetAngle = oldAngle;
    if(!playerA.isDead() && playerB.isDead()) {
        this.targetAngle = (playerA.getCenter().sub(center)).atan2() + Math.PI;
    } else if (playerA.isDead() && !playerB.isDead()) {
        this.targetAngle = (playerB.getCenter().sub(center)).atan2();
    } else if (!playerA.isDead() && !playerB.isDead()) {
        var needsFlip = (playerA.getCenter().sub(center).flip().dot(playerB.getCenter().sub(center)) < 0);
        this.targetAngle = heading.atan2() - Math.PI * 0.5 + Math.PI * needsFlip;
    }
    //bodySprite.SetAngle(adjustAngleToTarget(oldAngle, targetAngle, MAGNET_MAX_ROTATION * seconds) * (180 / M_PI));

    return delta;
};

DoomMagnet.prototype.afterTick = function(seconds) {
    var position = this.getCenter();
    //bodySprite.SetOffsetBeforeRotation(position.x, position.y);
};

DoomMagnet.prototype.draw = function(c) {
    var position = this.getCenter();
    c.fillRect(position.x - DOOM_MAGNET_RADIUS, position.y - DOOM_MAGNET_RADIUS, DOOM_MAGNET_RADIUS, DOOM_MAGNET_RADIUS);
};
