/* Freeciv Battle Simulator */

function is_hidden_property(key) {
	return (key[0] === '_') ? true : false;
}

/** Constructor */
function Type(opts) {
	opts = opts || {};
	var self = this;
}

/** Internal data */
Type.prototype.valueOf = function() {
	var self = this;
	var obj = {};
	Object.keys(self).filter(is_hidden_property).forEach(function(key) {
		key = key.substr(1);
		obj[key] = self['_'+key];
	});
	return obj;
};

/* */
Type.parseOptionStrings = function(keys, self, opts) {
	keys.forEach(function(key) {
		if(opts[key] !== undefined) {
			self['_'+key] = ''+opts[key];
		}
	});
};

/* */
Type.parseOptionInts = function(keys, self, opts) {
	keys.forEach(function(key) {
		if(opts[key] !== undefined) {
			self['_'+key] = parseInt(opts[key], 10);
		}
	});
};

/* */
Type.parseOptionBooleans = function(keys, self, opts) {
	keys.forEach(function(key) {
		if(opts[key] !== undefined) {
			self['_'+key] = opts[key] ? true : false;
		}
	});
};

// Exports
module.exports = Type;

/* EOF */
