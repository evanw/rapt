function adjustAngleToTarget(currAngle, targetAngle, maxRotation) {
	if (targetAngle - currAngle > Math.PI) currAngle += 2 * Math.PI;
	else if (currAngle - targetAngle > Math.PI) currAngle -= 2 * Math.PI;

	var deltaAngle = targetAngle - currAngle;
	if (Math.abs(deltaAngle) > maxRotation)
		deltaAngle = (deltaAngle > 0 ? maxRotation : -maxRotation);
	currAngle += deltaAngle;
	currAngle -= Math.floor(currAngle / (2 * Math.PI)) * (2 * Math.PI);
	return currAngle;
}
