#require <game.js>

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var SPACEBAR = 32;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

function getMenuUrl(username) { return '//' + location.host + '/data/' + username + '/'; }
function getLevelUrl(username, levelname) { return '//' + location.host + '/data/' + username + '/' + levelname + '/'; }
function text2html(text) {
       return text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : '';
}

// get json data via ajax
function ajaxGet(what, url, onSuccess) {
	function showError() {
		$('#loadingScreen').html('Could not load ' + what + ' from<br><b>' + text2html(url) + '</b>');
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

function globalScaleFactor() {
	// return window['devicePixelRatio']; // This is too slow T_T
	return 1;
}

////////////////////////////////////////////////////////////////////////////////
// class MenuItem
////////////////////////////////////////////////////////////////////////////////

function MenuItem(levelname, title, difficulty) {
	this.levelname = levelname;
	this.title = title;
	this.difficulty = difficulty;
}

////////////////////////////////////////////////////////////////////////////////
// class Menu
////////////////////////////////////////////////////////////////////////////////

function Menu() {
	this.username = null;
	this.items = [];
	this.isLoading = false;
	this.selectedIndex = -1;
}

Menu.prototype.load = function(username, onSuccess) {
	// Don't reload the menu if we just loaded it
	if (!this.isLoading && this.username == username) {
		if (onSuccess) onSuccess();
		return;
	}

	// Don't reload the menu if we're already loading it
	if (this.isLoading && this.username == username) {
		return;
	}

	this.username = username;
	this.items = [];
	this.isLoading = true;

	var this_ = this;
	ajaxGet('menu', getMenuUrl(username), function(json) {
		var levels = json['levels'];
		for (var i = 0; i < levels.length; i++) {
			var level = levels[i];
			this_.items.push(new MenuItem(level['html_title'], level['title'], level['difficulty']));
		}
		this_.isLoading = false;
		this_.selectedIndex = 0;
		if (onSuccess) onSuccess();
	});
};

Menu.prototype.updateSelectedIndex = function() {
	var selectedLevel = $('#level' + this.selectedIndex);
	if (selectedLevel.length > 0) {
		$('.level').blur();
		$(selectedLevel).focus();

		// no idea why 475 is the magic number that centers the selected level, but not going to worry about it
		var scrollTop = $('#levelScreen').scrollTop() + $(selectedLevel).offset().top - 475;
		$('#levelScreen').scrollTop(scrollTop);
	}
};

Menu.prototype.show = function() {
	if (this.isLoading) {
		$('#canvas').hide();
		$('#levelScreen').hide();
		$('#loadingScreen').show();
		$('#loadingScreen').html('Loading...');
	} else {
		$('#canvas').hide();
		$('#levelScreen').show();
		$('#loadingScreen').hide();

		var html = '<h2>';
		html += (this.username == 'rapt') ? 'Official Levels' : 'Levels made by ' + text2html(this.username);
		html += '</h2><div id="levels">';
		var prevDifficulty = null;
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			var difficulty = ['Easy', 'Medium', 'Hard', 'Brutal', 'Demoralizing'][item.difficulty];
			if (difficulty != prevDifficulty) {
				prevDifficulty = difficulty;
				html += '<div class="difficulty">' + difficulty + '</div>';
			}
			html += '<a class="level" id="level' + i + '" href="' + text2html(Hash.getLevelHash(this.username, item.levelname)) + '">';
			var s = stats.getStatsForLevel(this.username, item.levelname);
			html += '<img src="/images/' + (s['gotAllCogs'] ? 'checkplus' : s['complete'] ? 'check' : 'empty') + '.png">';
			html += text2html(item.title) + '</a>';
		}
		html += '</div>';
		$('#levelScreen').html(html);

		var this_ = this;
		$('.level').hover(function() {
			$(this).focus();
		});
		$('.level').focus(function() {
			this_.selectedIndex = this.id.substr(5); // remove "level"
		});

		this.updateSelectedIndex();
	}
};

Menu.prototype.indexOfLevel = function(username, levelname) {
	if (username === this.username) {
		for (var i = 0; i < this.items.length; i++) {
			if (levelname === this.items[i].levelname) {
				return i;
			}
		}
	}
	return -1;
};

Menu.prototype.isLastLevel = function(username, levelname) {
	if (username !== this.username) {
		// This level is in some other menu, so return true (it is the last level)
		// so pressing spacebar takes the user back to that other menu
		return true;
	} else {
		return this.indexOfLevel(username, levelname) >= this.items.length - 1;
	}
};

Menu.prototype.keyDown = function(e) {
	if (e.which == UP_ARROW) {
		if (this.selectedIndex > 0) this.selectedIndex--;
		this.updateSelectedIndex();
	} else if (e.which == DOWN_ARROW) {
		if (this.selectedIndex < this.items.length - 1) this.selectedIndex++;
		this.updateSelectedIndex();
	}
};

Menu.prototype.keyUp = function(e) {
};

////////////////////////////////////////////////////////////////////////////////
// class Level
////////////////////////////////////////////////////////////////////////////////

function Level() {
	this.username = null;
	this.levelname = null;
	this.isLoading = false;
	this.width = 800;
	this.height = 600;
	this.ratio = 0;

	// set up the canvas
	this.canvas = $('#canvas')[0];
	this.context = this.canvas.getContext('2d');
	this.lastTime = new Date();
	this.game = null;
	this.json = null;
}

Level.prototype.tick = function() {
	var currentTime = new Date();
	var seconds = (currentTime - this.lastTime) / 1000;
	this.lastTime = currentTime;

	// Retina support
	var ratio = globalScaleFactor();
	if (ratio != this.ratio) {
		this.canvas.width = Math.round(this.width * ratio);
		this.canvas.height = Math.round(this.height * ratio);
		this.canvas.style.width = this.width + 'px';
		this.canvas.style.height = this.height + 'px';
		this.context.scale(ratio, ratio);
	}

	if (this.game != null) {
		// if the computer goes to sleep, act like the game was paused
		if (seconds > 0 && seconds < 1) this.game.tick(seconds);

		this.game.lastLevel = menu.isLastLevel(this.username, this.levelname);
		this.game.draw(this.context);
	}
};

Level.prototype.restart = function() {
	Particle.reset();
	this.game = new Game();
	this.game.resize(this.width, this.height);
	gameState.loadLevelFromJSON(this.json);

	// add the check mark on the level menu when this level is won
	var this_ = this;
	this.game.onWin = function() {
		var gotAllCogs = gameState.stats[STAT_COGS_COLLECTED] == gameState.stats[STAT_NUM_COGS];
		var s = stats.getStatsForLevel(this_.username, this_.levelname);
		stats.setStatsForLevel(this_.username, this_.levelname, true, s['gotAllCogs'] || gotAllCogs);
	};
};

Level.prototype.load = function(username, levelname, onSuccess) {
	this.username = username;
	this.levelname = levelname;
	this.isLoading = true;

	var this_ = this;
	ajaxGet('level', getLevelUrl(username, levelname), function(json) {
		// reset the game
		this_.json = JSON.parse(json['data']);
		this_.restart();

		// reset the tick timer in case level loading took a while (we don't want the physics to
		// try and catch up, because then it will rush through the first few seconds of the game)
		this_.lastTime = new Date();

		this_.isLoading = false;
		if (onSuccess) onSuccess();
	});
};

Level.prototype.show = function() {
	if (this.isLoading) {
		$('#canvas').hide();
		$('#levelScreen').hide();
		$('#loadingScreen').show();
		$('#loadingScreen').html('Loading...');
	} else {
		$('#canvas').show();
		$('#levelScreen').hide();
		$('#loadingScreen').hide();
	}
};

Level.prototype.keyDown = function(e) {
	if (this.game != null) {
		this.game.keyDown(e);

		if (e.which == SPACEBAR) {
			if (gameState.gameStatus === GAME_LOST) {
				// restart the current level
				this.restart();
			} else if (gameState.gameStatus === GAME_WON) {
				if (menu.isLastLevel(this.username, this.levelname)) {
					// go back to the level menu
					hash.setHash(this.username, null);
				} else {
					// go straight to the next level
					var index = menu.indexOfLevel(this.username, this.levelname);
					hash.setHash(this.username, menu.items[index + 1].levelname);
				}
			}
		}
	}
};

Level.prototype.keyUp = function(e) {
	if (this.game != null) {
		this.game.keyUp(e);
	}
};

////////////////////////////////////////////////////////////////////////////////
// class Hash
////////////////////////////////////////////////////////////////////////////////

function Hash() {
	this.username = null;
	this.levelname = null;
	this.hash = null;
	this.prevHash = null;
}

Hash.prototype.hasChanged = function() {
	if (this.hash != location.hash) {
		this.prevHash = this.hash;
		this.hash = location.hash;

		var levelMatches = /^#\/?([^\/]+)\/([^\/]+)\/?$/.exec(this.hash);
		var userMatches = /^#\/?([^\/]+)\/?$/.exec(this.hash);
		if (levelMatches != null) {
			this.username = levelMatches[1];
			this.levelname = levelMatches[2];
		} else if (userMatches != null) {
			this.username = userMatches[1];
			this.levelname = null;
		} else {
			this.username = null;
			this.levelname = null;
		}

		return true;
	}
	return false;
};

Hash.prototype.setHash = function(username, levelname) {
	var newHash = '#/' + username + '/' + (levelname ? levelname + '/' : '');

	if (this.prevHash === newHash) {
		// if we were on page A, we are now on page B, and we want to go back to page A, use the browser's back button instead
		// this is so a game session doesn't add tons of level => menu => level => menu stuff to the history
		history.back();
	} else {
		this.username = username;
		this.levelname = levelname;
		location.hash = newHash;
	}
};

Hash.getMenuHash = function(username) { return '#/' + username + '/'; };
Hash.getLevelHash = function(username, levelname) { return '#/' + username + '/' + levelname + '/'; };

////////////////////////////////////////////////////////////////////////////////
// module Main
////////////////////////////////////////////////////////////////////////////////

var stats = null;
var hash = null;
var menu = null;
var level = null;
var keyToChange = null;

// scroll the game to the center of the window if it lies partially or completely off screen
function scrollGameIntoWindow() {
	var windowTop = $('body').scrollTop(), windowHeight = $(window).height();
	var gameTop = $('#game').offset().top, gameHeight = $('#game').outerHeight();
	if (gameTop < windowTop || gameTop + gameHeight > windowTop + windowHeight) {
		// html is for firefox, body is for webkit
		$('html, body').animate({ scrollTop: gameTop + (gameHeight - windowHeight) / 2 });
	}
}

$(document).ready(function() {
	scrollGameIntoWindow();
	Keys.load();

	hash = new Hash();
	menu = new Menu();
	level = new Level();
	stats = new PlayerStats(function() {
		// if we're in the menu, reload the menu so the icons show up
		if (hash.levelname == null) {
			menu.show();
		}
	});

	tick();
	setInterval(tick, 1000 / 60);
});

$('.key.changeable').live('mousedown', function(e) {
	keyToChange = this.id;
	$('.key.changing').removeClass('changing');
	$('#' + keyToChange).addClass('changing');
	e.preventDefault();
	e.stopPropagation();
});

$(document).keydown(function(e) {
	// catch every key if we're remapping keys
	if (keyToChange != null) {
		Keys.keyMap[keyToChange] = e.which;
		Keys.save();
		$('#' + keyToChange).removeClass('changing');
		e.preventDefault();
		e.stopPropagation();
		keyToChange = null;
		return;
	}

	// Allow keyboard shortcuts to work
	if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
		menu.keyDown(e);
		level.keyDown(e);

		if (e.which === ESCAPE_KEY) {
			// escape returns the player to the level select page
			hash.setHash(menu.username || level.username, null);
		}

		// Prevents default behaviors like scrolling up/down
		if (e.which == UP_ARROW || e.which == DOWN_ARROW || e.which == SPACEBAR) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
});

$(document).keyup(function(e) {
	// Allow keyboard shortcuts to work
	if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
		menu.keyUp(e);
		level.keyUp(e);

		// Prevents default behaviors like scrolling up/down
		if (e.which == UP_ARROW || e.which == DOWN_ARROW || e.which == SPACEBAR) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
});

function tick() {
	if (hash.hasChanged()) {
		if (hash.username == null) {
			hash.setHash('rapt', null);
		} else if (hash.levelname == null) {
			// force the game to stop (so it doesn't spin cpu cycles in the background)
			level.game = null;

			// set the menu selection to the previous level, if there was one
			var index = menu.indexOfLevel(level.username, level.levelname);
			if (index !== -1) menu.selectedIndex = index;

			menu.load(hash.username, function() { menu.show(); });
			menu.show();
		} else {
			scrollGameIntoWindow();

			// make sure the menu is loaded so we can go right to the menu when the user presses escape
			menu.load(hash.username);

			level.load(hash.username, hash.levelname, function() {
				level.show();
			});
			level.show();
		}
	}

	level.tick();
}
