#require <class.js>
#require <enemy.js>

// enum
var DOORBELL_OPEN = 0;
var DOORBELL_CLOSE = 1;
var DOORBELL_TOGGLE = 2;

var DOORBELL_WIDTH = 0.4;
var DOORBELL_HEIGHT = 0.4;

Doorbell.extends(Enemy);

function Doorbell(center, behavior, visible) {
    Enemy.prototype.constructor.call(this, ENEMY_DOORBELL, 1);
    this.hitBox = AABB.makeAABB(center, DOORBELL_WIDTH, DOORBELL_HEIGHT);
    this.rotationPercent = 1;
    this.restingAngle = randInRange(0, 2*M_PI);
    this.behavior = behavior;
    this.visible = visible;
    this.triggeredLastTick = false;
    this.triggeredThisTick = false;
}

Doorbell.prototype.getShape = function() { return this.hitBox; }

//Doorbell.prototype.addDoor = function(doorIndex) { doors.push(doorIndex); }

Doorbell.prototype.canCollide = function() { return false; }

Doorbell.prototype.tick = function(seconds) {
    this.rotationPercent += seconds;
    if (this.rotationPercent > 1) {
        this.rotationPercent = 1;
    }

    this.triggeredThisTick = false;
    Enemy.prototype.tick.call(this, seconds);
    this.triggeredLastTick = this.triggeredThisTick;
}

Doorbell.prototype.reactToPlayer = function(player) {
    this.triggeredThisTick = true;
    if (this.triggeredLastTick) {
        return;
    }

    // TODO: Once we have doors
    //for (list<int>::iterator it = doors.begin(); it != doors.end(); it++) {
    //    gameState->GetDoor(*it)->Act(behavior, *gameState, false, true);
    //}

    for (var i = 0; i < 50; ++i) {
        var rotationAngle = randInRange(0, 2 * Math.PI);
        var direction = Vector.fromAngle(rotationAngle).mul(randInRange(3, 5));
        Particle().position(this.getCenter()).velocity(direction).radius(0.05).bounces(3).elasticity(0.5).decay(0.01).triangle().gravity(2).color(1, 1, 1, 1);
    }

    this.rotationPercent = 0;
}

Doorbell.prototype.draw = function(c) {
    this.getShape().draw(c);
}
