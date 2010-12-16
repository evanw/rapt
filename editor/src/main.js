var editor;

function resizeEditor() {
	editor.resize($(window).width(), $(window).height() - $('#toolbar').outerHeight());
	editor.draw();
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
});

$(window).resize(function() {
	resizeEditor();
});
