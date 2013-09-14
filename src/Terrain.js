/* Freeciv Battle Simulator */

var util = require('util');
var Type = require('./Type.js');

/** Constructor */
function Terrain(opts) {
	opts = opts || {};
	var self = this;

	Type.call(this);

	// Strings
	Type.parseOptionStrings(['name'], self, opts);
	Type.parseOptionInts(['defense_bonus'], self, opts);
}

util.inherits(Terrain, Type);

/** Get string presentation */
Terrain.prototype.toString = function() {
	return 'Terrain(' + JSON.stringify(this.valueOf())+')';
};

/** Clone the object */
Terrain.prototype.clone = function(opts) {
	opts = opts || {};
	var value = this.valueOf();
	Object.keys(opts).forEach(function(key) {
		value[key] = opts[key];
	});
	return new Terrain(value);
};

// Exports
module.exports = Terrain;

/* EOF */
