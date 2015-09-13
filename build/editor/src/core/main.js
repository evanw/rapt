#require <editor.js>

var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_CONTROL = 17;
var KEY_SHIFT = 16;
var KEY_META = 91;
var KEY_ALT = 18;

var overlayTimeout = null;

function overlay(text) {
	clearTimeout(overlayTimeout);
	overlayTimeout = setTimeout(function() {
		$('#overlay').fadeOut();
	}, 600);
	$('#overlay').html(text).show().stop().fadeTo(0, 1);
}

function getLevelLoadURL() {
	return '//' + location.host + '/data/' + username + '/' + levelname + '/';
}

function getLevelSaveURL() {
	return '//' + location.host + '/edit/' + levelname + '/';
}

function ajaxGetLevel(onSuccess) {
	function showError() {
		$('#loading').html('Could not load level from<br><b>' + getLevelURL() + '</b>');
	}

	$.ajax({
		'url': getLevelLoadURL(),
		'type': 'GET',
		'cache': false,
		'dataType': 'json',
		'success': function(data, status, request) {
			if (data != null) {
				onSuccess(JSON.parse(data['data']));
			} else {
				showError();
			}
		},
		'error': function(request, status, error) {
			showError();
		}
	});
}

function ajaxPutLevel(json, onSuccess) {
	function showError() {
		alert('Could not save level to\n' + getLevelURL());
	}

	overlay('Saving');
	$.ajax({
		'url': getLevelSaveURL(),
		'type': 'PUT',
    'beforeSend': function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
    },
		'dataType': 'json',
		'data': JSON.stringify({ 'level': { 'data': json } }),
		'contentType': 'application/json; charset=utf-8',
		'success': function(data, status, request) {
			overlay('Saved');
			if (onSuccess) onSuccess();
		},
		'error': function(request, status, error) {
			showError();
		}
	});
}

var idToModeMap = {
	'mode_empty': MODE_EMPTY,
	'mode_solid': MODE_SOLID,
	'mode_diagonal': MODE_DIAGONAL,
	'mode_start': MODE_START,
	'mode_goal': MODE_GOAL,
	'mode_cog': MODE_COG,
	'mode_sign': MODE_SIGN,
	'mode_select': MODE_SELECT,
	'mode_enemies': MODE_ENEMIES,
	'mode_walls_buttons': MODE_WALLS_BUTTONS,
	'mode_help': MODE_HELP,
	'mode_save_exit': MODE_SAVE_AND_EXIT
};

var editor = null;
var buttons = 0;

function resizeEditor() {
	var toolbarHeight = $('#toolbar').outerHeight();
	var sidebarWidth = 0;

	if (editor.mode == MODE_HELP) {
		$('#help').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#help').outerWidth();
	}

	if (editor.mode == MODE_ENEMIES) {
		$('#enemies').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#enemies').outerWidth();
	}

	if (editor.mode == MODE_WALLS_BUTTONS) {
		$('#walls').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#walls').outerWidth();
	}

	editor.resize($(window).width() - sidebarWidth, $(window).height() - toolbarHeight);
	editor.draw();
}

function showOrHidePanels(mode) {
	// Show or hide the help panel
	if (mode == MODE_HELP) {
		$('#help').show();
	} else {
		$('#help').hide();
	}

	// Show or hide the enemies panel
	if (mode == MODE_ENEMIES) {
		$('#enemies').show();
	} else {
		$('#enemies').hide();
	}

	// Show or hide the walls panel
	if (mode == MODE_WALLS_BUTTONS) {
		$('#walls').show();
	} else {
		$('#walls').hide();
	}

	resizeEditor();
}

function mousePoint(e) {
	var offset = $('#canvas').offset();
	return new Vector(e.pageX - offset.left, e.pageY - offset.top);
}

function fillHelp() {
	// Platform specific modifier keys
	var isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent); // $.browser.safari is broken
	var mac = (navigator.platform.indexOf('Mac') != -1);
	var ctrl = mac ? '^' : 'Ctrl+';
	var alt = mac ? '&#x2325;' : 'Alt+';
	var shift = mac ? '&#x21E7;' : 'Shift+';
	var meta = mac ? '&#x2318;' : 'Win+';
	var backspace = mac ? '&#x232B;' : 'Backspace';

	// Keyboard shortcuts
	var keys = [
		'Save', (mac ? meta : ctrl) + 'S',
		'Undo', (mac ? meta : ctrl) + 'Z',
		'Redo', mac ? shift + meta + 'Z' : ctrl + 'Y',
		'Select all', (mac ? meta : ctrl) + 'A',
		'Delete selection', backspace,
		'---', '---',
		'Pan camera', isSafari ? 'Middle-drag' : 'Right-drag', // Safari doesn't send mousemove messages when the right mouse button is pressed
		'Zoom camera', 'Scrollwheel',
		'Move selection', 'Left-drag',
		'---', '---',
		'Edit sign', 'Double-click'
	];

	// Generate keyboard shortcut html
	var gen = new SidebarGenerator();
	for (var i = 0; i < keys.length; i++) {
		gen.addCell(keys[i]);
	}
	$('#help').html(gen.getHTML() + '<hr>To change starting direction for Bombers, Jet Streams, Wall Crawlers, and ' +
		'Wheeligators, select them and drag the triangle (must be in "Select" mode).');
}

function fillEnemies() {
	var gen = new SidebarGenerator();

	// Create a <canvas> for each enemy
	var i;
	gen.addHeader('Color-neutral enemies');
	for (i = 0; i < editor.enemies.length; i++) {
		if (i == 10) gen.addHeader('Color-specific enemies');
		gen.addCell('<div class="cell" id="enemy' + i + '"><canvas id="enemy' + i + '-canvas" width="80" height="60"></canvas>' + editor.enemies[i].name + '</div>');
	}
	$('#enemies').html(gen.getHTML());
	$('#enemy' + editor.selectedEnemy).addClass('enemy-current');

	// Draw each enemy on its <canvas>
	for (i = 0; i < editor.enemies.length; i++) {
		var c = $('#enemy' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		c.fillStyle = c.strokeStyle = 'green';
		var sprite = editor.enemies[i].sprite;
		if (i == SPRITE_ROCKET_SPIDER) sprite = sprite.clone(new Vector(0, -0.2));
		sprite.draw(c);
	}

	// Add an action to each enemy button
	$('#enemies .cell').mousedown(function(e) {
		var selectedEnemy = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedEnemy(selectedEnemy);
		$('.enemy-current').removeClass('enemy-current');
		$(this).addClass('enemy-current');
		e.preventDefault();
	});
}

function fillWalls() {
	var gen = new SidebarGenerator();

	// Create a <canvas> for each wall type
	var i, c;
	gen.addHeader('Walls');
	gen.addInfo('Colored walls allow only the player of that color to pass through');
	for (i = 0; i < 6; i++) {
		var name = (i & 1) ? 'One-way' : 'Normal';
		gen.addCell('<div class="cell" id="wall' + i + '"><canvas id="wall' + i + '-canvas" width="80" height="60"></canvas>' + name + '</div>');
	}

	// Create a <canvas> for each button type
	gen.addHeader('Buttons');
	gen.addInfo('Buttons open and close linked doors');
	var buttons = [ 'Open', 'Close', 'Toggle', 'Link', 'Set Initially Open' ];
	for (i = 6; i < 9; i++) {
		gen.addCell('<div class="cell" id="button' + i + '"><canvas id="button' + i + '-canvas" width="80" height="60"></canvas>' + buttons.shift() + '</div>');
	}

	// Create a <canvas> for each door tool
	gen.addHeader('Doors');
	gen.addInfo('Create doors by linking walls and buttons');
	for (i = 9; i < 11; i++) {
		gen.addCell('<div class="cell" id="door' + i + '"><canvas id="door' + i + '-canvas" width="80" height="60"></canvas>' + buttons.shift() + '</div>');
	}

	$('#walls').html(gen.getHTML());
	$('#wall' + editor.selectedEnemy).addClass('wall-current');

	// Draw each wall on its <canvas>
	for (i = 0; i < 6; i++) {
		c = $('#wall' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		new Door(i & 1, false, Math.floor(i / 2), new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))).draw(c);
	}

	// Draw each button on its <canvas>
	for (i = 6; i < 9; i++) {
		c = $('#button' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		Sprites.drawButton(c, 1);
	}

	// Draw each button on its <canvas>
	for (i = 9; i < 11; i++) {
		c = $('#door' + i + '-canvas')[0].getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		if (i == 9) {
			// Draw link
			c.strokeStyle = rgba(0, 0, 0, 0.5);
			dashedLine(c, new Vector(-0.3, 0.2), new Vector(0.3, 0));

			// Draw button
			c.translate(-0.3, 0.2);
			Sprites.drawButton(c, 1);
			c.translate(0.3, -0.2);

			// Draw door
			new Door(true, false, COLOR_NEUTRAL, new Edge(new Vector(0.7, 0.4), new Vector(-0.1, -0.4))).draw(c);
		} else {
			// Draw initially open door
			new Door(true, true, COLOR_NEUTRAL, new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))).draw(c);
		}
	}

	// Add an action to each wall button
	$('#walls .cell').mousedown(function(e) {
		var selectedWall = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedWall(selectedWall);
		$('.wall-current').removeClass('wall-current');
		$(this).addClass('wall-current');
		e.preventDefault();
	});
}

var signTextFocused = false;
var signTextCallback = null;

function showSignTextDialog(text, callback) {
	signTextCallback = callback;
	$('#sign-text-modal button').removeClass('sign-text-active');
	$('#sign-text-modal').show().animate({ top: 0 });
	$('#darken').fadeIn();
	$('#sign-text').val(text).focus().select();
}

function hideSignTextDialog() {
	$('#sign-text-modal').animate({ top: -115 }, function() {
		$('#sign-text-modal').hide();
	});
	$('#darken').fadeOut();
	return $('#sign-text').blur().val();
}

function changeSignText() {
	$('#sign-text-change').addClass('sign-text-active');
	var text = hideSignTextDialog();
	if (signTextCallback) signTextCallback(text);
}

function cancelSignText() {
	$('#sign-text-cancel').addClass('sign-text-active');
	hideSignTextDialog();
}

function loadEditor() {
	// Add an action to each toolbar button
	$('#toolbar .section a').mousedown(function(e) {
		var mode = idToModeMap[this.id];
		editor.setMode(mode);
		$('.toolbar-current').removeClass('toolbar-current');
		$(this).addClass('toolbar-current');
		e.preventDefault();
		showOrHidePanels(mode);
		if (mode == MODE_SAVE_AND_EXIT) {
			var cleanIndex = editor.doc.undoStack.getCurrentIndex();
			ajaxPutLevel(editor.save(), function() {
				editor.doc.undoStack.setCleanIndex(cleanIndex);

				// assuming we got here from our main site, press the browser's back button
				history.back();

				// if that doesn't work, then try to close the window
				window.close();
			});
		}
	});

	// Add actions to buttons on sign text dialog
	$('#sign-text-modal button').mousedown(function(e) {
		e.preventDefault();
	});
	$('#sign-text-change').mouseup(function(e) {
		changeSignText();
		e.preventDefault();
	});
	$('#sign-text-cancel').mouseup(function(e) {
		cancelSignText();
		e.preventDefault();
	});
	$('#sign-text').focus(function(e) {
		signTextFocused = true;
	});
	$('#sign-text').blur(function(e) {
		signTextFocused = false;
	});
	$('#sign-text').keydown(function(e) {
		if (e.which == KEY_ENTER) {
			changeSignText();
		} else if (e.which == KEY_ESCAPE) {
			cancelSignText();
		}
	});

	// Connect the canvas and the editor
	var canvas = $('#canvas')[0];
	editor = new Editor(canvas);
	resizeEditor();

	// Create HTML content for the sidebars
	fillEnemies();
	fillWalls();
	fillHelp();

	// Keep track of modifier key states
	var control = false;
	var shift = false;
	var meta = false;
	var alt = false;

	// Connect canvas events to editor events
	$(canvas).mousedown(function(e) {
		buttons |= (1 << e.which);
		editor.mouseDown(mousePoint(e), buttons, control | shift | meta | alt);
		e.preventDefault();
	});
	$(canvas).mousemove(function(e) {
		editor.mouseMoved(mousePoint(e), buttons);
		e.preventDefault();
	});
	$(canvas).mouseup(function(e) {
		buttons &= ~(1 << e.which);
		editor.mouseUp(mousePoint(e), buttons);
		e.preventDefault();
	});
	$(canvas).mousewheel(function(e, delta, deltaX, deltaY) {
		editor.mouseWheel(deltaX, deltaY);
		editor.mouseMoved(mousePoint(e));
		e.preventDefault();
	});
	$(canvas).mouseenter(function(e) {
		editor.mouseOver();
	});
	$(canvas).mouseleave(function(e) {
		editor.mouseOut();
	});
	$(canvas).dblclick(function(e) {
		buttons = 0;
		e.preventDefault();
		editor.doubleClick(mousePoint(e));
	});

	// Add handlers for window/document events
	$(window).resize(function() {
		resizeEditor();
	});
	$(document).bind('contextmenu', function(e) {
		e.preventDefault();
	});
	$(document).keydown(function(e) {
		if (e.which == KEY_CONTROL) control = true;
		else if (e.which == KEY_SHIFT) shift = true;
		else if (e.which == KEY_META) meta = true;
		else if (e.which == KEY_ALT) alt = true;
		else if (!signTextFocused) {
			if (e.ctrlKey || e.metaKey) {
				if (e.which == 'Z'.charCodeAt(0)) {
					if (e.shiftKey) editor.redo();
					else editor.undo();
					e.preventDefault();
				} else if (e.which == 'Y'.charCodeAt(0)) {
					editor.redo();
					e.preventDefault();
				} else if (e.which == 'S'.charCodeAt(0)) {
					e.preventDefault();
					var cleanIndex = editor.doc.undoStack.getCurrentIndex();
					ajaxPutLevel(editor.save(), function() {
						editor.doc.undoStack.setCleanIndex(cleanIndex);
					});
				} else if (e.which == 'A'.charCodeAt(0)) {
					editor.selectAll();
					e.preventDefault();
				}
			} else if (e.which == 8 /*BACKSPACE*/) {
				editor.deleteSeleciton();
				e.preventDefault();
			}
		}
	});
	$(document).keyup(function(e) {
		if (e.which == KEY_CONTROL) control = false;
		else if (e.which == KEY_SHIFT) shift = false;
		else if (e.which == KEY_META) meta = false;
		else if (e.which == KEY_ALT) alt = false;
	});

	// If user does something like alt-tab, we will get a keydown
	// but not a keyup, so reset the keyboard state in that case
	$(window).blur(function(e) {
		control = shift = meta = alt = false;
	});
	$(window).focusout(function(e) {
		control = shift = meta = alt = false;
	});

	$(window).bind('beforeunload', function() {
		if (!editor.doc.isClean()) {
			return 'Some of your edits are not saved, and will be lost if you close this window.  Continue?';
		}
	});
}

$(document).ready(function() {
	if (typeof username === "undefined") {
		loadEditor();
	} else {
		ajaxGetLevel(function(data) {
			loadEditor();
			editor.loadFromJSON(data);
		});
	}
});
