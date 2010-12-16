var editor = null;
var buttons = 0;

function resizeEditor() {
	var toolbarHeight = $('#toolbar').outerHeight();
	var helpPanelWidth = 0;
	
	if (editor.mode == MODE_OTHER_HELP) {
		helpPanelWidth = $('#help').outerWidth();
		$('#help').css({ top: toolbarHeight + 'px' });
	}
	
	editor.resize($(window).width() - helpPanelWidth, $(window).height() - toolbarHeight);
	editor.draw();
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
	
	// Keyboard shortcuts
	var keys = [
		'Save', (mac ? meta : ctrl) + 'S',
		'Undo', (mac ? meta : ctrl) + 'Z',
		'Redo', mac ? meta + shift + 'Z' : ctrl + 'Y',
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

$(document).ready(function() {
	// Add an action to each toolbar button
	$('#toolbar .section a').each(function(index) {
		$(this).mousedown(function(e) {
			// Update the editor mode
			var oldMode = editor.mode;
			var mode = eval(this.id);
			editor.setMode(mode);
			$('.current').removeClass('current');
			$(this).addClass('current');
			e.preventDefault();
			
			// Show or hide the help panel
			if (mode == MODE_OTHER_HELP) {
				$('#help').css({ display: 'block' });
				resizeEditor();
				fillHelp();
			} else if(oldMode == MODE_OTHER_HELP) {
				$('#help').hide();
				resizeEditor();
			}
		});
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
		} else if(e.which == 'S'.charCodeAt(0)) {
			editor.save();
			e.preventDefault();
		}
	}
});
