function lerp(a, b, percent) {
	return a + (b - a) * percent;
}

function randInRange(a, b) {
	return lerp(a, b, Math.random());
}
