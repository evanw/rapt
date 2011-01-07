var COLOR_NEUTRAL = 0;
var COLOR_RED = 1;
var COLOR_BLUE = 2;

// Need to use toFixed() so the negative exponent doesn't show up for small numbers
function rgba(r, g, b, a) {
	return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(5) + ')';
}

function randInRange(min, max) {
	return min + (max - min) * Math.random();
}

function dashedLine(c, start, end) {
	var dir = end.sub(start);
	var n = dir.length() * 10;
	dir = dir.div(n);
	c.beginPath();
	for (var i = 0; i + 1 < n; i += 2) {
		c.moveTo(start.x, start.y);
		start = start.add(dir);
		c.lineTo(start.x, start.y);
		start = start.add(dir);
	}
	if (i < n) {
		c.moveTo(start.x, start.y);
		start = start.add(dir.mul(n - i));
		c.lineTo(start.x, start.y);
	}
	c.stroke();
}

var TEXT_BOX_X_MARGIN = 6;
var TEXT_BOX_Y_MARGIN = 6;
var HELP_SIGN_TEXT_WIDTH = 1.5;

// Splits up a string into an array of phrases based on the width of the sign
function splitUpText(c, phrase) {
	var words = phrase.split(" ");
	var phraseArray = new Array();
	var lastPhrase = "";
	c.font = "12px sans serif";
	var maxWidth = HELP_SIGN_TEXT_WIDTH * 50;
	var measure = 0;
	for (var i = 0; i < words.length; ++i) {
		var word = words[i];
		measure = c.measureText(lastPhrase + word).width;
		if (measure < maxWidth) {
			lastPhrase += " " + word;
		} else {
			if (lastPhrase.length > 0) phraseArray.push(lastPhrase);
			lastPhrase = word;
		}
		if (i == words.length - 1) {
			phraseArray.push(lastPhrase);
			break;
		}
	}
	return phraseArray;
}

// Draw a text box, takes in an array of lines
function drawTextBox(c, textArray, xCenter, yCenter, textSize) {
	var numLines = textArray.length;
	if (numLines < 1) return;

	// Calculate the height of all lines and the widest line's width
	c.font = textSize + 'px Arial, sans-serif';
	var lineHeight = textSize + 2;
	var textHeight = lineHeight * numLines;
	var textWidth = -1;
	for (var i = 0; i < numLines; ++i) {
		var currWidth = c.measureText(textArray[i]).width;
		if (textWidth < currWidth) {
			textWidth = currWidth;
		}
	}

	// Draw the box
	c.fillStyle = '#BFBFBF';
	c.strokeStyle = '#7F7F7F';
	var xLeft = xCenter - textWidth / 2 - TEXT_BOX_X_MARGIN;
	var yBottom = yCenter - textHeight / 2 - TEXT_BOX_Y_MARGIN;
	c.fillRect(xLeft, yBottom, textWidth + TEXT_BOX_X_MARGIN * 2, textHeight + TEXT_BOX_Y_MARGIN * 2);
	c.strokeRect(xLeft, yBottom, textWidth + TEXT_BOX_X_MARGIN * 2, textHeight + TEXT_BOX_Y_MARGIN * 2);

	// Draw the text
	c.fillStyle = 'black';
	c.textAlign = 'center';
	// yCurr starts at the top, so subtract half of height of box
	var yCurr = yCenter + 4 - (numLines - 1) * lineHeight / 2;
	for (var i = 0; i < numLines; ++i) {
		c.fillText(textArray[i], xCenter, yCurr);
		yCurr += lineHeight;
	}
}
