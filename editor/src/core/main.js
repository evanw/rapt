#require <editor.js>

function getLevelURL() {
	return 'http://' + location.host + '/users/' + username + '/' + levelname + '/';
}

function ajaxGetLevel(onSuccess) {
	function showError() {
		$('#loading').html('Could not load level from<br><b>' + getLevelURL() + '</b>');
	}
	
	$.ajax({
		url: getLevelURL(),
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

function ajaxPutLevel(json) {
	function showError() {
		alert('Could not save level to\n' + getLevelURL());
	}
	
	$.ajax({
		url: getLevelURL(),
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify(json),
		contentType: 'application/json; charset=utf-8',
		error: function(request, status, error) {
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
	'mode_help': MODE_HELP
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
		'Pan camera', 'Right-drag',
		'Zoom camera', 'Scrollwheel',
		'Move selection', 'Left-drag'
	];
	
	// Generate keyboard shortcut html
	var gen = new SidebarGenerator();
	for (var i = 0; i < keys.length; i++) {
		gen.addCell(keys[i]);
	}
	$('#help').html(gen.getHTML() + '<hr>TODO: signs, enemy rotation, and headache graphics');
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

function loadEditor() {
	// Add an action to each toolbar button
	$('#toolbar .section a').mousedown(function(e) {
		var mode = idToModeMap[this.id];
		editor.setMode(mode);
		$('.toolbar-current').removeClass('toolbar-current');
		$(this).addClass('toolbar-current');
		e.preventDefault();
		showOrHidePanels(mode);
	});
	
	// Connect the canvas and the editor
	var canvas = $('#canvas')[0];
	editor = new Editor(canvas);
	resizeEditor();
	
	// Create HTML content for the sidebars
	fillEnemies();
	fillWalls();
	fillHelp();
	
	// Connect canvas events to editor events
	$(canvas).mousedown(function(e) {
		buttons |= (1 << e.which);
		editor.mouseDown(mousePoint(e), buttons);
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

$(window).resize(function() {
	resizeEditor();
});

$(document).bind('contextmenu', function(e) {
	e.preventDefault();
});

$(document).keydown(function(e) {
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
			ajaxPutLevel(editor.save());
		} else if (e.which == 'A'.charCodeAt(0)) {
			editor.selectAll();
			e.preventDefault();
		}
	} else if (e.which == 8 /*BACKSPACE*/) {
		editor.deleteSeleciton();
		e.preventDefault();
	}
});
