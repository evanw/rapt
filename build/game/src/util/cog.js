var COG_ICON_TEETH_COUNT = 16;

function drawCog(c, x, y, radius, numTeeth, numSpokes, changeBlending, numVertices) {
	var innerRadius = radius * 0.2;
	var spokeRadius = radius * 0.8;
	var spokeWidth1 = radius * 0.125;
	var spokeWidth2 = radius * 0.05;

	for (var loop = 0; loop < 2; loop++) {
		// draw the vertices with zig-zags for triangle strips and outlines for line strip
		for (var iter = 0; iter <= loop; iter++) {
			c.beginPath();
			for (var i = 0; i <= numVertices; i++) {
				var angle = (i + 0.25) / numVertices * (2.0 * Math.PI);
				var s = Math.sin(angle);
				var csn = Math.cos(angle);
				var r1 = radius * 0.7;
				var r2 = radius * (1.0 + Math.cos(angle * numTeeth * 0.5) * 0.1);
				if (!loop || !iter) c.lineTo(csn * r1, s * r1);
				if (!loop || iter) c.lineTo(csn * r2, s * r2);
			}
			c.stroke();
		}
		for (var i = 0; i < numSpokes; i++) {
			var angle = i / numSpokes * (Math.PI * 2.0);
			var s = Math.sin(angle);
			var csn = Math.cos(angle);
			c.beginPath();
			c.lineTo(s * spokeWidth1, -csn * spokeWidth1);
			c.lineTo(-s * spokeWidth1, csn * spokeWidth1);
			c.lineTo(csn * spokeRadius - s * spokeWidth2, s * spokeRadius + csn * spokeWidth2);
			c.lineTo(csn * spokeRadius + s * spokeWidth2, s * spokeRadius - csn * spokeWidth2);
			c.fill();
		}
		/*c.beginPath();
		for (var i = 0; i <= numTeeth; i++) {
			var angle = i / numTeeth * (Math.PI * 2.0);
			var s = Math.sin(angle);
			var csn = Math.cos(angle);
			c.lineTo(csn * innerRadius, s * innerRadius);
		}
		c.fill();*/
	}
}

function drawCogIcon(c, x, y, time) {
	c.save();
	c.strokeStyle = 'rgb(255, 245, 0)';
	c.fillStyle = 'rgb(255, 245, 0)';

	c.translate(x, y);
	c.rotate(time * Math.PI / 2 + (time < 0 ? 2 * Math.PI / COG_ICON_TEETH_COUNT : 0));
	drawCog(c, 0, 0, COG_ICON_RADIUS, COG_ICON_TEETH_COUNT, 5, false, 64);
	c.restore();
}

function drawGoldenCog(c, x, y, time) {
	c.save();
	c.strokeStyle = 'rgb(255, 245, 0)';
	c.fillStyle = 'rgb(255, 245, 0)';

	c.translate(x, y);
	c.rotate(time * Math.PI / 2);
	drawCog(c, x, y, GOLDEN_COG_RADIUS, 16, 5, false, 64);
	c.restore();
}
