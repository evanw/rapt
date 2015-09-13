#require <vector.js>

// class Keyframe
function Keyframe(x, y) {
	this.center = new Vector(x, y);
	this.angles = [];
}

Keyframe.prototype.add = function(/* one or more angles */) {
	for(var i = 0; i < arguments.length; i++) {
		this.angles.push(arguments[i] * Math.PI / 180);
	}
	return this;
};

Keyframe.prototype.lerpWith = function(keyframe, percent) {
	var result = new Keyframe(
		lerp(this.center.x, keyframe.center.x, percent),
		lerp(this.center.y, keyframe.center.y, percent)
	);
	for(var i = 0; i < this.angles.length; i++) {
		result.angles.push(lerp(this.angles[i], keyframe.angles[i], percent));
	}
	return result;
};

Keyframe.lerp = function(keyframes, percent) {
	var lower = Math.floor(percent);
	percent -= lower;
	lower = lower % keyframes.length;
	var upper = (lower + 1) % keyframes.length;
	return keyframes[lower].lerpWith(keyframes[upper], percent);
};
