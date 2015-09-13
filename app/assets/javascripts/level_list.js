function textToHTML(text) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function Level(title, html_title, position, difficulty, id) {
	this.title = title;
	this.html_title = html_title;
	this.position = position;
	this.difficulty = difficulty;
	this.id = id;
	this.element = null;
}

Level.prototype.loadFromJSON = function(json) {
	this.title = json.title;
	this.position = json.position;
	this.difficulty = json.difficulty;
	this.html_title = json.html_title;
};

Level.prototype.saveToJSON = function() {
	return {
		levelname: this.html_title,
		level: {
			title: this.title,
			position: this.position,
			difficulty: this.difficulty
		}
	};
};

Level.prototype.createElement = function() {
	this.element = document.createElement('li');
	this.element.level = this;
	this.updateHTML();
};

Level.prototype.updateHTML = function() {
	var difficulties = ['Easy', 'Medium', 'Hard', 'Brutal', 'Demoralizing'];
	var html = '';
	html += '<span>&varr;</span> ';
	html += this.title + ' ';
	html += '<span class="links"><select>';
	for (var i = 0; i < difficulties.length; i++) {
		html += '<option value="' + i + '"' + (this.difficulty == i ? ' selected' : '') + '>' + difficulties[i] + '</option>';
	}
	html += '</select>&nbsp; &nbsp; &nbsp ';
	html += '<a href="/edit/' + this.html_title + '/">Edit</a> ';
	html += '<a href="javascript:void(0)" class="rename">Rename</a> ';
	html += '<a href="/levels/' + this.id + '/" data-confirm="Deleted levels cannot be recovered!  Are you sure you want to delete ' + this.title + '?" data-method="delete" rel="nofollow">Delete</a>';
	html += '</span>';
	this.element.innerHTML = html;
};

Level.prototype.trySavingToServer = function() {
	var this_ = this;
	$.ajax({
		url: '/edit/' + this.html_title + '.json',
		type: 'PUT',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
    },
		data: this.saveToJSON(),
		success: function(json) {
			this_.loadFromJSON(json);
			this_.updateHTML();
		},
		error: function(request, status, error) {
			alert('The level could not be renamed.\nError: ' + request.responseText);
		}
	});
};

$(window).load(function() {
	// handle difficulty changes
	$('.links select').live('change', function(e) {
		var level = e.target.parentNode.parentNode.level;
		level.difficulty = parseInt(e.target.value, 10);
		level.trySavingToServer();
	});

	// handle level renaming
	$('.rename').live('click', function(e) {
		var level = e.target.parentNode.parentNode.level;
		var title = prompt('Change the level title:', level.title);
		if (title != null) {
			// don't commit the level title yet because the server might not like it
			var oldTitle = level.title;
			level.title = title;
			level.trySavingToServer();
			level.title = oldTitle;
		}
	});

	// handle level reordering (this uses O(1) reordering based on averaging)
	$('#levels').sortable({
		axis: 'y',
		update: function(e, ui) {
			var levelElements = $('#levels li');
			var count = levels.length;
			var level = ui.item[0].level;
			var i = $(ui.item).index();

			if (i == 0 && count > 1) {
				var after = levelElements[i + 1].level.position;
				level.position = after / 2;
			} else if (i > 0 && i < count - 1) {
				var before = levelElements[i - 1].level.position;
				var after = levelElements[i + 1].level.position;
				level.position = (before + after) / 2;
			} else {
				var before = levelElements[i - 1].level.position;
				level.position = before + 1;
			}

			level.trySavingToServer();
		}
	});

	// create a DOM element for each level
	var levelsParent = document.getElementById('levels');
	levelsParent.innerHTML = '';
	for (var i = 0; i < levels.length; i++) {
		levels[i].createElement();
		levelsParent.appendChild(levels[i].element);
	}
});
