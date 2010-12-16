////////////////////////////////////////////////////////////////////////////////
// class SetCellCommand
////////////////////////////////////////////////////////////////////////////////

function SetCellCommand(world, x, y, type) {
	this.world = world;
	this.x = x;
	this.y = y;
	this.type = type;
	this.oldType = world.getCell(x, y);
}

SetCellCommand.prototype.undo = function() {
	this.world.setCell(this.x, this.y, this.oldType);
};

SetCellCommand.prototype.redo = function() {
	this.world.setCell(this.x, this.y, this.type);
};
