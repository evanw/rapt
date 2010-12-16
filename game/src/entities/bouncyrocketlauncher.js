#require <class.js>
#require <spawningenemy.js>

var BOUNCY_LAUNCHER_WIDTH = .5;
var BOUNCY_LAUNCHER_HEIGHT = .5;
var BOUNCY_LAUNCHER_SHOOT_FREQ = 1;
var BOUNCY_LAUNCHER_RANGE = 8;

BouncyRocketLauncher.extends(SpawningEnemy);

function BouncyRocketLauncher(center, target) { 
     SpawningEnemy.prototype.constructor.call(this, ENEMY_BOUNCY_ROCKET_LAUNCHER, center, BOUNCY_LAUNCHER_WIDTH, BOUNCY_LAUNCHER_HEIGHT, 0, BOUNCY_LAUNCHER_SHOOT_FREQ, 0);
     this.target = target;
     this.canFire = true;
}

BouncyRocketLauncher.prototype.setTarget = function(player) { this.target = player; }

BouncyRocketLauncher.prototype.canCollide = function() { return false; }

BouncyRocketLauncher.prototype.rocketDestroyed = function() { this.canFire = true; }

BouncyRocketLauncher.prototype.getTarget = function() { return this.target === gameState.playerB; }

BouncyRocketLauncher.prototype.spawn = function() {
    if (this.canFire && !this.target.isDead()) {
        var targetDelta = this.target.getCenter().sub(this.getCenter());
        // If Player is out of range or out of line of sight, don't launch anything
        if (targetDelta.length() < BOUNCY_LAUNCHER_RANGE) {
            if (!CollisionDetector.lineOfSightWorld(this.getCenter(), this.target.getCenter(), gameState.world))
            {
                gameState.addEnemy(new BouncyRocket(this.getCenter(), this.target, targetDelta.atan2(), this), this.getCenter());
                this.canFire = false;
                return true;
            }
        }
    }
    return false;
}

BouncyRocketLauncher.prototype.afterTick = function(seconds) {
    var position = this.getCenter();
    //if (!target.isDead()) {
    //    bodySprite.SetAngle((position - target->GetCenter()).Atan2() * (180 / M_PI));
    //}
    //bodySprite.SetOffsetBeforeRotation(position.x, position.y);
}

BouncyRocketLauncher.prototype.draw = function(c) {
    this.getShape().draw(c);
}
