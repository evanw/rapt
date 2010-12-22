// Need to use toFixed() so the negative exponent doesn't show up for small numbers
function rgba(r, g, b, a) {
	return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(5) + ')';
}

function randInRange(min, max) {
	return min + (max - min) * Math.random();
}

function dashedLine(c, start, end) {
	var dir = end.sub(start);
	var n = dir.length() * 10;
	dir = dir.div(n);
	c.beginPath();
	for (var i = 0; i + 1 < n; i += 2) {
		c.moveTo(start.x, start.y);
		start = start.add(dir);
		c.lineTo(start.x, start.y);
		start = start.add(dir);
	}
	if (i < n) {
		c.moveTo(start.x, start.y);
		start = start.add(dir.mul(n - i));
		c.lineTo(start.x, start.y);
	}
	c.stroke();
}
