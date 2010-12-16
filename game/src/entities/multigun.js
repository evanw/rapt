#require <class.js>
#require <spawningenemy.js>

var MULTI_GUN_WIDTH = .5;
var MULTI_GUN_HEIGHT = .5;
var MULTI_GUN_SHOOT_FREQ = 1.25;
var MULTI_GUN_RANGE = 8;

MultiGun.extends(SpawningEnemy);

function MultiGun(center) {
	SpawningEnemy.prototype.constructor.call(this, ENEMY_MULTI_GUN, center, MULTI_GUN_WIDTH, MULTI_GUN_HEIGHT, 0, MULTI_GUN_SHOOT_FREQ, 0);

    this.redGun = null;
    this.blueGun = null;
    this.gunFired = new Array(4);
    this.gunPositions = new Array(4);
    
    this.redGun = this.getCenter();
    this.blueGun = this.getCenter();
    this.gunPositions[0] = this.hitBox.lowerLeft;
    this.gunPositions[1] = new Vector(this.hitBox.getRight(), this.hitBox.getBottom());
    this.gunPositions[2] = new Vector(this.hitBox.getLeft(), this.hitBox.getTop());
    this.gunPositions[3] = this.hitBox.lowerLeft.add(new Vector(this.hitBox.size, this.hitBox.size));
}

MultiGun.prototype.canCollide = function() {
	return false;
};

MultiGun.prototype.vectorToIndex = function(v) {
    var indexX = (v.x < 0) ? 0 : 1;
    var indexY = (v.y < 0) ? 0 : 2;
    return indexX + indexY;
};

MultiGun.prototype.spawn = function() {
    for (var i = 0; i < 4; ++i) {
        this.gunFired[i] = false;
    }

    var fired = false;
    for (var i = 0; i < 2; ++i) {
        var target = gameState.getPlayer(i);
        var index = this.vectorToIndex(target.getCenter().sub(this.getCenter()));
        var relPosition = target.getCenter().sub(this.gunPositions[index]);
        // Player must be alive and in range to be shot
        if (!target.isDead() && relPosition.lengthSquared() < (MULTI_GUN_RANGE * MULTI_GUN_RANGE) &&
            !CollisionDetector.lineOfSightWorld(this.gunPositions[index], target.getCenter(), gameState.world)) {
            console.log('spawning1');
            if (!this.gunFired[index]) {
                gameState.addEnemy(new Laser(this.gunPositions[index], relPosition.atan2()), this.gunPositions[index]);
                this.gunFired[index] = true;
                fired = true;
            }
        }
    }
    return fired;
};

MultiGun.prototype.afterTick = function(seconds) {
    var position = this.getCenter();
    var redGunTarget = this.gunPositions[this.vectorToIndex(gameState.playerA.getCenter().sub(position))];
    var blueGunTarget = this.gunPositions[this.vectorToIndex(gameState.playerB.getCenter().sub(position))];

    var speed = 4 * seconds;
    this.redGun.adjustTowardsTarget(redGunTarget, speed);
    this.blueGun.adjustTowardsTarget(blueGunTarget, speed);

    //bodySprite.SetOffsetBeforeRotation(position.x, position.y);
};

MultiGun.prototype.draw = function(c) {
    var position = this.getCenter();
    c.strokeStyle = "rgb(10, 20, 40)";
    c.strokeRect(position.x - MULTI_GUN_WIDTH, position.y - MULTI_GUN_HEIGHT, MULTI_GUN_WIDTH, MULTI_GUN_HEIGHT);
};
