// class Vector
function Vector(x, y) {
	this.x = x;
	this.y = y;
}

// math operations
Vector.prototype.neg = function() { return new Vector(-this.x, -this.y); };
Vector.prototype.add = function(v) { return new Vector(this.x + v.x, this.y + v.y); };
Vector.prototype.sub = function(v) { return new Vector(this.x - v.x, this.y - v.y); };
Vector.prototype.mul = function(f) { return new Vector(this.x * f, this.y * f); };
Vector.prototype.div = function(f) { return new Vector(this.x / f, this.y / f); };
Vector.prototype.eq = function(v) { return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) < 0.001; };

// inplace operations
Vector.prototype.inplaceNeg = function() { this.x = -this.x; this.y = -this.y; };
Vector.prototype.inplaceAdd = function(v) { this.x += v.x; this.y += v.y; };
Vector.prototype.inplaceSub = function(v) { this.x -= v.x; this.y -= v.y; };
Vector.prototype.inplaceMul = function(f) { this.x *= f; this.y *= f; };
Vector.prototype.inplaceDiv = function(f) { this.x /= f; this.y /= f; };
Vector.prototype.inplaceFlip = function() { var t = this.x; this.x = this.y; this.y = -t; }; // turns 90 degrees right

// other functions
Vector.prototype.clone = function() { return new Vector(this.x, this.y); };
Vector.prototype.dot = function(v) { return this.x*v.x + this.y*v.y; };
Vector.prototype.lengthSquared = function() { return this.dot(this); };
Vector.prototype.length = function() { return Math.sqrt(this.lengthSquared()); };
Vector.prototype.unit = function() { return this.div(this.length()); };
Vector.prototype.normalize = function() { var len = this.length(); this.x /= len; this.y /= len; };
Vector.prototype.flip = function() { return new Vector(this.y, -this.x); }; // turns 90 degrees right
Vector.prototype.atan2 = function() { return Math.atan2(this.y, this.x); };
Vector.prototype.angleBetween = function(v) { return this.atan2() - v.atan2(); };
Vector.prototype.rotate = function(theta) { var s = Math.sin(theta), c = Math.cos(theta); return new Vector(this.x*c - this.y*s, this.x*s + this.y*c); };
Vector.prototype.minComponents = function(v) { return new Vector(Math.min(this.x, v.x), Math.min(this.y, v.y)); };
Vector.prototype.maxComponents = function(v) { return new Vector(Math.max(this.x, v.x), Math.max(this.y, v.y)); };
Vector.prototype.projectOntoAUnitVector = function(v) { return v.mul(this.dot(v)); };
Vector.prototype.toString = function() { return '(' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ')'; };
Vector.prototype.adjustTowardsTarget = function(target, maxDistance) {
	var v = ((target.sub(this)).lengthSquared() < maxDistance * maxDistance) ? target : this.add((target.sub(this)).unit().mul(maxDistance));
	this.x = v.x;
	this.y = v.y;
};

// static functions
Vector.fromAngle = function(theta) { return new Vector(Math.cos(theta), Math.sin(theta)); };
Vector.lerp = function(a, b, percent) { return a.add(b.sub(a).mul(percent)); };
