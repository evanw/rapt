#require <class.js>
#require <spawningenemy.js>

var GRENADIER_WIDTH = .5;
var GRENADIER_HEIGHT = .5;
// Max speed at which a Grenadier can throw an enemy
var GRENADIER_RANGE = 8
var GRENADIER_SHOOT_FREQ = 1.2;

Grenadier.subclasses(SpawningEnemy);

function Grenadier(center, target) {
	SpawningEnemy.prototype.constructor.call(this, ENEMY_GRENADIER, center, GRENADIER_WIDTH, GRENADIER_HEIGHT, 0, GRENADIER_SHOOT_FREQ, randInRange(0, GRENADIER_SHOOT_FREQ));

	this.target = target;
	this.actualRecoilDistance = 0;
	this.targetRecoilDistance = 0;

	this.bodySprite = new Sprite();
	this.bodySprite.drawGeometry = function(c) {
		var barrelLength = 0.25;
		var outerRadius = 0.25;
		var innerRadius = 0.175;

		c.beginPath();
		c.moveTo(-outerRadius, -barrelLength);
		c.lineTo(-innerRadius, -barrelLength);
		c.lineTo(-innerRadius, -0.02);
		c.lineTo(0, innerRadius);
		c.lineTo(innerRadius, -0.02);
		c.lineTo(innerRadius, -barrelLength);
		c.lineTo(outerRadius, -barrelLength);
		c.lineTo(outerRadius, 0);
		c.lineTo(0, outerRadius + 0.02);
		c.lineTo(-outerRadius, 0);
		c.closePath();
		c.fill();
		c.stroke();
	};
}

Grenadier.prototype.getTarget = function() {
	return this.target === gameState.GetPlayerB();
};

Grenadier.prototype.setTarget = function(player) {
	this.target = player;
};

Grenadier.prototype.canCollide = function() {
	return false;
};

Grenadier.prototype.spawn = function() {
	var targetDelta = this.target.getCenter().add(new Vector(0, 3)).sub(this.getCenter());
	var direction = targetDelta.atan2();
	var distance = targetDelta.length();
	// If Player is out of range or out of line of sight, don't throw anything
	if (!this.target.isDead() && distance < GRENADIER_RANGE) {
		if (!CollisionDetector.lineOfSightWorld(this.getCenter(), this.target.getCenter(), gameState.world)) {
			this.targetRecoilDistance = distance * (0.6 / GRENADIER_RANGE);
			gameState.addEnemy(new Grenade(this.getCenter(), direction, targetDelta.length()), this.getCenter());
			return true;
		}
	}
	return false;
};

Grenadier.prototype.afterTick = function(seconds) {
	var position = this.getCenter();
	if(!this.target.isDead()) {
		this.bodySprite.angle = this.target.getCenter().add(new Vector(0, 3)).sub(position).atan2() + Math.PI / 2;
	}
	this.bodySprite.offsetBeforeRotation = position;

	if (this.actualRecoilDistance < this.targetRecoilDistance) {
		this.actualRecoilDistance += 5 * seconds;
		if (this.actualRecoilDistance >= this.targetRecoilDistance) {
			this.actualRecoilDistance = this.targetRecoilDistance;
			this.targetRecoilDistance = 0;
		}
	} else {
		this.actualRecoilDistance -= 0.5 * seconds;
		if (this.actualRecoilDistance <= 0) {
			this.actualRecoilDistance = 0;
		}
	}

	this.bodySprite.offsetAfterRotation = new Vector(0, this.actualRecoilDistance);
};

Grenadier.prototype.draw = function(c) {
	c.fillStyle = (this.target == gameState.playerA) ? 'red' : 'blue';
	c.strokeStyle = 'black';
	this.bodySprite.draw(c);
};
