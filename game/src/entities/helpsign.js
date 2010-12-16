#require <class.js>
#require <enemy.js>

var HELP_SIGN_TEXT_WIDTH = 1.5;
var HELP_SIGN_WIDTH = 0.7;
var HELP_SIGN_HEIGHT = 0.7;

HelpSign.extends(Enemy);

// Help signs take in an array of strings, each string in the array is drawn
// on its own line.
function HelpSign(center, text, width) {
    Enemy.prototype.constructor.call(this, ENEMY_HELP_SIGN, 0);
    this.hitBox = AABB.makeAABB(center, HELP_SIGN_WIDTH, HELP_SIGN_HEIGHT);
    this.textArray = null;
    this.text = text;
    this.drawText = false;
    if (width === undefined) {
        this.textWidth = HELP_SIGN_TEXT_WIDTH;
    } else {
        this.textWidth = width;
    }
}

// Private helper
// Splits up a string into an array of phrases based on the width of the sign
HelpSign.prototype.splitUpText = function(c, phrase) {
    var words = phrase.split(" ");
    var phraseArray = new Array();
    var lastPhrase = "";
    c.font = "12px sans serif";
    var maxWidth = this.textWidth * gameScale;
    var measure = 0;
    for (var i = 0; i < words.length; ++i) {
        var word = words[i];
        measure = c.measureText(lastPhrase + word).width;
        if (measure < maxWidth) {
            lastPhrase += " " + word;
        } else {
            phraseArray.push(lastPhrase);
            lastPhrase = word;
        }
        if (i == words.length - 1) {
            phraseArray.push(lastPhrase);
            break;
        }
    }
    return phraseArray;
}

HelpSign.prototype.getShape = function() { return this.hitBox; }

HelpSign.prototype.canCollide = function() { return false; }

HelpSign.prototype.tick = function(seconds) {
    this.drawText = false;
    Enemy.prototype.tick.call(this, seconds);
}

HelpSign.prototype.reactToPlayer = function(player) {
    this.drawText = true;
}

HelpSign.prototype.draw = function(c) {
    if (this.textArray === null) {
        this.textArray = this.splitUpText(c, this.text);
    }
    this.hitBox.draw(c);
    if (this.drawText) {
        c.save();
        c.scale(1 / gameScale, -1 / gameScale);
        c.font = "12px sans serif";
        c.fillStyle = "black";
        c.lineWidth = 2;
        c.textAlign = "center";
        var textCenter = (this.hitBox.getLeft() + this.hitBox.getWidth() / 2) * gameScale;
        var textTop = -this.hitBox.getTop() * gameScale - 12 * this.textArray.length;
        // Draw each phrase, starting from the top down
        for (var i = 0; i < this.textArray.length; ++i) {
            var text = this.textArray[i];
            c.fillText(text, textCenter, textTop);
            textTop += 12;
        }
        c.restore();
    }
}

