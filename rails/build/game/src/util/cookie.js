function setCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		var expires = '; expires=' + date.toGMTString();
	} else {
		var expires = '';
	}
	document.cookie = name + '=' + escape(value) + expires + '; path=/';
}

function getCookie(name) {
	var nameEQ = name + '=';
	var parts = document.cookie.split(';');
	for (var i = 0; i < parts.length; i++) {
		var c = parts[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) {
			return unescape(c.substring(nameEQ.length, c.length));
		}
	}
	return null;
}
