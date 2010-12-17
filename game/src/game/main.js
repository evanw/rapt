#require <game.js>

var ESCAPE_KEY = 27;
var SPACEBAR = 32;

// module Main
(function(){
	var canvas;
	var context;
	var lastTime;
	var currentScreen;
    var currentHash;

	function tick() {
        // Poll for hash changes
        if (currentHash !== location.hash) {
            currentHash = location.hash;
            processHash(currentHash);
        }

        // Draw the screen if the canvas is shown
        if (currentScreen !== null) {
            var currentTime = new Date();
            var seconds = (currentTime - lastTime) / 1000;
            // if the computer goes to sleep, act like the game was paused
            if (seconds > 0 && seconds < 1) currentScreen.tick(seconds); 
            currentScreen.draw(context);
            lastTime = currentTime;
        }
	}

    function processHash(hash) {
        if (hash.split('/').length === 3) {
            // #/[User]/
            showLevelScreen();
        } else if (hash.split('/').length === 4) {
            // #/[User]/[Level]/
            showGameScreen();
        }
    }

    function showLevelScreen() {
        $('#canvas').hide();
        $('#levels').show();
        currentScreen = null;
    }

    function showGameScreen() {
        $('#levels').hide();
        $('#canvas').show();
        changeScreen(new Game());
    }

	function changeScreen(newScreen) {
		Particle.reset();
		currentScreen = newScreen;
		currentScreen.resize(canvas.width, canvas.height);
	}

	$(document).ready(function() {
        // first set up the level menu links
        $('#levels').hide();
        // Pretend we're playing a real level already
        location.hash = '#/Evan/Level-0/';
        currentHash = location.hash;

        // then set up the canvas
		canvas = $('#canvas')[0];
		canvas.width = 800;
		canvas.height = 600;
		context = canvas.getContext('2d');
		lastTime = new Date();
		setInterval(tick, 1000 / 60);

		changeScreen(new Game());
	});

	$(document).keydown(function(e) {
        if (currentScreen !== null) {
            if (e.which === SPACEBAR) {
                if (currentScreen.gameStatus === GAME_LOST) {
                    // if the level is being restarted, change the screen to a new Game
                    changeScreen(new Game());
                } else if (currentScreen.gameStatus === GAME_WON) {
                    // if the user is going to the next level, load the next level using the level select page
                    changeScreen(new Game());
                }
            } else if (e.which === ESCAPE_KEY) {
                // escape returns the player to the level select page
                // Assumes URL in format #/[User]/[Level]
                location.hash = "/" + location.hash.split("/", 2)[1] + "/";
                showLevelScreen();
                return;
            }

            currentScreen.keyDown(e.which);
            // prevents default behaviors like scrolling up/down (F keys start at 112)
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
        }
	});

	$(document).keyup(function(e) {
        if (currentScreen !== null) {
            currentScreen.keyUp(e.which);
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
        }
	});
})();
