/* Freeciv Battle Simulator */

var util = require('util');
var Unit = require('./Unit.js');

/** Constructor */
function combat(opts) {
	opts = opts || {};

	['terrain', 'attackers', 'defenders'].forEach(function(key) {
		if(opts[key] === undefined) {
			throw TypeError('bad arguments');
		}
	});

	var terrain = opts.terrain.clone();
	var attackers = opts.attackers.map(function(obj) { return obj.clone(); });
	var defenders = opts.defenders.map(function(obj) { return obj.clone(); });

	var att, def;
	while( (attackers.length >= 1) && (defenders.length >= 1) ) {
		att = attackers.shift();
		def = defenders.shift();

		var result = Unit.combat(att, def, {
			'tired_attack': opts.tired_attack || true,
			'tile': terrain,
			'city': false,
			'terrain_defence': true,
			'river_defense_bonus': 50
		});

		if(att === result.winner) {
			util.debug('Attacker wins, all defenders die.');
			defenders = [];
			attackers.push(att);
		} else {
			util.debug('Defender wins, the attacker dies.');
			defenders.push(def);
		}
	}

	return {"attackers":attackers, "defenders":defenders};
}

// Exports
module.exports = combat;

/* EOF */
