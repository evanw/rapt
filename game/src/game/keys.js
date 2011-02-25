#require <util.js>

function toTitleCase(s) {
	return s.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); });
}

var Keys = {
	keyMap: {
		'killKey': 75,     // k key

		// player a
		'a-jumpKey': 38,   // up arrow key
		'a-crouchKey': 40, // down arrow key
		'a-leftKey': 37,   // left arrow key
		'a-rightKey': 39,  // right arrow key

		// player b
		'b-jumpKey': 87,   // w key
		'b-crouchKey': 83, // s key
		'b-leftKey': 65,   // a key
		'b-rightKey': 68   // d key
	},

	fromKeyCode: function(keyCode) {
		for (var name in this.keyMap) {
			if (keyCode == this.keyMap[name]) {
				return name;
			}
		}
		return null;
	},

	keyCodeHTML: function(keyCode) {
		var name = keyCodeArray[keyCode] || '&iquest;';
		var html = toTitleCase(name).replace(' ', '<br>');
		if (html.charAt(0) != '&' && html.length > 1) {
			html = '<div style="' + (html.indexOf('<br>') != -1 ? 'padding-top:10px;line-height:15px;' : '') +
				'font-size:' + (html.length <= 3 ? 25 : html.length <= 5 ? 18 : 15).toFixed() + 'px;">' + html + '</div>';
		}
		return html;
	},

	load: function() {
		for (var name in this.keyMap) {
			var keyCode = parseInt(getLocalStorage(name), 10);
			if (!isNaN(keyCode)) {
				this.keyMap[name] = keyCode;
			}
		}
		this.updateHTML();
	},

	save: function() {
		for (var name in this.keyMap) {
			setLocalStorage(name, this.keyMap[name]);
		}
		this.updateHTML();
	},

	updateHTML: function() {
		for (var name in this.keyMap) {
			$('#' + name).html(this.keyCodeHTML(this.keyMap[name]));
		}
	}
};
