////////////////////////////////////////////////////////////////////////////////
// class Sprites
////////////////////////////////////////////////////////////////////////////////

function Sprites() {
}

Sprites.drawSpawnPoint = function(c, alpha, point) {
	// Outer bubble
	c.strokeStyle = c.fillStyle = rgba(255, 255, 255, alpha * 0.1);
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	// Glow from base
	var gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, rgba(255, 255, 255, alpha * 0.75));
	gradient.addColorStop(1, rgba(255, 255, 255, 0));
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	// Black base
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(point.x - 0.1, point.y - 0.45);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.45);
	c.arc(point.x, point.y - 0.45, 0.2, 0, Math.PI, true);
	c.fill();
};

Sprites.drawGoal = function(c, alpha, point, time) {
	var percent = time - Math.floor(time);
	percent = 1 - percent;
	percent = (percent - Math.pow(percent, 6)) * 1.72;
	percent = 1 - percent;

	// Draw four arrows pointing inwards
	c.fillStyle = rgba(0, 0, 0, alpha);
	for (var i = 0; i < 4; ++i) {
		var angle = i * (2 * Math.PI / 4);
		var s = Math.sin(angle);
		var csn = Math.cos(angle);
		var radius = 0.45 - percent * 0.25;
		var size = 0.15;
		c.beginPath();
		c.moveTo(point.x + csn * radius - s * size, point.y + s * radius + csn * size);
		c.lineTo(point.x + csn * radius + s * size, point.y + s * radius - csn * size);
		c.lineTo(point.x + csn * (radius - size), point.y + s * (radius - size));
		c.fill();
	}
};

Sprites.drawCog = function(c, alpha, radius) {
	var innerRadius = radius * 0.2;
	var spokeRadius = radius * 0.8;
	var spokeWidth1 = radius * 0.2;
	var spokeWidth2 = radius * 0.075;
	var numVertices = 64;
	var numTeeth = 10;
	var numSpokes = 5;
	var i, angle, sin, cos, r;
	
	c.fillStyle = rgba(255, 255, 0, alpha);
	
	// Draw the outer rim with teeth
	c.beginPath();
	for (i = 0; i <= numVertices; i++) {
		angle = (i + 0.25) / numVertices * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		r = radius * (1 + Math.cos(angle * numTeeth) * 0.1);
		c.lineTo(cos * r, sin * r);
	}
	c.closePath();
	
	// Draw the inner rim
	c.arc(0, 0, radius * 0.65, 0, Math.PI * 2, true);
	c.closePath();
	
	// Draw the spokes
	for (i = 0; i < numSpokes; i++) {
		angle = i / numSpokes * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		c.moveTo(sin * spokeWidth1, -cos * spokeWidth1);
		c.lineTo(cos * spokeRadius + sin * spokeWidth2, sin * spokeRadius - cos * spokeWidth2);
		c.lineTo(cos * spokeRadius - sin * spokeWidth2, sin * spokeRadius + cos * spokeWidth2);
		c.lineTo(-sin * spokeWidth1, cos * spokeWidth1);
		c.closePath();
	}
	c.fill();
};

Sprites.drawBomber = function(c, alpha, reloadPercentage) {
	var bomberHeight = 0.4;
	var bombRadius = 0.15;
	
	c.save();
	c.translate(0, 0.05);
	
	// Bomber body
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-0.25, -0.2);
	c.lineTo(-0.25, -0.1);
	c.lineTo(-0.1, 0.05);
	c.lineTo(0.1, 0.05);
	c.lineTo(0.25, -0.1);
	c.lineTo(0.25, -0.2);
	c.arc(0, -bomberHeight * 0.5, bombRadius, 0, Math.PI, false);
	c.lineTo(-0.25, -0.2);
	c.moveTo(-0.1, 0.05);
	c.lineTo(-0.2, 0.15);
	c.moveTo(0.1, 0.05);
	c.lineTo(0.2, 0.15);
	c.stroke();

	// Growing bomb about to be dropped
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, -bomberHeight * 0.5, bombRadius * reloadPercentage, 0, 2 * Math.PI, false);
	c.fill();
	
	c.restore();
};

Sprites.drawBouncyRocketLauncher = function(c, alpha, redIsFirst) {
   // End of gun
	var v = Math.sqrt(0.2*0.2 - 0.1*0.1);
	c.strokeStyle = rgba(0, 0, 0, alpha);
   c.beginPath();
   c.moveTo(-v, -0.1);
   c.lineTo(-0.3, -0.1);
   c.lineTo(-0.3, 0.1);
   c.lineTo(-v, 0.1);
   c.stroke();

   // Main body
   c.fillStyle = rgba(255 * redIsFirst, 0, 255 * !redIsFirst, alpha);
   c.beginPath();
   c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, true);
   c.fill();
   c.fillStyle = rgba(255 * !redIsFirst, 0, 255 * redIsFirst, alpha);
   c.beginPath();
   c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, false);
   c.fill();

	// Line circling the two colors
   c.beginPath();
   c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
   c.stroke();

	// Line separating the two colors
   c.beginPath();
   c.moveTo(Math.cos(1.65 * Math.PI) * 0.2, Math.sin(1.65 * Math.PI) * 0.2);
   c.lineTo(Math.cos(2.35 * Math.PI) * 0.2, Math.sin(2.35 * Math.PI) * 0.2);
   c.stroke();
};

Sprites.drawDoomMagnet = function(c, alpha) {
	var length = 0.15;
	var outerRadius = 0.15;
	var innerRadius = 0.05;

	for (var scale = -1; scale <= 1; scale += 2) {
		// Draw red tips
	   c.fillStyle = rgba(0, 0, 255, alpha);
		c.beginPath();
		c.moveTo(-outerRadius - length, scale * innerRadius);
		c.lineTo(-outerRadius - length, scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * innerRadius);
		c.fill();

		// Draw blue tips
	   c.fillStyle = rgba(255, 0, 0, alpha);
		c.beginPath();
		c.moveTo(outerRadius + length, scale * innerRadius);
		c.lineTo(outerRadius + length, scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * innerRadius);
		c.fill();
	}
	c.strokeStyle = rgba(0, 0, 0, alpha);

	// Draw one prong of the magnet
	c.beginPath();
	c.arc(outerRadius, 0, outerRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
	c.lineTo(outerRadius + length, outerRadius);
	c.lineTo(outerRadius + length, innerRadius);

	c.arc(outerRadius, 0, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI, false);
	c.lineTo(outerRadius + length, -innerRadius);
	c.lineTo(outerRadius + length, -outerRadius);
	c.lineTo(outerRadius, -outerRadius);
	c.stroke();

	// Draw other prong
	c.beginPath();
	c.arc(-outerRadius, 0, outerRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
	c.lineTo(-outerRadius - length, outerRadius);
	c.lineTo(-outerRadius - length, innerRadius);

	c.arc(-outerRadius, 0, innerRadius, 2.5 * Math.PI, 1.5 * Math.PI, true);
	c.lineTo(-outerRadius - length, -innerRadius);
	c.lineTo(-outerRadius - length, -outerRadius);
	c.lineTo(-outerRadius, -outerRadius);
	c.stroke();
};

Sprites.drawGrenadier = function(c, alpha, isRed) {
	var barrelLength = 0.25;
	var outerRadius = 0.25;
	var innerRadius = 0.175;

	// Draw a 'V' shape
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
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

Sprites.drawHunter = function(c, alpha) {
	function drawClaw(c) {
		c.beginPath();
		c.moveTo(0, 0.1);
		for(var i = 0; i <= 6; i++) {
			c.lineTo((i & 1) / 24, 0.2 + i * 0.05);
		}
		c.arc(0, 0.2, 0.3, 0.5*Math.PI, -0.5*Math.PI, true);
		c.stroke();
	}
	
	// Draw the eye
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, -0.2, 0.1, 0, 2*Math.PI, false);
	c.stroke();
	
	// Draw the claws
	var clawAngle = 0.1;
	c.save();
	c.translate(0, -0.2);
	c.rotate(-clawAngle);
	drawClaw(c);
	c.rotate(2 * clawAngle);
	c.scale(-1, 1);
	drawClaw(c);
	c.restore();
};

function drawLeg(c, x, y, angle1, angle2, legLength) {
	angle1 *= Math.PI / 180;
	angle2 = angle1 + angle2 * Math.PI / 180;
	var kneeX = x + Math.sin(angle1) * legLength;
	var kneeY = y - Math.cos(angle1) * legLength;
	
	// Draw leg with one joint
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(kneeX, kneeY);
	c.lineTo(kneeX + Math.sin(angle2) * legLength, kneeY - Math.cos(angle2) * legLength);
	c.stroke();
}

Sprites.drawPopper = function(c, alpha) {
	function drawBody(c, x, y) {
		c.save();
		c.translate(x, y);
		
		// Draw shell
		c.beginPath();
		c.moveTo(0.2, -0.2);
		c.lineTo(-0.2, -0.2);
		c.lineTo(-0.3, 0);
		c.lineTo(-0.2, 0.2);
		c.lineTo(0.2, 0.2);
		c.lineTo(0.3, 0);
		c.lineTo(0.2, -0.2);
		c.moveTo(0.15, -0.15);
		c.lineTo(-0.15, -0.15);
		c.lineTo(-0.23, 0);
		c.lineTo(-0.15, 0.15);
		c.lineTo(0.15, 0.15);
		c.lineTo(0.23, 0);
		c.lineTo(0.15, -0.15);
		c.stroke();

		// Draw eyes
		c.beginPath();
		c.arc(-0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.arc(0.075, 0, 0.04, 0, 2*Math.PI, false);
		c.fill();
		
		c.restore();
	}
	
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	drawBody(c, 0, 0.1);
	drawLeg(c, -0.2, -0.1, -80, 100, 0.3);
	drawLeg(c, -0.1, -0.1, -80, 100, 0.3);
	drawLeg(c, 0.1, -0.1, 80, -100, 0.3);
	drawLeg(c, 0.2, -0.1, 80, -100, 0.3);
};

var cloudCircles = [];
for (var i = 0; i < 50; i++) {
	var angle = randInRange(0, Math.PI * 2);
	var radius = Math.sqrt(Math.random()) * 0.4;
	cloudCircles.push({
		centerX: Math.cos(angle) * radius,
		centerY: Math.sin(angle) * radius,
		radius: randInRange(0.05, 0.15),
		alpha: randInRange(0.1, 0.5)
	});
}

Sprites.drawCloud = function(c, alpha, isRed) {
	// Draw particles
	for (var i = 0; i < 50; i++) {
		c.fillStyle = rgba(127 * isRed, 0, 127 * !isRed, alpha * cloudCircles[i].alpha);
		c.beginPath();
		c.arc(cloudCircles[i].centerX, cloudCircles[i].centerY, cloudCircles[i].radius, 0, Math.PI * 2, false);
		c.fill();
	}
};

Sprites.drawShockHawk = function(c, alpha, isRed) {
	// Draw solid center
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.beginPath();
	c.moveTo(0, -0.15);
	c.lineTo(0.05, -0.1);
	c.lineTo(0, 0.1);
	c.lineTo(-0.05, -0.1);
	c.fill();

	// Draw outlines
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (var scale = -1; scale <= 1; scale += 2) {
		c.moveTo(0, -0.3);
		c.lineTo(scale * 0.05, -0.2);
		c.lineTo(scale * 0.1, -0.225);
		c.lineTo(scale * 0.1, -0.275);
		c.lineTo(scale * 0.15, -0.175);
		c.lineTo(0, 0.3);

		c.moveTo(0, -0.15);
		c.lineTo(scale * 0.05, -0.1);
		c.lineTo(0, 0.1);
	}
	c.stroke();
};

Sprites.drawStalacbat = function(c, alpha, isRed) {
	function drawWing(c) {
		var r = Math.sin(Math.PI / 4);
		c.beginPath();
		c.arc(0, 0, 0.2, 0, Math.PI / 2, false);
		c.arc(0, 0, 0.15, Math.PI / 2, 0, true);
		c.closePath();
		c.moveTo(r * 0.15, r * 0.15);
		c.lineTo(r * 0.1, r * 0.1);
		c.stroke();
	}
	
	// Draw body
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, Math.PI * 2 , false);
	c.fill();
	c.stroke();

	// Draw wings
	var wingAngle = Math.PI / 2;
	c.save();
	c.rotate(-wingAngle);
	drawWing(c);
	c.rotate(2 * wingAngle);
	c.scale(-1, 1);
	drawWing(c);
	c.restore();
};

Sprites.drawWallAvoider = function(c, alpha, isRed) {
	// Draw body
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();
	
	// Draw antennae
	c.beginPath();
	for (var i = 0; i < 4; i++)
	{
		var angle = i * (2 * Math.PI / 4);
		var cos = Math.cos(angle), sin = Math.sin(angle);
		c.moveTo(cos * 0.1, sin * 0.1);
		c.lineTo(cos * 0.3, sin * 0.3);
		c.moveTo(cos * 0.16 - sin * 0.1, sin * 0.16 + cos * 0.1);
		c.lineTo(cos * 0.16 + sin * 0.1, sin * 0.16 - cos * 0.1);
		c.moveTo(cos * 0.23 - sin * 0.05, sin * 0.23 + cos * 0.05);
		c.lineTo(cos * 0.23 + sin * 0.05, sin * 0.23 - cos * 0.05);
	}
	c.stroke();
};

Sprites.drawWallCrawler = function(c, alpha) {
	// Draw arms
	var space = 0.15;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.25 + space, Math.PI * 0.75 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 0.75 + space, Math.PI * 1.25 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.25 + space, Math.PI * 1.75 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.25, Math.PI * 1.75 + space, Math.PI * 2.25 - space, false); c.stroke();
	c.beginPath(); c.arc(0, 0, 0.15, 0, 2 * Math.PI, false); c.stroke();
	c.beginPath();
	c.moveTo(0.15, 0); c.lineTo(0.25, 0);
	c.moveTo(0, 0.15); c.lineTo(0, 0.25);
	c.moveTo(-0.15, 0); c.lineTo(-0.25, 0);
	c.moveTo(0, -0.15); c.lineTo(0, -0.25);
	c.stroke();
	
	// Draw bodt
	c.beginPath();
	c.arc(0, 0, 0.05, 0, 2 * Math.PI, false);
	c.fill();
};

Sprites.drawWheeligator = function(c, alpha) {
	// Draw wheel
	var radius = 0.3;
	var rim = 0.1;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, radius, 0, 2 * Math.PI, false);
	c.arc(0, 0, radius - rim, Math.PI, 3 * Math.PI, false);
	c.stroke();

	// Fill in notches on wheel
	for (var i = 0; i < 4; i++) {
		var startAngle = i * (2 * Math.PI / 4);
		var endAngle = startAngle + Math.PI / 4;
		c.beginPath();
		c.arc(0, 0, radius, startAngle, endAngle, false);
		c.arc(0, 0, radius - rim, endAngle, startAngle, true);
		c.fill();
	}
};

function makeDrawSpikes(count) {
	var spikeBallRadius = 0.2;
	var radii = [];
	for (var i = 0; i < count; i++) {
		radii.push(spikeBallRadius * randInRange(0.5, 1.5));
	}
	return function(c) {
		c.beginPath();
		for (var i = 0; i < count; i++) {
			var angle = i * (2 * Math.PI / count);
			var radius = radii[i];
			c.moveTo(0, 0);
			c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
		}
		c.stroke();
	};
}

var spikeDrawFuncs = [
	makeDrawSpikes(11),
	makeDrawSpikes(13),
	makeDrawSpikes(7)
];

Sprites.drawSpikeBall = function(c, alpha) {
	c.strokeStyle = rgba(0, 0, 0, alpha);
	spikeDrawFuncs[0](c);
	spikeDrawFuncs[1](c);
	spikeDrawFuncs[2](c);
};

Sprites.drawRiotGun = function(c, alpha, reloadAnimation, directionAngle) {
	function drawWheel() {
		var numBarrels = 3;
		c.beginPath();
		for (var i = 0; i < numBarrels; i++) {
			var angle = i * (2 * Math.PI / numBarrels);
			c.moveTo(0, 0);
			c.lineTo(0.2 * Math.cos(angle), 0.2 * Math.sin(angle));
		}
		c.stroke();
	}
	
	var numBarrels = 3;
	var angle = reloadAnimation * (2 * Math.PI / numBarrels);
	var targetAngle = directionAngle - Math.PI / 2;
	var bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);
	
	c.fillStyle = rgba(255, 255, 0, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	
	c.save();
	c.translate(-0.2, 0);
	c.rotate(targetAngle + angle);
	drawWheel();
	c.restore();
	
	c.save();
	c.translate(0.2, 0);
	c.rotate(targetAngle - angle);
	drawWheel();
	c.restore();
	
	for (var side = -1; side <= 1; side += 2)
	{
		for (var i = 0; i < numBarrels; i++)
		{
			var theta = i * (2 * Math.PI / numBarrels) - side * angle;
			var reload = (reloadAnimation - i * side) / numBarrels + (side == 1) * 0.5;
			var pos = bodyOffset.mul(side).add(bodyOffset.rotate(theta));
			reload -= Math.floor(reload);
			c.beginPath();
			c.arc(pos.x, pos.y, 0.1 * reload, 0, 2 * Math.PI, false);
			c.fill();
			c.stroke();
		}
	}
};

Sprites.drawMultiGun = function(c, alpha) {
	var w = 0.25;
	var h = 0.25;
	var r = 0.1;

	c.strokeStyle = rgba(0, 0, 0, alpha);
	for (var a = -1; a <= 1; a += 2) {
		for (var b = -1; b <= 1; b += 2) {
			// Draw edge
			c.beginPath();
			c.moveTo(-w, h * a + r * b);
			c.lineTo(w, h * a + r * b);
			c.moveTo(w * a + r * b, -h);
			c.lineTo(w * a + r * b, h);
			c.stroke();
			
			// Draw gun
			c.beginPath();
			c.arc(w * a, h * b, r, 0, Math.PI * 2, false);
			c.stroke();
		}
	}
};

Sprites.drawSpider = function(c, alpha) {
	c.save();
	c.translate(0, 0.51);
	
	// Draw body
	var i, radius, angle;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (i = 0; i <= 21; i++)
	{
		angle = (0.25 + 0.5 * i / 21) * Math.PI;
		radius = 0.6 + 0.05 * (i & 2);
		c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius - 0.5);
	}
	c.arc(0, -0.5, 0.5, Math.PI * 0.75, Math.PI * 0.25, true);
	c.fill();
	
	// Draw legs
	var w = 0.9;
	drawLeg(c, w * 0.35, 0, -10, 70, 0.5);
	drawLeg(c, w * 0.15, 0, 10, 20, 0.5);
	drawLeg(c, w * -0.05, 0, -10, 20, 0.5);
	drawLeg(c, w * -0.25, 0, -20, 10, 0.5);
	drawLeg(c, w * 0.25, 0, -10, 20, 0.5);
	drawLeg(c, w * 0.05, 0, -20, 10, 0.5);
	drawLeg(c, w * -0.15, 0, -10, 70, 0.5);
	drawLeg(c, w * -0.35, 0, 10, 20, 0.5);
	
	c.restore();
};

Sprites.drawButton = function(c, alpha) {
	var buttonSlices = 3;
	var buttonRadius = 0.11;
	
   c.fillStyle = rgba(255, 255, 255, alpha);
   c.strokeStyle = rgba(0, 0, 0, alpha);
   c.beginPath();
   c.arc(0, 0, buttonRadius, 0, 2 * Math.PI, false);
   c.fill();
   c.stroke();

   c.beginPath();
   for (var i = 0; i < buttonSlices; i++) {
       c.moveTo(0, 0);
       var nextPos = Vector.fromAngle(i * (2 * Math.PI / buttonSlices)).mul(buttonRadius);
       c.lineTo(nextPos.x, nextPos.y);
   }
   c.stroke();
};

var headachePoints = [];
for (var i = 0; i < 50; i++) {
	var angle = randInRange(0, Math.PI * 2);
	var radius = Math.sqrt(Math.random()) * 0.3;
	headachePoints.push({
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius
	});
}

Sprites.drawHeadache = function(c, alpha, isRed) {
	var headacheRadius = 0.15 * 0.75;
	
	// draw the ache
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (var i = 0; i < headachePoints.length; i++) {
		var p = headachePoints[i];
		c.lineTo(p.x, p.y);
	}
	c.stroke();
	
	// draw the head
	c.fillStyle = rgba(255 * isRed, 0, 255 * !isRed, alpha);
	c.beginPath();
	c.arc(0, 0, headacheRadius, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();
};

Sprites.drawSign = function(c, alpha, text) {
	c.save();
	c.textAlign = "center";
	c.scale(1 / 50, -1 / 50);
	c.lineWidth *= 50;
	
	c.save();
	c.font = "bold 34px sans-serif";
	c.fillStyle = "yellow";
	c.strokeStyle = "black";
	c.translate(0, 12);
	c.fillText('?', 0, 0);
	c.strokeText('?', 0, 0);
	c.restore();
	
	var textArray = splitUpText(c, text);
	var fontSize = 13;
	var xCenter = 0;
	var yCenter = -0.5 * 50 - (fontSize + 2) * textArray.length / 2;
	drawTextBox(c, textArray, xCenter, yCenter, fontSize);
	
	c.restore();
};
