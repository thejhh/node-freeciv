/* Test combat */

var util = require('util');
var freeciv = require('../src');

var mountains = new freeciv.Terrain({
	'name':'Mountains',
	'defense_bonus':200
});

var archer = new freeciv.Unit({
	'name':'Archers',
	'build_cost': 30,
	'attack': 3,
	'defense': 2,
	'hitpoints': 10,
	'firepower': 1,
	'moves': 3*3
});

var phalanx = new freeciv.Unit({
	'name': 'Phalanx',
	'build_cost': 20,
	'attack': 1,
	'defense': 2,
	'hitpoints': 10,
	'firepower': 1,
	'moves': 3*3
});

var attackers = [
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1}),
	archer.clone({'veteran':1})
];

var defenders = [
	archer.clone({'veteran':1,'fortified':true}),
	phalanx.clone({'veteran':1,'fortified':true}),
	phalanx.clone({'veteran':1,'fortified':true}),
	phalanx.clone({'veteran':1,'fortified':true})
];

util.debug("attackers = " + attackers.length );
util.debug("defenders = " + defenders.length );
util.debug("---- combat starts ----");

var result = freeciv.combat({
	'terrain': mountains,
	'attackers': attackers,
	'defenders': defenders,
	'tired_attack': true
});
util.debug("---- combat ended ----");

util.debug("attackers left " + result.attackers.length + " of " + attackers.length );
util.debug("defenders left " + result.defenders.length + " of " + defenders.length );

/* EOF */
