////////////////////////////////////////////////////////////////////////////////
// class SidebarGenerator
////////////////////////////////////////////////////////////////////////////////

function SidebarGenerator() {
	this.inTable = false;
	this.numCells = 0;
	this.html = '';
}

SidebarGenerator.prototype.addCell = function(html) {
	this.setInTable(true);
	if (!(this.numCells & 1)) this.html += '<tr>';
	this.html += '<td>' + html.replace(/^---$/, '<hr>') + '</td>';
	if (this.numCells & 1) this.html += '</tr>';
	this.numCells++;
};

SidebarGenerator.prototype.addRow = function(html) {
	this.setInTable(true);
	this.html += '<tr><td colspan="2">' + html.replace(/^---$/, '<hr>') + '</td></tr>';
	this.numCells += 2;
};

SidebarGenerator.prototype.addHeader = function(html) {
	this.setInTable(false);
	this.html += '<div class="header">' + html + '</div>';
};

SidebarGenerator.prototype.addInfo = function(html) {
	this.setInTable(false);
	this.html += '<div class="info">' + html + '</div>';
};

SidebarGenerator.prototype.setInTable = function(inTable) {
	if (!this.inTable && inTable) {
		this.html += '<table>';
	} else if (this.inTable && !inTable) {
		this.html += '</table>';
		this.numCells = 0;
	}
	this.inTable = inTable;
};

SidebarGenerator.prototype.getHTML = function() {
	this.setInTable(false);
	return this.html;
};
