// Particles are statically allocated in a big array so that creating a
// new particle doesn't need to allocate any memory (for speed reasons).
// To create one, call Particle(), which will return one of the elements
// in that array with all values reset to defaults.  To change a property
// use the function with the name of that property.  Some property functions
// can take two values, which will pick a random number between those numbers.
// Example:
//
// Particle().position(center).color(0.9, 0, 0, 0.5).mixColor(1, 0, 0, 1).gravity(1).triangle()
// Particle().position(center).velocity(velocity).color(0, 0, 0, 1).gravity(0.4, 0.6).circle()

// enum ParticleType
var PARTICLE_CIRCLE = 0;
var PARTICLE_TRIANGLE = 1;

function randOrTakeFirst(min, max) {
	return (typeof max !== 'undefined') ? randInRange(min, max) : min;
}

function cssRGBA(r, g, b, a) {
	return 'rgba(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' + Math.round(b * 255) + ', ' + a + ')';
}

// class Particle
function ParticleInstance() {
}

ParticleInstance.prototype.init = function() {
	// must use 'm_' here because many setting functions have the same name as their property
	this.m_bounces = 0;
	this.m_type = 0;
	this.m_red = 0;
	this.m_green = 0;
	this.m_blue = 0;
	this.m_alpha = 0;
	this.m_radius = 0;
	this.m_gravity = 0;
	this.m_elasticity = 0;
	this.m_decay = 1;
	this.m_expand = 1;
	this.m_position = new Vector(0, 0);
	this.m_velocity = new Vector(0, 0);
}

ParticleInstance.prototype.tick = function(seconds) {
	if(this.m_bounces < 0) {
		return false;
	}
	this.m_alpha *= Math.pow(this.m_decay, seconds);
	this.m_radius *= Math.pow(this.m_expand, seconds);
	this.m_velocity.y -= this.m_gravity * seconds;
	this.m_position = this.m_position.add(this.m_velocity.mul(seconds));
	if(this.m_alpha < 0.01) {
		this.m_bounces = -1;
	}
	return (this.m_bounces >= 0);
}

ParticleInstance.prototype.draw = function(c) {
	var color = cssRGBA(this.m_red, this.m_green, this.m_blue, this.m_alpha);
	c.fillStyle = cssRGBA(this.m_red, this.m_green, this.m_blue, this.m_alpha);
	switch(this.m_type) {
	case PARTICLE_CIRCLE:
		c.beginPath();
		c.arc(this.m_position.x, this.m_position.y, this.m_radius, 0, 2 * Math.PI, false);
		c.fill();
		break;

	case PARTICLE_TRIANGLE:
		var v1 = this.m_position.add(this.m_velocity.mul(0.04));
		var v2 = this.m_position.sub(this.m_velocity.flip().mul(0.01));
		var v3 = this.m_position.add(this.m_velocity.flip().mul(0.01));
		c.beginPath();
		c.moveTo(v1.x, v1.y);
		c.lineTo(v2.x, v2.y);
		c.lineTo(v3.x, v3.y);
		c.closePath();
		c.fill();
		break;
	}
}

// all of these functions support chaining to fix constructor with 200 arguments
ParticleInstance.prototype.bounces = function(min, max) { this.m_bounces = Math.round(randOrTakeFirst(min, max)); return this; }
ParticleInstance.prototype.circle = function() { this.m_type = PARTICLE_CIRCLE; return this; }
ParticleInstance.prototype.triangle = function() { this.m_type = PARTICLE_TRIANGLE; return this; }
ParticleInstance.prototype.color = function(r, g, b, a) {
	this.m_red = r;
	this.m_green = g;
	this.m_blue = b;
	this.m_alpha = a;
	return this;
}
ParticleInstance.prototype.mixColor = function(r, g, b, a) {
	var percent = Math.random();
	this.m_red = lerp(this.m_red, r, percent);
	this.m_green = lerp(this.m_green, g, percent);
	this.m_blue = lerp(this.m_blue, b, percent);
	this.m_alpha = lerp(this.m_alpha, a, percent);
	return this;
}
ParticleInstance.prototype.radius = function(min, max) { this.m_radius = randOrTakeFirst(min, max); return this; }
ParticleInstance.prototype.gravity = function(min, max) { this.m_gravity = randOrTakeFirst(min, max); return this; }
ParticleInstance.prototype.elasticity = function(min, max) { this.m_elasticity = randOrTakeFirst(min, max); return this; }
ParticleInstance.prototype.decay = function(min, max) { this.m_decay = randOrTakeFirst(min, max); return this; }
ParticleInstance.prototype.expand = function(min, max) { this.m_expand = randOrTakeFirst(min, max); return this; }
ParticleInstance.prototype.position = function(position) { this.m_position = position; return this; }
ParticleInstance.prototype.velocity = function(velocity) { this.m_velocity = velocity; return this; }

// wrap in anonymous function for private variables
var Particle = (function() {
	// particles is a circular buffer starting at firstParticle and ending right before
	// lastParticle, so if firstParticle == lastParticle then the particle buffer is empty
	var particles = new Array(3000);
	var firstParticle = 0;
	var lastParticle = 0;

	for(var i = 0; i < particles.length; i++) {
		particles[i] = new ParticleInstance();
	}

	function Particle() {
		gameState.incrementStat(STAT_NUM_PARTICLES);
		var particle = particles[lastParticle];
		lastParticle = (lastParticle + 1) % particles.length;
		if(firstParticle == lastParticle) {
			firstParticle = (firstParticle + 1) % particles.length;
		}
		particle.init();
		return particle;
	}

	Particle.reset = function() {
		firstParticle = lastParticle = 0;
	}

	Particle.tick = function(seconds) {
		// strip off all the particles that have died, from the start of the list
		for(; firstParticle != lastParticle; firstParticle = (firstParticle + 1) % particles.length)
			// if the first particle in our slice of the buffer is still alive, don't strip it off
			if(particles[firstParticle].tick(seconds))
				break;

		// loop through all of the particles in our slice of the circular buffer
		if(firstParticle != lastParticle)
			// add one because the first particle has already been ticked above
			for(var i = (firstParticle + 1) % particles.length; i != lastParticle; i = (i + 1) % particles.length)
				particles[i].tick(seconds);
	}

	Particle.draw = function(c) {
        for(var i = firstParticle; i != lastParticle; i = (i + 1) % particles.length) {
			particles[i].draw(c);
		}
	}

	return Particle;
})();
