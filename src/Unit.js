/* Freeciv Battle Simulator */

var util = require('util');
var Type = require('./Type.js');

var POWER_FACTOR = 10;
var SINGLE_MOVE = 3;

/** Constructor */
function Unit(opts) {
	opts = opts || {};
	var self = this;

	Type.call(this);

	// Strings
	Type.parseOptionStrings(['name'], self, opts);
	Type.parseOptionInts(['build_cost', 'attack', 'defense', 'hitpoints', 'firepower', 'veteran', 'hp', 'moves', 'moves_left'], self, opts);
	Type.parseOptionBooleans(['fortified'], self, opts);

	if(self._hp === undefined) {
		self._hp = self._hitpoints;
	}

	if(self._moves_left === undefined) {
		self._moves_left = self._moves;
	}
}

util.inherits(Unit, Type);

/** Get string presentation */
Unit.prototype.toString = function() {
	return 'Unit(' + JSON.stringify(this._name)+')';
};

/** Clone the object */
Unit.prototype.clone = function(opts) {
	opts = opts || {};
	var value = this.valueOf();
	Object.keys(opts).forEach(function(key) {
		value[key] = opts[key];
	});
	return new Unit(value);
};

/** This is the basic unit versus unit combat routine. */
Unit.combat = function(attacker, defender, opts) {
	opts = opts || {};
	
	var tired_attack = opts.tired_attack || false;
	var tile = opts.tile;
	var is_city = opts.city || false;
	var has_terrain_defence = (opts.terrain_defence === undefined) ? true : (opts.terrain_defence || false);
	var river_defense_bonus = opts.river_defense_bonus || 50;

	if(!tile) {
		throw new TypeError("bad arguments");
	}

	function fc_rand(n) {
		if(!n) { throw new TypeError("bad argument"); }
		var r = Math.floor(Math.random()*n);
		util.debug('fc_rand('+util.inspect(n)+') returns '+ util.inspect(r) );
		return r;
	}

	function get_veteran_power_fact(veteran) {
		if(!veteran) { throw new TypeError("bad argument"); }
		var levels = [100, 150];
		util.debug('get_veteran_power_fact('+util.inspect(veteran)+') returns '+ util.inspect(levels[veteran]) );
		return levels[veteran];
	}

	function get_total_attack_power(attacker) {
		if(!attacker) { throw new TypeError("bad argument"); }
		util.debug('attacker._attack = '+util.inspect(attacker._attack) );
		util.debug('POWER_FACTOR = '+util.inspect(POWER_FACTOR) );
		var power = Math.floor( attacker._attack * POWER_FACTOR * get_veteran_power_fact(attacker._veteran) / 100 );
		util.debug('power = '+util.inspect(power) );
		if (tired_attack && attacker._moves_left < SINGLE_MOVE) {
			power = Math.floor( (power * attacker._moves_left) / SINGLE_MOVE );
			util.debug('power = '+util.inspect(power) + ' (after tired attack)' );
		}
		util.debug('get_total_attack_power('+util.inspect(attacker)+') returns '+ util.inspect(power) );
		return power;
	}

	function get_total_defense_power(attacker, defender) {
		if(!attacker) { throw new TypeError("bad argument"); }
		if(!defender) { throw new TypeError("bad argument"); }

		function get_defense_power(defender) {
			if(!defender) { throw new TypeError("bad argument"); }

			function base_get_defense_power(defender) {
				if(!defender) { throw new TypeError("bad argument"); }
				util.debug('defender._defense = '+ util.inspect(defender._defense) );
				util.debug('POWER_FACTOR = '+ util.inspect(POWER_FACTOR) );
				util.debug('defender._veteran = '+ util.inspect(defender._veteran) );
				var power = Math.floor( defender._defense * POWER_FACTOR * get_veteran_power_fact(defender._veteran) / 100 );
				util.debug('base_get_defense_power('+util.inspect(defender)+') returns '+ util.inspect(power) );
				return power;
			}
			
			var power = base_get_defense_power(defender);
			util.debug('power = ' + util.inspect(power));

			if (has_terrain_defence) {
				util.debug('tile._defense_bonus = ' + util.inspect(tile._defense_bonus) );
				var db = 10 + Math.floor(tile._defense_bonus / 10);
				util.debug('db = ' + util.inspect(db) );
				if(tile._river) {
					db += Math.floor( (db * river_defense_bonus) / 100 );
					util.debug('db = ' + util.inspect(db) + ' (after river bonus)');
				}
				power = Math.floor((power * db) / 10);
				util.debug('power = ' + util.inspect(power) + ' (after has_terrain_defence)');
			}

			util.debug('get_defense_power('+util.inspect(defender)+') returns '+ util.inspect(power) );
			return power;
		}

		var defensepower = get_defense_power(defender);
		var fortified = defender._fortified;

		util.debug('defensepower = ' + util.inspect(defensepower));
		util.debug('fortified = ' + util.inspect(fortified));
		
		if (!is_city) {
			util.debug('tile._defense_bonus = ' + util.inspect(tile._defense_bonus) );
			defensepower += Math.floor( defensepower * tile._defense_bonus / 100 );
			util.debug('defensepower = ' + util.inspect(defensepower) + ' (after tile defense bonus)');
		}
		
		if (is_city || fortified) {
			defensepower = Math.floor( (defensepower * 3) / 2 );
			util.debug('defensepower = ' + util.inspect(defensepower) + ' (after city bonus or fortified)');
		}

		util.debug('get_total_defense_power('+util.inspect(attacker)+', '+util.inspect(defender)+') returns '+ util.inspect(defensepower) );
		return defensepower;
	}

	function get_modified_firepower(attacker, defender) {
		if(!attacker) { throw new TypeError("bad argument"); }
		if(!defender) { throw new TypeError("bad argument"); }

		var attack = attacker._firepower;
		var defense = defender._firepower;

		// FIXME: Implement flags

		var ret = {'attack': attack, 'defense': defense};
		util.debug('get_modified_firepower('+util.inspect(attacker)+', '+util.inspect(defender)+') returns '+ util.inspect(ret) );
		return ret;
	}

	// Actual fight

	var attackpower = get_total_attack_power(attacker,defender);
	var defensepower = get_total_defense_power(attacker,defender);

	var firepower = get_modified_firepower(attacker, defender);

	// FIXME: Implement bombard

	if(attackpower === 0) {
		attacker._hp = 0;
	} else if(defensepower === 0) {
		defender._hp = 0;
	}

	util.debug('attackpower = ' + attackpower);
	util.debug('defensepower = ' + defensepower);

	util.debug('fight starts: defender{'+defender+'} has ' + defender._hp + ' hp, attacker{'+attacker+'} has ' + attacker._hp + ' hp');
	util.debug('----');

	while ((attacker._hp > 0) && (defender._hp > 0)) {
		if (fc_rand(attackpower+defensepower) >= defensepower) {
			util.debug('defender takes hit by ' + firepower.attack + ' hp');
			defender._hp -= firepower.attack;
		} else {
			util.debug('attacker takes hit by ' + firepower.defense + ' hp');
			attacker._hp -= firepower.defense;
		}
	}
	if (attacker._hp < 0) {
		attacker._hp = 0;
	}
	if (defender._hp < 0) {
		defender._hp = 0;
	}

	util.debug('----');
	util.debug('fight over: defender{'+defender+'} has ' + defender._hp + ' hp, attacker{'+attacker+'} has ' + attacker._hp + ' hp');

	var winner = (attacker._hp > 0) ? attacker : defender;

	util.debug('winner is ' + winner);

	return {winner:winner, attacker:attacker, defender:defender};
};

// Exports
module.exports = Unit;

/* EOF */
