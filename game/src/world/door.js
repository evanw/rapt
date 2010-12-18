#require <class.js>

// enum DoorType
var ONE_WAY = 0;
var TWO_WAY = 1;


function Door(edge0, cellX0, cellY0, edge1, cellX1, cellY1) {
    this.cellX = [cellX0, cellX1];
    this.cellY = [cellY0, cellY1];
    this.edges = [edge0, edge1];
}

Door.prototype.doorExists = function(i, world) {
    if (this.edges[i] === null) {
        return false;
    }

    var cell = world.getCell(this.cellX[i], this.cellY[i]);

    return cell !== null && cell.getEdge(this.edges[i]) !== -1;
}

Door.prototype.doorPut = function(i, kill) {
    var world = gameState.world;

    if (this.edges[i] !== null && !this.doorExists(i, world)) {
        var cell = world.getCell(this.cellX[i], this.cellY[i]);
        if (cell === null) {
            return;
        }

        cell.addEdge(new Edge(this.edges[i].getStart(), this.edges[i].getEnd(), this.edges[i].color));

        if (kill) {
            gameState.killAll(this.edges[i]);
        }
    }
}

Door.prototype.doorRemove = function(i) {
    var world = gameState.world;

    if (this.edges[i] !== null && this.doorExists(i, world)) {
        var cell = world.getCell(this.cellX[i], this.cellY[i]);
        if (cell === null) {
            return;
        }

        cell.removeEdge(this.edges[i]);
    }
}


Door.prototype.act = function(behavior, force, kill) {
    var world = gameState.world;

    for (var i = 0; i < 2; ++i) {
        switch (behavior) {
        case DOORBELL_OPEN:
            this.doorRemove(i);
            break;
        case DOORBELL_CLOSE:
            this.doorPut(i, kill);
            break;
        case DOORBELL_TOGGLE:
            if(this.doorExists(i, world)) {
                this.doorRemove(i);
            } else
                this.doorPut(i, kill);
            break;
        }
    }
}
