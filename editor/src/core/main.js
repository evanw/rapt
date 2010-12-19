var editor = null;
var buttons = 0;

function resizeEditor() {
	var toolbarHeight = $('#toolbar').outerHeight();
	var sidebarWidth = 0;
	
	if (editor.mode == MODE_OTHER_HELP) {
		$('#help').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#help').outerWidth();
	}
	
	if (editor.mode == MODE_OTHER_ENEMIES) {
		$('#enemies').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#enemies').outerWidth();
	}

	if (editor.mode == MODE_OTHER_WALLS) {
		$('#walls').css({ top: toolbarHeight + 'px' });
		sidebarWidth = $('#walls').outerWidth();
	}
	
	editor.resize($(window).width() - sidebarWidth, $(window).height() - toolbarHeight);
	editor.draw();
}

function showOrHidePanels(mode, oldMode) {
	// Show or hide the help panel
	if (mode == MODE_OTHER_HELP) {
		$('#help').show();
	} else {
		$('#help').hide();
	}
	
	// Show or hide the enemies panel
	if (mode == MODE_OTHER_ENEMIES) {
		$('#enemies').show();
	} else {
		$('#enemies').hide();
	}
	
	// Show or hide the walls panel
	if (mode == MODE_OTHER_WALLS) {
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
		'Delete selection', backspace,
		'---', '---',
		'Pan camera', 'Right-drag',
		'Zoom camera', 'Scrollwheel'
	];
	
	// Generate keyboard shortcut html
	var html = '<table>';
	for (var i = 0; i < keys.length; i++) {
		if (!(i & 1)) html += '<tr>';
		html += '<td>' + keys[i].replace('---', '<hr>') + '</td>';
		if (i & 1) html += '</tr>';
	}
	$('#help').html(html + '</table>');
}

function fillEnemies() {
	// Create a <canvas> for each enemy
	var html = '<table>';
	var i;
	for (i = 0; i < enemies.length; i++) {
		if (!(i & 1)) html += '<tr>';
		html += '<td><div class="enemy" id="enemy' + i + '"><canvas id="enemy' + i + '-canvas"></canvas>' + enemies[i].name + '</div></td>';
		if (i & 1) html += '</tr>';
	}
	$('#enemies').html(html + '</table>');
	$('#enemy' + editor.selectedEnemy).addClass('enemy-current');
	
	// Draw each enemy on its <canvas>
	for (i = 0; i < enemies.length; i++) {
		var p = $('#enemy' + i + '-canvas')[0];
		p.width = 80;
		p.height = 60;
		
		var c = p.getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		c.fillStyle = c.strokeStyle = 'green'; // TODO: remove this when everything is drawn, just used to make sure sprites specify colors
		enemies[i].sprite.draw(c);
	}
	
	// Add an action to each enemy button
	$('#enemies .enemy').mousedown(function(e) {
		var selectedEnemy = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedEnemy(selectedEnemy);
		$('.enemy-current').removeClass('enemy-current');
		$(this).addClass('enemy-current');
		e.preventDefault();
	});
}

function fillWalls() {
	// Create a <canvas> for each wall type
	var html = '<table>';
	var i;
	for (i = 0; i < 6; i++) {
		var name = (i & 1) ? 'One-way' : 'Normal';
		if (!(i & 1)) html += '<tr>';
		html += '<td><div class="wall" id="wall' + i + '"><canvas id="wall' + i + '-canvas"></canvas>' + name + '</div></td>';
		if (i & 1) html += '</tr>';
	}
	$('#walls').html(html + '</table>');
	$('#wall' + editor.selectedEnemy).addClass('wall-current');
	
	// Draw each wall on its <canvas>
	for (i = 0; i < 6; i++) {
		var p = $('#wall' + i + '-canvas')[0];
		p.width = 80;
		p.height = 60;
		
		var c = p.getContext('2d');
		c.translate(40, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		
		c.strokeStyle = 'green';
		new Door(i & 1, Math.floor(i / 2), new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))).draw(c);
	}
	
	// Add an action to each wall button
	$('#walls .wall').mousedown(function(e) {
		var selectedWall = parseInt(/\d+$/.exec(this.id), 10);
		editor.setSelectedWall(selectedWall);
		$('.wall-current').removeClass('wall-current');
		$(this).addClass('wall-current');
		e.preventDefault();
	});
}

$(document).ready(function() {
	// Add an action to each toolbar button
	$('#toolbar .section a').mousedown(function(e) {
		var oldMode = editor.mode;
		var mode = eval(this.id);
		editor.setMode(mode);
		$('.toolbar-current').removeClass('toolbar-current');
		$(this).addClass('toolbar-current');
		e.preventDefault();
		showOrHidePanels(mode, oldMode);
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
			editor.save();
			e.preventDefault();
		} else if (e.which == 'A'.charCodeAt(0)) {
			editor.selectAll();
			e.preventDefault();
		}
	} else if (e.which == 8 /*BACKSPACE*/) {
		editor.deleteSeleciton();
		e.preventDefault();
	}
});
