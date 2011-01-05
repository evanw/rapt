#require <game.js>

var ESCAPE_KEY = 27;
var SPACEBAR = 32;

function getMenuURL() {
	var usernameAndLevel = location.hash.substr(1); // remove the leading '#'
	return 'http://' + location.host + '/users' + usernameAndLevel;
}

function ajaxGetMenu(onSuccess) {
	function showError() {
		$('#loadingScreen').html('Could not load level from<br><b>' + getMenuURL() + '</b>');
	}
	
	$.ajax({
		url: getMenuURL(),
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: function(data, status, request) {
			if (data != null) {
				onSuccess(data);
			} else {
				showError();
			}
		},
		error: function(request, status, error) {
			showError();
		}
	});
}

// module Main
(function(){
	var canvas;
	var context;
	var lastTime;
	var currentScreen = null;
    var currentHash;
    var levels = new Array();

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
            showLoadingScreen();
			ajaxGetMenu(function(json) {
				showGameScreen();
				gameState.loadLevelFromJSON(JSON.parse(json.level.data));
			});
        }
    }

    function showLevelScreen() {
        $('#canvas').hide();
        $('#levelScreen').show();
        $('#loadingScreen').hide();
        currentScreen = null;
    }

    function showGameScreen() {
        $('#canvas').show();
        $('#levelScreen').hide();
        $('#loadingScreen').hide();
        changeScreen(new Game());
    }

	function showLoadingScreen() {
        $('#canvas').hide();
        $('#levelScreen').hide();
        $('#loadingScreen').show();
        currentScreen = null;
		
		$('#loadingScreen').html('Loading...');
	}

	function changeScreen(newScreen) {
		Particle.reset();
		currentScreen = newScreen;
		currentScreen.resize(canvas.width, canvas.height);
	}

    function getLevels() {
        // Boop boop, pretend we are getting levels from the server
        levels.push('#/rapt/Cube/');
        levels.push('#/rapt/Tour/');

        // Add the level screen title to the DOM
        var html = "<h2>Official Levels</h2>";

        // Add the levels to the DOM
		html += '<div id="levels">';
        for (var i = 0; i < levels.length; ++i) {
            html += "<div class=\"level\"><a href=\"" + levels[i] + "\">" + levels[i].split('/')[2] + "</a></div>";
        }
		html += '</div>';

        $('#levelScreen').html(html);
    }

	$(document).ready(function() {
        // first set up the level menu links
        $('#canvas').hide();
        $('#levelScreen').hide();
        $('#loadingScreen').hide();

        // Pretend we've already loaded the menu
        getLevels();
		showLevelScreen();
		location.hash = '#/rapt/';
        currentHash = location.hash;

        // then set up the canvas
		canvas = $('#canvas')[0];
		canvas.width = 800;
		canvas.height = 600;
		context = canvas.getContext('2d');
		lastTime = new Date();
		setInterval(tick, 1000 / 60);
	});

	$(document).keydown(function(e) {
		if (e.which === ESCAPE_KEY) {
			// escape returns the player to the level select page
			// Assumes URL in format #/[User]/[Level]
			location.hash = "/" + location.hash.split("/", 2)[1] + "/";
			showLevelScreen();
			return;
		}

        if (currentScreen !== null) {
            if (e.which === SPACEBAR) {
                if (currentScreen.gameStatus === GAME_LOST) {
                    // if the level is being restarted, change the screen to a new Game
                    changeScreen(new Game());
                } else if (currentScreen.gameStatus === GAME_WON) {
                    // if the user is going to the next level, load the next level using the level select page
                    for (var i = 0; i < levels.length; ++i) {
                        if (levels[i] === location.hash) {
                            if (i < levels.length - 1) {
                                // go to the next level on the list
                                location.hash = levels[i + 1];
                                // Don't return because we want to prevent default
                                showGameScreen();
                                break;
                            } else {
                                // return to menu screen if it was the last level
                                location.hash = "/" + location.hash.split("/", 2)[1] + "/";
                                showLevelScreen();
                                return;
                            }
                        }
                    }
                }
            }

			currentScreen.keyDown(e.which);
 		}

		// prevents default behaviors like scrolling up/down (F keys start at 112)
		if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
	});

	$(document).keyup(function(e) {
        if (currentScreen !== null) {
            currentScreen.keyUp(e.which);
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) e.preventDefault();
        }
	});
})();
