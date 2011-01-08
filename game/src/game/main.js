#require <game.js>

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var SPACEBAR = 32;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

function getMenuURL() {
	var matches = /^#\/([^\/]+)\//.exec(location.hash);
	var username = matches[1];
	return 'http://' + location.host + '/users/' + username + '/';
}

function getLevelURL() {
	var matches = /^#\/([^\/]+)\/([^\/]+)\/$/.exec(location.hash);
	var username = matches[1];
	var levelname = matches[2];
	return 'http://' + location.host + '/users/' + username + '/' + levelname + '/';
}

function ajaxGet(what, url, onSuccess) {
	function showError() {
		$('#loadingScreen').html('Could not load ' + what + ' from<br><b>' + url + '</b>');
	}
	
	$.ajax({
		'url': url,
		'type': 'GET',
		'cache': false,
		'dataType': 'json',
		'success': function(data, status, request) {
			if (data != null) {
				onSuccess(data);
			} else {
				showError();
			}
		},
		'error': function(request, status, error) {
			showError();
		}
	});
}

// class Menu
function Menu() {
	this.username = '';
	this.levels = [];
}

Menu.prototype.loadFromJSON = function(json) {
	// values are quoted (like json['width'] instead of json.width) so closure compiler doesn't touch them
	
	var levels = json['levels'];
	this.levels = [];
	for (var i = 0; i < levels.length; i++) {
		this.levels.push(new MenuLevel(levels[i]['title'], levels[i]['html_title']));
	}
	this.username = json['username'];
};

Menu.prototype.toHTML = function() {
	var html = '<h2>' + this.username + '\'s Levels</h2><div id="levels">';
	for (var i = 0; i < this.levels.length; ++i) {
        //html += '<div class="level" id="' + i + '" onMouseOver="levelHover();" onClick="levelClick();">';
        html += '<div class="level" id="' + i + '">';
        html += '<a href="' + this.getHashForLevel(this.levels[i]) + '">' + this.levels[i].title + '</div>';
	}
	html += '</div>';
	return html;
};

Menu.prototype.getHash = function() {
	return '#/' + this.username + '/';
};

Menu.prototype.getHashForLevel = function(level) {
	return '#/' + this.username + '/' + level.html_title + '/';
};

// class MenuLevel
function MenuLevel(title, html_title) {
	this.title = title;
	this.html_title = html_title;
}

// module Main
(function(){
	var canvas;
	var context;
	var lastTime;
	var jsonForCurrentLevel = null;
	var currentScreen = null;
    var currentHash = '';
    var selectedLevel;
    var menu = new Menu();

	function tick() {
        // Poll for hash changes
		processHash(location.hash);

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

    function levelBlur() {
		$(this).css('background-color', '#C7C7C7');
    }

    function levelFocus() {
        selectedLevel.blur();
        selectedLevel = $(this);
        selectedLevel.css('background-color', 'white');
        selectedLevel.children().get(0).focus();
    }

    function levelClick() {
        location.href = $(this).children().attr('href');
    }

    function processHash(hash) {
		if (currentHash === hash) return;
		currentHash = location.hash;
		
        if (hash.split('/').length === 3) {
            // #/[User]/
            showLoadingScreen();
			ajaxGet('menu', getMenuURL(), function(json) {
	            showLevelScreen();
                getMenuFromJSON(json);
				document.title = menu.username + ' - RAPT';
			});
        } else if (hash.split('/').length === 4) {
            // #/[User]/[Level]/
            showLoadingScreen();

			// if the user refreshes while in a level, we need to remember the username so we know what to do when escape is pressed
			menu.username = hash.split('/')[1];
			
			// if the user refreshes while in a level, we also need to load the menu in the background
			// so that when the user beats the level they can press space to advance to the next level
			// (without loading the menu we wouldn't know what the next level is)
			ajaxGet('menu', getMenuURL(), getMenuFromJSON);
			
			// finally, load the level
			ajaxGet('level', getLevelURL(), function(json) {
				jsonForCurrentLevel = JSON.parse(json['level']['data']);
				showGameScreen();
				gameState.loadLevelFromJSON(jsonForCurrentLevel);
				document.title = json['level']['title'] + ' - ' + menu.username + ' - RAPT';
			});
        }
    }

    function getMenuFromJSON(json) {
        menu.loadFromJSON(json['user']);
        $('#levelScreen').html(menu.toHTML());
        $('.level').blur(levelBlur);
        $('.level').focus(levelFocus);
        $('.level').hover(levelFocus);
        $('.level').click(levelClick);
        if (selectedLevel === null) {
            selectedLevel = $('#0');
        } else {
            selectedLevel = $('#' + selectedLevel.attr('id'));
        }
        selectedLevel.focus();
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
        // Don't use === here, comparing a string with an int
        var lastLevel = (selectedLevel !== null && selectedLevel.attr('id') == (menu.levels.length - 1));
        changeScreen(new Game(lastLevel));
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
	
	$(document).ready(function() {
        // first set up the level menu links
        $('#canvas').hide();
        $('#levelScreen').hide();
        $('#loadingScreen').hide();

        selectedLevel = null;

        // Load the official level menu if it doesn't start with '#/'
		if (location.hash.indexOf('#/') != 0) location.hash = '#/rapt/';
		
		// Otherwise process whatever url we happen to load (if the user pressed the back button from some other page to us)
		processHash(location.hash);

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
			location.hash = menu.getHash();
			showLevelScreen();
			return;
		}

        if (currentScreen !== null) {
            if (e.which === SPACEBAR) {
                if (gameState.gameStatus === GAME_LOST) {
                    // if the level is being restarted, reload the level
					showGameScreen();
					gameState.loadLevelFromJSON(jsonForCurrentLevel);
                } else if (gameState.gameStatus === GAME_WON) {
                    // if the user is going to the next level, load the next level using the level select page
                    for (var i = 0; i < menu.levels.length; ++i) {
                        if (menu.getHashForLevel(menu.levels[i]) === location.hash) {
                            if (i < menu.levels.length - 1) {
                                // go to the next level on the list
                                location.hash = menu.getHashForLevel(menu.levels[i + 1]);
                                selectedLevel = $('#' + (i + 1));
                                // Don't return because we want to prevent default
                                break;
                            } else {
                                // return to menu screen if it was the last level
                                location.hash = menu.getHash();
                                showLevelScreen();
                                return;
                            }
                        }
                    }
                }
            }

			currentScreen.keyDown(e.which);

            // Prevents default behaviors like scrolling up/down (F keys start at 112)
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) {
                e.preventDefault();
            }
 		} else if ($('#levelScreen').is(':visible')) {
            if (e.which === UP_ARROW && selectedLevel !== null) {
                var levelNum = parseInt(selectedLevel.attr('id'), 10);
                if (levelNum !== 0) {
                    $('#' + (levelNum - 1)).focus();
                }
            }
            if (e.which === DOWN_ARROW && selectedLevel !== null) {
                var levelNum = parseInt(selectedLevel.attr('id'), 10);
                if (levelNum !== (menu.levels.length - 1)) {
                    $('#' + (levelNum + 1)).focus();
                }
            }

            // Prevents default behaviors except for enter key
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111 && e.which !== ENTER_KEY) {
                e.preventDefault();
            }
        }
	});

	$(document).keyup(function(e) {
        if (currentScreen !== null) {
            currentScreen.keyUp(e.which);
            if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.which >= 0 && e.which <= 111) {
                e.preventDefault();
            }
        }
	});
})();
