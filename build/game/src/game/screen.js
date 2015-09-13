// abstract class Screen
function Screen() {
	this.tick = function(seconds) {}
	this.draw = function(c) {}
	this.resize = function(w, h) {}
	this.keyDown = function(key) {}
	this.keyUp = function(key) {}
}
