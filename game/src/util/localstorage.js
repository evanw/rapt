function setLocalStorage(name, value) {
	// attempt to use localStorage first
	if (typeof localStorage != 'undefined') {
		localStorage[name] = value;
	} else {
		var date = new Date();
		date.setTime(date.getTime() + 5*365*24*60*60*1000);
		document.cookie = name + '=' + value + '; expires=' + date.toGMTString() + '; path=/';
	}
}

function getLocalStorage(name) {
	// attempt to use localStorage first
	if (typeof localStorage != 'undefined') {
		return localStorage.hasOwnProperty(name) ? localStorage[name] : '';
	} else {
		var pairs = document.cookie.split(';');
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i], equals = pair.indexOf('=');
			if (equals != -1 && pair.substring(0, equals).replace(/ /g, '') == name) {
				return pair.substring(equals + 1);
			}
		}
		return '';
	}
}
