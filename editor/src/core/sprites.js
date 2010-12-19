////////////////////////////////////////////////////////////////////////////////
// class Sprites
////////////////////////////////////////////////////////////////////////////////

function Sprites() {
}

Sprites.drawSpawnPoint = function(c, alpha, point) {
	c.strokeStyle = c.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.1).toFixed(5) + ')';
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	var gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (alpha * 0.75).toFixed(5) + ')');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	c.fillStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
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

	c.fillStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
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

Sprites.drawCog = function(c, alpha, x, y, radius) {
	var innerRadius = radius * 0.2;
	var spokeRadius = radius * 0.8;
	var spokeWidth1 = radius * 0.2;
	var spokeWidth2 = radius * 0.075;
	var numVertices = 64;
	var numTeeth = 10;
	var numSpokes = 5;
	var i, angle, sin, cos, r;
	
	c.fillStyle = 'rgba(255, 255, 0, ' + alpha.toFixed(5) + ')';
	
	// Draw the outer rim with teeth
	c.beginPath();
	for (i = 0; i <= numVertices; i++) {
		angle = (i + 0.25) / numVertices * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		r = radius * (1 + Math.cos(angle * numTeeth) * 0.1);
		c.lineTo(x + cos * r, y + sin * r);
	}
	c.closePath();
	
	// Draw the inner rim
	c.arc(x, y, radius * 0.65, 0, Math.PI * 2, true);
	c.closePath();
	
	// Draw the spokes
	for (i = 0; i < numSpokes; i++) {
		angle = i / numSpokes * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		c.moveTo(x + sin * spokeWidth1, y - cos * spokeWidth1);
		c.lineTo(x + cos * spokeRadius + sin * spokeWidth2, y + sin * spokeRadius - cos * spokeWidth2);
		c.lineTo(x + cos * spokeRadius - sin * spokeWidth2, y + sin * spokeRadius + cos * spokeWidth2);
		c.lineTo(x - sin * spokeWidth1, y + cos * spokeWidth1);
		c.closePath();
	}
	c.fill();
};

Sprites.drawBomber = function(c, alpha, reloadPercentage) {
	var bomberHeight = 0.4;
	var bombRadius = 0.15;
	
	// Bomber body
	c.strokeStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
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
	c.fillStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
	c.beginPath();
	c.arc(0, -bomberHeight * 0.5, bombRadius * reloadPercentage, 0, 2 * Math.PI, false);
	c.fill();
};

Sprites.drawBouncyRocketLauncher = function(c, alpha) {
   // End of gun
	var v = Math.sqrt(0.2*0.2 - 0.1*0.1);
	c.strokeStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
   c.beginPath();
   c.moveTo(-v, -0.1);
   c.lineTo(-0.3, -0.1);
   c.lineTo(-0.3, 0.1);
   c.lineTo(-v, 0.1);
   c.stroke();

   // Main body
   c.fillStyle = 'rgba(0, 0, 255, ' + alpha.toFixed(5) + ')';
   c.beginPath();
   c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, true);
   c.fill();
   c.fillStyle = 'rgba(255, 0, 0, ' + alpha.toFixed(5) + ')';
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
	   c.fillStyle = 'rgba(0, 0, 255, ' + alpha.toFixed(5) + ')';
		c.beginPath();
		c.moveTo(-outerRadius - length, scale * innerRadius);
		c.lineTo(-outerRadius - length, scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(-outerRadius - length + (outerRadius - innerRadius), scale * innerRadius);
		c.fill();

		// Draw blue tips
	   c.fillStyle = 'rgba(255, 0, 0, ' + alpha.toFixed(5) + ')';
		c.beginPath();
		c.moveTo(outerRadius + length, scale * innerRadius);
		c.lineTo(outerRadius + length, scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * outerRadius);
		c.lineTo(outerRadius + length - (outerRadius - innerRadius), scale * innerRadius);
		c.fill();
	}
	c.strokeStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';

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

Sprites.drawGrenadier = function(c, alpha) {
	var barrelLength = 0.25;
	var outerRadius = 0.25;
	var innerRadius = 0.175;

	c.fillStyle = 'rgba(255, 0, 0, ' + alpha.toFixed(5) + ')';
	c.strokeStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
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
	
	c.strokeStyle = 'rgba(0, 0, 0, ' + alpha.toFixed(5) + ')';
	c.beginPath();
	c.arc(0, -0.2, 0.1, 0, 2*Math.PI, false);
	c.stroke();
	
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
