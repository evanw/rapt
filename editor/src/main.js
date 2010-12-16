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
	$('#toolbar .section a').each(function(index) {
		$(this).click(function(e) {
			editor.setMode(index);
			$('.current').removeClass('current');
			$(this).addClass('current');
		});
	});
	
	var canvas = $('#canvas')[0];
	editor = new Editor(canvas);
	resizeEditor();
	
	$(canvas).mousedown(function(e) {
		editor.mouseDown(mousePoint(e));
		buttons |= (1 << e.which);
		e.preventDefault();
	});

	$(canvas).mousemove(function(e) {
		if (buttons !== 0) {
			editor.mouseDragged(mousePoint(e));
		}
		e.preventDefault();
	});

	$(canvas).mouseup(function(e) {
		editor.mouseUp(mousePoint(e));
		buttons &= ~(1 << e.which);
		e.preventDefault();
	});

	$(canvas).mousewheel(function(e, delta, deltaX, deltaY) {
		editor.mouseWheel(deltaX, deltaY);
		if (buttons !== 0) {
			editor.mouseDragged(mousePoint(e));
		}
	});
});

$(window).resize(function() {
	resizeEditor();
});
