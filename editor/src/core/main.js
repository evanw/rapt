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
	
	editor.resize($(window).width() - sidebarWidth, $(window).height() - toolbarHeight);
	editor.draw();
}

function showOrHidePanels(mode, oldMode) {
	// Show or hide the help panel
	if (mode == MODE_OTHER_HELP) {
		$('#help').show();
		resizeEditor();
		fillHelp();
	} else if (oldMode == MODE_OTHER_HELP) {
		$('#help').hide();
		resizeEditor();
	}
	
	// Show or hide the enemies panel
	if (mode == MODE_OTHER_ENEMIES) {
		$('#enemies').show();
		resizeEditor();
		fillEnemies();
	} else if (oldMode == MODE_OTHER_ENEMIES) {
		$('#enemies').hide();
		resizeEditor();
	}
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
	for (var i = 0; i < keys.length; i += 2) {
		html += '<tr><td>' + keys[i].replace('---', '<hr>') + '</td><td>' + keys[i + 1].replace('---', '<hr>') + '</td></tr>';
	}
	$('#help').html(html + '</table>');
}

function fillEnemies() {
	// Create a <canvas> for each enemy
	var html = '';
	var i;
	for (i = 0; i < enemies.length; i++) {
		html += '<div class="enemy"><canvas id="enemy' + i + '"></canvas>' + enemies[i].name + '</div>';
	}
	$('#enemies').html(html);
	$('.enemy:first-child').addClass('selected');
	
	// Draw each enemy on their <canvas>
	for (i = 0; i < enemies.length; i++) {
		var p = $('#enemy' + i)[0];
		p.width = 50;
		p.height = 60;
		
		var c = p.getContext('2d');
		c.translate(25, 30);
		c.scale(50, -50);
		c.lineWidth = 1 / 50;
		c.fillStyle = c.strokeStyle = 'green'; // TODO: remove this when everything is drawin, just used to make sure sprites specify colors
		enemies[i].draw(c);
	}
	
	// Add an action to each enemy button
	$('#enemies .enemy').mousedown(function(e) {
		$('.selected').removeClass('selected');
		$(this).addClass('selected');
		e.preventDefault();
	});
}

$(document).ready(function() {
	// Add an action to each toolbar button
	$('#toolbar .section a').mousedown(function(e) {
		var oldMode = editor.mode;
		var mode = eval(this.id);
		editor.setMode(mode);
		$('.current').removeClass('current');
		$(this).addClass('current');
		e.preventDefault();
		showOrHidePanels(mode, oldMode);
	});
	
	// Connect the canvas and the editor
	var canvas = $('#canvas')[0];
	editor = new Editor(canvas);
	resizeEditor();
	
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
