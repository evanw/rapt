// class EdgeQuad
function EdgeQuad() {
	this.nullifyEdges();
	this.quantities = [0, 0, 0, 0];
}

EdgeQuad.prototype.nullifyEdges = function() {
	this.edges = [null, null, null, null];
};

EdgeQuad.prototype.minimize = function(edge, quantity) {
	var orientation = edge.getOrientation();
	if(this.edges[orientation] == null || quantity < this.quantities[orientation]) {
		this.edges[orientation] = edge;
		this.quantities[orientation] = quantity;
	}
};

EdgeQuad.prototype.throwOutIfGreaterThan = function(minimum) {
	for(var i = 0; i < 4; i++) {
		if(this.quantities[i] > minimum) {
			this.edges[i] = null;
		}
	}
};

// this is a global because we only ever need one and allocations are expensive
var edgeQuad = new EdgeQuad();
