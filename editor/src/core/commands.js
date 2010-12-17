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

// Merge adjacent SetSelectionCommands so an entire selection
// set operation only adds one SetSelectionCommand
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

// Merge adjacent MoveSelectionCommands so an entire selection
// move operation only adds one MoveSelectionCommand
MoveSelectionCommand.prototype.mergeWith = function(command) {
	if (command instanceof MoveSelectionCommand) {
		this.delta = this.delta.add(command.delta);
		return true;
	}
	return false;
};
