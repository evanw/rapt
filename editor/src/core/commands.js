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

SetCellCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetCellCommand && this.x == command.x && this.y == command.y && this.type == command.type) {
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function SetSelectionCommand(world, selection) {
	this.world = world;
	this.oldSelection = world.getSelection();
	this.selection = selection;
}

SetSelectionCommand.prototype.undo = function() {
	this.world.setSelection(this.oldSelection);
};

SetSelectionCommand.prototype.redo = function() {
	this.world.setSelection(this.selection);
};

SetSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetSelectionCommand) {
		this.selection = command.selection;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class AddPlaceableCommand
////////////////////////////////////////////////////////////////////////////////

function AddPlaceableCommand(world, placeable) {
	this.world = world;
	this.placeable = placeable;
}

AddPlaceableCommand.prototype.undo = function() {
	this.world.removePlaceable(this.placeable);
};

AddPlaceableCommand.prototype.redo = function() {
	this.world.addPlaceable(this.placeable);
};

////////////////////////////////////////////////////////////////////////////////
// class RemovePlaceableCommand
////////////////////////////////////////////////////////////////////////////////

function RemovePlaceableCommand(world, placeable) {
	this.world = world;
	this.placeable = placeable;
}

RemovePlaceableCommand.prototype.undo = function() {
	this.world.addPlaceable(this.placeable);
};

RemovePlaceableCommand.prototype.redo = function() {
	this.world.removePlaceable(this.placeable);
};

////////////////////////////////////////////////////////////////////////////////
// class MoveSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function MoveSelectionCommand(world, delta) {
	this.world = world;
	this.delta = delta;
	this.oldAnchors = [];
	this.selection = world.getSelection();
	for (var i = 0; i < this.selection.length; i++) {
		this.oldAnchors.push(this.selection[i].getAnchor());
	}
};

MoveSelectionCommand.prototype.undo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAnchor(this.oldAnchors[i]);
	}
};

MoveSelectionCommand.prototype.redo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAnchor(this.oldAnchors[i].add(this.delta));
	}
};

MoveSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof MoveSelectionCommand) {
		this.delta = this.delta.add(command.delta);
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerStartCommand
////////////////////////////////////////////////////////////////////////////////

function SetPlayerStartCommand(world, playerStart) {
	this.world = world;
	this.playerStart = playerStart;
	this.oldPlayerStart = world.playerStart;
}

SetPlayerStartCommand.prototype.undo = function() {
	this.world.playerStart = this.oldPlayerStart;
};

SetPlayerStartCommand.prototype.redo = function() {
	this.world.playerStart = this.playerStart;
};

SetPlayerStartCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetPlayerStartCommand) {
		this.playerStart = command.playerStart;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetPlayerGoalCommand
////////////////////////////////////////////////////////////////////////////////

function SetPlayerGoalCommand(world, playerGoal) {
	this.world = world;
	this.playerGoal = playerGoal;
	this.oldPlayerGoal = world.playerGoal;
}

SetPlayerGoalCommand.prototype.undo = function() {
	this.world.playerGoal = this.oldPlayerGoal;
};

SetPlayerGoalCommand.prototype.redo = function() {
	this.world.playerGoal = this.playerGoal;
};

SetPlayerGoalCommand.prototype.mergeWith = function(command) {
	if (command instanceof SetPlayerGoalCommand) {
		this.playerGoal = command.playerGoal;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class ToggleInitiallyOpenCommand
////////////////////////////////////////////////////////////////////////////////

function ToggleInitiallyOpenCommand(door) {
	this.door = door;
	this.isInitiallyOpen = door.isInitiallyOpen;
}

ToggleInitiallyOpenCommand.prototype.undo = function() {
	this.door.isInitiallyOpen = this.isInitiallyOpen;
};

ToggleInitiallyOpenCommand.prototype.redo = function() {
	this.door.isInitiallyOpen = !this.isInitiallyOpen;
};

////////////////////////////////////////////////////////////////////////////////
// class RotateSelectionCommand
////////////////////////////////////////////////////////////////////////////////

function RotateSelectionCommand(world, deltaAngle) {
	this.world = world;
	this.deltaAngle = deltaAngle;
	this.oldAngles = [];
	this.selection = world.getSelection();
	for (var i = 0; i < this.selection.length; i++) {
		this.oldAngles.push(this.selection[i].getAngle());
	}
}

RotateSelectionCommand.prototype.undo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAngle(this.oldAngles[i]);
	}
};

RotateSelectionCommand.prototype.redo = function() {
	for (var i = 0; i < this.selection.length; i++) {
		this.selection[i].setAngle(this.oldAngles[i] + this.deltaAngle);
	}
};

RotateSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof RotateSelectionCommand) {
		this.deltaAngle += command.deltaAngle;
		return true;
	}
	return false;
};

////////////////////////////////////////////////////////////////////////////////
// class SetSignTextCommand
////////////////////////////////////////////////////////////////////////////////

function SetSignTextCommand(sign, text) {
	this.sign = sign;
	this.text = text;
	this.oldText = sign.text;
}

SetSignTextCommand.prototype.undo = function() {
	this.sign.text = this.oldText;
};

SetSignTextCommand.prototype.redo = function() {
	this.sign.text = this.text;
};
