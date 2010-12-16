#require <game.js>

// module Main
(function(){
	var canvas;
	var context;
	var lastTime;
	var currentScreen;

	function tick() {
		var currentTime = new Date();
		var seconds = (currentTime - lastTime) / 1000;
		if(seconds > 0 && seconds < 1) currentScreen.tick(seconds); // if the computer goes to sleep, act like the game was paused
		currentScreen.draw(context);
		lastTime = currentTime;
	}

	function changeScreen(newScreen) {
		Particle.reset();
		currentScreen = newScreen;
		currentScreen.resize(canvas.width, canvas.height);
	}

	$(document).ready(function() {
		canvas = $('#canvas')[0];
		canvas.width = 800;
		canvas.height = 600;
		context = canvas.getContext('2d');
		lastTime = new Date();
		setInterval(tick, 1000 / 60);

		changeScreen(new Game());
	});

	$(document).keydown(function(e) {
        currentScreen.keyDown(e.which);
        // prevents default behaviors like scrolling up/down (F keys start at 112)
        if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
	});

	$(document).keyup(function(e) {
		currentScreen.keyUp(e.which);
        if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
	});
})();
