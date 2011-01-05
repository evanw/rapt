// class Camera
function Camera(playerA, playerB, width, height) {
	this.playerA = playerA;
	this.playerB = playerB;
	this.width = width;
	this.height = height;
}

Camera.prototype.draw = function(c, renderer) {
	var positionA = this.playerA.getCenter();
	var positionB = this.playerB.getCenter();
	var center = positionA.add(positionB).div(2);
	
	// maximum distance between a player and the center is the distance to the box that is half the size of the screen
	var temp = positionB.sub(positionA).unit();
	temp = new Vector(this.width / Math.abs(temp.x), this.height / Math.abs(temp.y));
	var maxLength = Math.min(temp.x, temp.y) / 4;

	var isSplit = (positionB.sub(positionA).length() > 2*maxLength);

	if(!isSplit) {
		renderer.render(c, center);
	} else {
		var AtoB = positionB.sub(positionA).unit().mul(99999);
		var split = AtoB.flip();

		// make sure a's center isn't more than maxLength from positionA
		var centerA = center.sub(positionA);
		if(centerA.length() > maxLength) centerA = centerA.unit().mul(maxLength);
		centerA = centerA.add(positionA);

		// make sure b's center isn't more than maxLength from positionB
		var centerB = center.sub(positionB);
		if(centerB.length() > maxLength) centerB = centerB.unit().mul(maxLength);
		centerB = centerB.add(positionB);

		// draw world from a's point of view
		c.save();
		c.beginPath();
		c.moveTo(-split.x, -split.y);
		c.lineTo(-split.x - AtoB.x, -split.y - AtoB.y);
		c.lineTo(split.x - AtoB.x, split.y - AtoB.y);
		c.lineTo(split.x, split.y);
		c.clip();
		renderer.render(c, centerA);
		c.restore();

		// draw world from b's point of view
		c.save();
		c.beginPath();
		c.moveTo(-split.x, -split.y);
		c.lineTo(-split.x + AtoB.x, -split.y + AtoB.y);
		c.lineTo(split.x + AtoB.x, split.y + AtoB.y);
		c.lineTo(split.x, split.y);
		c.clip();
		renderer.render(c, centerB);
		c.restore();

		// divide both player's view with a black line
		AtoB = positionB.sub(positionA);
		var splitSize = (AtoB.length() - 1.9 * maxLength) * 0.01;
		AtoB = AtoB.unit().mul(Math.min(splitSize, 0.1));
		c.fillStyle = 'black';
		c.beginPath();
		c.moveTo(-split.x - AtoB.x, -split.y - AtoB.x);
		c.lineTo(-split.x + AtoB.x, -split.y + AtoB.y);
		c.lineTo(split.x + AtoB.x, split.y + AtoB.y);
		c.lineTo(split.x - AtoB.x, split.y - AtoB.x);
		c.fill();
	}
}
