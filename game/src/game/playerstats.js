function loadStats(username, callback) {
	$.ajax({
		'url': '/stats/' + username,
		'type': 'GET',
		'cache': false,
		'dataType': 'json',
		'success': callback
	});
}

function saveStats(username, levelname, stats) {
	$.ajax({
		'url': '/stats/' + username + '/' + levelname,
		'type': 'PUT',
		'dataType': 'json',
		'data': JSON.stringify({
			'statistic': {
				'complete': stats.complete,
				'got_all_cogs': stats.gotAllCogs
			}
		}),
		'contentType': 'application/json; charset=utf-8'
	});
}

function PlayerStats(username, callback) {
	this.username = username;
	this.stats = {};

	if (this.username != null) {
		var this_ = this;
		loadStats(username, function(stats) {
			for (var i = 0; i < stats.length; i++) {
				var s = stats[i]['statistic'];
				this_.stats[s.levelname] = {
					complete: s['complete'],
					gotAllCogs: s['got_all_cogs']
				};
			}
			callback();
		});
	}
}

PlayerStats.prototype.getStatsForLevel = function(levelname) {
	if (this.username != null) {
		if (levelname in this.stats) {
			return this.stats[levelname];
		}
	} else {
		// TODO: cookies
	}
	return {
		complete: false,
		gotAllCogs: false
	};
};

PlayerStats.prototype.setStatsForLevel = function(levelname, complete, gotAllCogs) {
	if (this.username != null) {
		var stats = {
			complete: complete,
			gotAllCogs: gotAllCogs
		};
		this.stats[levelname] = stats;
		saveStats(this.username, levelname, stats);
	} else {
		// TODO: cookies
	}
};
