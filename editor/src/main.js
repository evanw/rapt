var editor = null;
var buttons = 0;

function resizeEditor() {
	editor.resize($(window).width(), $(window).height() - $('#toolbar').outerHeight());
	editor.draw();
}

function mousePoint(e) {
	var offset = $('#canvas').offset();
	return new Vector(e.pageX - offset.left, e.pageY - offset.top);
}

$(document).ready(function() {
	// Add an action to each toolbar button
	$('#toolbar .section a').each(function(index) {
		$(this).click(function(e) {
			editor.setMode(eval(this.id));
			$('.current').removeClass('current');
			$(this).addClass('current');
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
		if (buttons !== 0) {
			editor.mouseMoved(mousePoint(e), buttons);
		}
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
