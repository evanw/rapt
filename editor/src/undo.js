////////////////////////////////////////////////////////////////////////////////
// class MacroCommand
////////////////////////////////////////////////////////////////////////////////

function MacroCommand() {
	this.commands = [];
}

MacroCommand.prototype.undo = function() {
	for (var i = this.commands.length - 1; i >= 0; i--) {
		this.commands[i].undo();
	}
};

MacroCommand.prototype.redo = function() {
	for (var i = 0; i < this.commands.length; i++) {
		this.commands[i].redo();
	}
};

////////////////////////////////////////////////////////////////////////////////
// class UndoStack
////////////////////////////////////////////////////////////////////////////////

function UndoStack() {
	this.macros = [];
	this.commands = [];
	this.currentIndex = 0;
	this.cleanIndex = 0;
}

UndoStack.prototype._push = function(command) {
	if (this.macros.length == 0) {
		this.commands = this.commands.slice(0, this.currentIndex);
		this.commands.push(command);
		this.currentIndex++;
	} else {
		this.macros[this.macros.length - 1].commands.push(command);
	}
};

UndoStack.prototype.push = function(command) {
	this._push(command);
	command.redo();
};

UndoStack.prototype.canUndo = function() {
	return this.macros.length == 0 && this.currentIndex > 0;
};

UndoStack.prototype.canRedo = function() {
	return this.macros.length == 0 && this.currentIndex < this.commands.length;
};

UndoStack.prototype.beginMacro = function() {
	this.macros.push(new MacroCommand());
};

UndoStack.prototype.endMacro = function() {
	this._push(this.macros.pop());
};

UndoStack.prototype.endAllMacros = function() {
	while (this.macros.length > 0) this.endMacro();
};

UndoStack.prototype.undo = function() {
	if (this.canUndo()) this.commands[--this.currentIndex].undo();
};

UndoStack.prototype.redo = function() {
	if (this.canRedo()) this.commands[this.currentIndex++].redo();
};

UndoStack.prototype.isClean = function() {
	return this.cleanIndex == this.currentIndex;
};

UndoStack.prototype.setClean = function() {
	this.cleanIndex = this.currentIndex;
};

UndoStack.prototype.clear = function() {
	this.macros.clear();
	this.commands.clear();
	this.currentIndex = this.cleanIndex = 0;
};
