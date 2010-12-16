function CameraPanTool(worldCenter) {
	this.worldCenter = worldCenter;
	this.oldPoint = new Vector(0, 0);
}

CameraPanTool.prototype.mouseDown = function(point) {
	this.oldPoint = point;
};

CameraPanTool.prototype.mouseDragged = function(point) {
	// Cannot set this.worldCenter because that wouldn't modify the original object
	this.worldCenter.x -= point.x - this.oldPoint.x;
	this.worldCenter.y -= point.y - this.oldPoint.y;
};

CameraPanTool.prototype.mouseUp = function(point) {
};
