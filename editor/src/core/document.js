////////////////////////////////////////////////////////////////////////////////
// class Document
////////////////////////////////////////////////////////////////////////////////

function Document() {
	this.world = new World();
	this.undoStack = new UndoStack();
}

Document.prototype.setCell = function(x, y, type) {
	this.undoStack.push(new SetCellCommand(this.world, x, y, type));
};

Document.prototype.addPlaceable = function(placeable) {
	this.undoStack.push(new AddPlaceableCommand(this.world, placeable));
};

Document.prototype.removePlaceable = function(placeable) {
	this.undoStack.push(new RemovePlaceableCommand(this.world, placeable));
};

Document.prototype.setSelection = function(selection) {
	this.undoStack.push(new SetSelectionCommand(this.world, selection));
};

Document.prototype.moveSelection = function(delta) {
	this.undoStack.push(new MoveSelectionCommand(this.world, delta));
};
