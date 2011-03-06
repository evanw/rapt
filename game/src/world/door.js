#require <class.js>

// enum DoorType
var ONE_WAY = 0;
var TWO_WAY = 1;


function Door(edge0, edge1, cell0, cell1) {
	this.cells = [cell0, cell1];
	this.edges = [edge0, edge1];
}

Door.prototype.doorExists = function(i) {
	if (this.edges[i] === null) {
		return false;
	}

	var cell = this.cells[i];

	return cell !== null && cell.getEdge(this.edges[i]) !== -1;
}

Door.prototype.doorPut = function(i, kill) {
	if (this.edges[i] !== null && !this.doorExists(i)) {
		var cell = this.cells[i];
		if (cell === null) {
			return;
		}

		cell.addEdge(new Edge(this.edges[i].getStart(), this.edges[i].getEnd(), this.edges[i].color));

		if (kill) {
			gameState.killAll(this.edges[i]);
		}

		gameState.recordModification();
	}
}

Door.prototype.doorRemove = function(i) {
	if (this.edges[i] !== null && this.doorExists(i)) {
		var cell = this.cells[i];
		if (cell === null) {
			return;
		}

		cell.removeEdge(this.edges[i]);

		gameState.recordModification();
	}
}


Door.prototype.act = function(behavior, force, kill) {
	for (var i = 0; i < 2; ++i) {
		switch (behavior) {
		case DOORBELL_OPEN:
			this.doorRemove(i);
			break;
		case DOORBELL_CLOSE:
			this.doorPut(i, kill);
			break;
		case DOORBELL_TOGGLE:
			if(this.doorExists(i)) {
				this.doorRemove(i);
			} else
				this.doorPut(i, kill);
			break;
		}
	}
}
