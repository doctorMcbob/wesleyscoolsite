'use strict'
/*
Hey there cool kid code reader!

You're prob wondering what the fuck is going on.
if your just looking for some console commands
to give yourself an over powered run, try:

DEPTH = 10; // look at any floor
STATS.HP = 1000;
STATS.STR = 1000;
CONDITIONS.push("intangible");

or even 

FLOORS[DEPTH]["END"].add(pack(3, 3))

if you're more interested in how the game works,
perhaps you could use a run down of some of the
MAIN COMPONENTS:
 . There is a list of ACTOR keys. Every game piece is present here.
 . There is a list of actors that are TANGIBLE.
 . The dungeon is stored as an array FLOORS
   . each floor is an Object,
       { ACTOR KEY : Set() } <-- positions are stored as strings
                                 for easy Set.has(position) checks
 . Sprites are stored in an Object SPRITES,
   { ACTOR KEY : "#" } <-- text string to be placed on board

 . Colors are stored in a similar Object COLORS,
   { ACTOR KEY : ["#FFFFFF", "#000000"] } <-- bottom color, top color
                                              or rather, the bottom color is the floor
                                              below and the top color is the text 
 . Living creatures are Objects representing their state
   . they are stored in an Object BRAINS
   {
     ACTOR KEY : [ {...}]
   }               ^
                   |  
      {            |
         name   : ACTOR key,
         HP     : 10, <-- (optional: present when killable)
         DMG    : 8,  <-- (optional: present when hurts you)
	 update : function, <-- arguments ( floor, brain ( this ) )
	 pos    : "2,3",
	 ...  <-- other to be used in the function
      }
*/

// Fuck javascript ;)
function remove(list, item) {
    const idx = list.indexOf(item);
    list.splice(idx, 1);
}

const W = 48; const H = 32;
const PW = 16;
const interval = null;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
ctx.canvas.width = W*PW; ctx.canvas.height = H*PW;
ctx.font = String(PW) + "px Arial";

let DEPTH = 0;
let STEPS = 0;

// player attributes
const CONDITIONS = new Set();
const STATS = {
    "HP": 50,
    "STR": 1,
    "INV": [],
}

// keys
// the order is important for how they are drawn
// first bottom color from the bottom of the list
// first sprite from the top of the list 
const ACTORS = [
    "BLOOD", "STONE",
    "SPORE",
    "CARPET1", "CARPET2", "TABLE",
    "WALLS", "HARDWOOD",  
    "ASH",
    "WATER",
    "GRASS1",  "GRASS2",  "GRASS3",
    "ROCK1",  "ROCK2",  "ROCK3",
    "DOORS", "CHEST",
    "FIREBALL", 
    "FIRE1", "FIRE2", "FIRE3",
    "CARPET1", "CARPET2",
    "DOWNSTAIRS", "UPSTAIRS",
    "RED MUSHROOM", "BLUE MUSHROOM", "GREEN MUSHROOM",
    "PURPLE MUSHROOM", "BLACK MUSHROOM", "WHITE MUSHROOM",
    "TELEPORTER", "FIRE WAND", "FOOD", "KEY", "THROWING STAR",
    "GOOSEBALL", "RABBIT", "VILLAGER",
    "BAT", "SNAKE", "DWARF", "TABLE",
    "STAR", "STAR1", "STAR2",
    "PLAYER",
    "END", "STEPS",
    "WELCOME", "TUTORIAL1", "TUTORIAL2", "TUTORIAL3", "TUTORIAL4",
    "TUTORIAL5", "TUTORIAL6", "TUTORIAL7", "TUTORIAL8", "TUTORIAL9",
    "TUTORIAL10", "TUTORIAL11", "TUTORIAL12",
];

const TANGIBLE = ["WALLS", "STONE", "WATER", "TABLE"];
const FLAMMABLE = ["WALLS", "HARDWOOD", "DOORS", "GRASS2", "CARPET1", "CARPET2", "TABLE"];

// token representation
const SPRITES = {
    "STONE"     : "#",
    "WATER"     : "~",
    "WALLS"     : "#",
    "VILLAGER"  : "Ö",
    "BLOOD"     : "",
    "SPORE"     : "",
    "FOOD"      : "º",
    "CHEST"     : "€",
    "KEY"       : "¬",
    "TELEPORTER": "±",
    "FIRE WAND" : "¡",
    "FIRE1"     : "^",
    "FIRE2"     : "^",
    "FIRE3"     : "ˆ",
    "ASH"       : ".",
    "GRASS1"    : ",",
    "GRASS2"    : ",",
    "GRASS3"    : ".",
    "ROCK1"     : "+",
    "ROCK2"     : "×",
    "ROCK3"     : "+",
    "STAR1"     : "×",
    "STAR2"     : "+",
    "THROWING STAR": "×",
    "UPSTAIRS"  : ">",
    "DOWNSTAIRS": "<",
    "DOORS"     : "_",
    "HARDWOOD"  : "+",
    "PLAYER"    : "@",
    "RABBIT"    : "r",
    "GOOSEBALL" : "g",
    "BAT"       : "b",
    "SNAKE"     : "s",
    "DWARF"     : "ô",
    "TABLE"     : "=",
    "CARPET1"   : "]",
    "CARPET2"   : "[",    
    "FIREBALL"  : "•",
    
    "RED MUSHROOM": "¶",
    "BLUE MUSHROOM": "¶",
    "GREEN MUSHROOM": "¶",
    "PURPLE MUSHROOM": "¶",
    "BLACK MUSHROOM": "¶",
    "WHITE MUSHROOM": "¶",
    
    "END"       : "You have reached the end! ~",
    "STEPS"     : "You took 0 steps",
    "WELCOME"   : "Welcome to Another Procedural Dungeon Crawler!",
    "TUTORIAL1" : "W A S D to move.       You must go up the stairs!",
    "TUTORIAL2" : "Down stairs:",
    "TUTORIAL3" : "Up stairs:",
    "TUTORIAL4" : "Player: ",
    "TUTORIAL5" : "Stone:",
    "TUTORIAL6" : "Wall:",
    "TUTORIAL7" : "Door:",
    "TUTORIAL8" : "Floor:",
    "TUTORIAL9" : "Rabbit:",
    "TUTORIAL10": "Water:",
    "TUTORIAL11": "Chest:",
    "TUTORIAL12": "Key:",
};

// background, foreground
const FLOOR = "#CFCFCF";
const COLORS = {
    "STONE": ["#676767", "#002233"],
    "WALLS": ["#C19A6B", "#4D3300"],
    "WATER": ["#4F42B5", "#0077BE"],
    "BLOOD": ["#AF002A", "#000000"],
    "RED MUSHROOM": [false, "#FF0000"],
    "BLUE MUSHROOM": [false, "#0000FF"],
    "GREEN MUSHROOM": [false, "#00FF00"],
    "PURPLE MUSHROOM": [false, "#FF00FF"],
    "BLACK MUSHROOM": [false, "#000000"],
    "WHITE MUSHROOM": [false, "#FFFFFF"],
    "UPSTAIRS": ["#FFFF00", "#000000"],
    "DOWNSTAIRS": ["#FFFF00", "#000000"],
    "DOORS": ["#C19A6B", "#664C28"],
    "GRASS1": ["#BFFFB3", "#004D0D"],
    "GRASS2": ["#BFFFB3", "#113300"],
    "GRASS3": ["#BFFFB3", "#004D0D"],
    "ROCK1": ["#A9A9A9", "#696969"],
    "ROCK2": ["#BEBEBE", "#CFCFC4"],
    "ROCK3": ["#D3D3D3", "#C5C1AA"],
    "FIRE1": [false, "#FF0000"],
    "FIRE2": [false, "#E60000"],
    "FIRE3": [false, "#800000"],
    "STAR1": [false, "#990000"],
    "STAR2": [false, "#990000"],
    "THROWING STAR": [false, "#990000"],
    "CARPET1": ["#84DE02", "#004D00"],
    "CARPET2": ["#E32636", "#800015"],
    "ASH": [false, "#BEB2B5"],
    "PLAYER": [false, "NEG"],
    "CHEST": [false, "#654321"],
    "KEY": [false, "#848482"],
    "RABBIT": [false, "#9F9289"],
    "GOOSEBALL": [false, "#994D00"],
    "BAT": [false, "#52414B"],
    "SNAKE": [false, "#375C01"],
    "DWARF": [false, "#FF7733"],
    "TABLE": ["#B33B00", "#452E16"],
    "GOOSEBALL": [false, "#994D00"],
    "VILLAGER": [false, "#4D004D"],
    "TELEPORTER": [false, "#0000FF"],
    "FIRE WAND": [false, "#B22222"],
    "FOOD": [false, "#8DB600"],
    "FIREBALL": [false, "#FF4444"],
    "HARDWOOD": ["#DEB887", "#967117"],
    "END": [FLOOR, "#000000"], 
    "STEPS": [FLOOR, "#000000"],
    "WELCOME": [FLOOR, "#000000"],
    "TUTORIAL1": [FLOOR, "#000000"],
    "TUTORIAL2": [FLOOR, "#000000"],
    "TUTORIAL3": [FLOOR, "#000000"],
    "TUTORIAL4": [FLOOR, "#000000"],
    "TUTORIAL5": [FLOOR, "#000000"],
    "TUTORIAL6": [FLOOR, "#000000"],
    "TUTORIAL7": [FLOOR, "#000000"],
    "TUTORIAL8": [FLOOR, "#000000"],
    "TUTORIAL9": [FLOOR, "#000000"],
    "TUTORIAL10": [FLOOR, "#000000"],
    "TUTORIAL11": [FLOOR, "#000000"],
    "TUTORIAL12": [FLOOR, "#000000"],
}

const BRAINS = {
    "GOOSEBALL": [],
    "RABBIT": [],
    "VILLAGER": [],
    "BAT": [],
    "SNAKE": [],
    "DWARF": [],
    "FIREBALL": [],
    "CHEST": [],
    "STAR": [],
    "SPORE": [],
    "PLAYER": {
	DIR: "0,0",
	pos: pack(27, 8),
	firewanduse: 10,
	throwstaruse: 8,
    },
}

const ITEMS = {
    "TELEPORTER": {
	btn: "Teleport",
	use: () => {
	    let player_position;
	    FLOORS[DEPTH].PLAYER.forEach((pos) => {
		player_position = pos;
	    });
	    const dir = unpack(BRAINS.PLAYER.DIR);
	    if (DEPTH+dir[1] < 0 || DEPTH+dir[1] >= FLOORS.length) {
		STATS.HP = -10;
	    } else {
		FLOORS[DEPTH].PLAYER.delete(player_position);
		DEPTH += dir[1]
		if (tangAt(FLOORS[DEPTH], player_position)) {
		    STATS.HP = -10;
		} else { 
		    FLOORS[DEPTH].PLAYER.add(player_position);
		}
	    }
	},
    },
    "FIRE WAND": {
	btn: "Fire wand",
	use: () => {
	    const dir = unpack(BRAINS.PLAYER.DIR);
	    const pos = unpack(BRAINS.PLAYER.pos);
	    
	    BRAINS.FIREBALL.push({
		name: "FIREBALL",
		pos: pack(pos[0]+dir[0], pos[1]+dir[1]),
		direction: dir,
		floor: DEPTH,
		update: fireball,
	    });
	    FLOORS[DEPTH].FIREBALL.add(pack(pos[0]+dir[0], pos[1]+dir[1]));

	    BRAINS.PLAYER.firewanduse -= 1;

	    if (BRAINS.PLAYER.firewanduse <= 0) {
		remove(STATS.INV, "FIRE WAND");
		BRAINS.PLAYER.firewanduse = 10;
	    }
	},
    },
    "KEY": {},
    "FOOD": {
	btn: "Food",
	use: () => {
	    STATS.HP += 15 + Math.floor(Math.random()*15);
	    remove(STATS.INV, "FOOD");
	}
    },
    "THROWING STAR": {
	btn: "Throw Star",
	use: () => {
	    const dir = unpack(BRAINS.PLAYER.DIR);
	    const pos = unpack(BRAINS.PLAYER.pos);

	    BRAINS.PLAYER.throwstaruse -= 1;
	    BRAINS.STAR.push({
		name: "STAR1",
		pos: pack(pos[0]+dir[0], pos[1]+dir[1]),
		direction: dir,
		floor: DEPTH,
		update: throwstar,
		DMG: 10,
		counter: 0,
	    });
	    FLOORS[DEPTH].STAR1.add(pack(pos[0]+dir[0], pos[1]+dir[1]));
	    remove(STATS.INV, "THROWING STAR");
	}
    },
    "RED MUSHROOM": {
	btn: "Eat Red Mushroom",
	use: () => {
	    remove(STATS.INV, "RED MUSHROOM");
	}
    },
    "BLUE MUSHROOM": {
	btn: "Eat Blue Mushroom",
	use: () => {
	    STATS.STR += Math.floor(Math.random() * 3);
	    remove(STATS.INV, "BLUE MUSHROOM");
	}
    },
    "GREEN MUSHROOM": {
	btn: "Eat Green Mushroom",
	use: () => {
	    remove(STATS.INV, "GREEN MUSHROOM");
	}
    },
    "PURPLE MUSHROOM": {
	btn: "Eat Purple Mushroom",
	use: () => {
	    remove(STATS.INV, "PURPLE MUSHROOM");
	}
    },
    "BLACK MUSHROOM": {
	btn: "Eat Black Mushroom",
	use: () => {
	    remove(STATS.INV, "BLACK MUSHROOM");
	}
    },
    "WHITE MUSHROOM": {
	btn: "Eat White Mushroom",
	use: () => {
	    remove(STATS.INV, "WHITE MUSHROOM");
	}
    },

}

// sets of positions
const FLOORS = getFloors()

function pack(x, y) {
    return `${x},${y}`;
}

function unpack(pos) {
    var unpacked = pos.split(",");
    return [Number(unpacked[0]), Number(unpacked[1])]
}

// fresh off the plate of stack overflow
function invert(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function drawBoard(floor) {
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, 0, PW*W, PW*H);

    for (let y = 0; y < H; y++) {
	for (let x = 0; x < W; x++) {
	    const packed = pack(x, y);

	    let lower_color = false;
	    let idx = 0;
	    while (idx < ACTORS.length) {
	    	const key = ACTORS[idx];
		
		if (floor[key].has(pack(x, y)) && COLORS[key][0]) {
		    lower_color = COLORS[key][0];
		    ctx.fillStyle = lower_color;
		    ctx.fillRect(x*PW, y*PW, PW, PW);
		    break;
		}
		idx++;
	    }
	    let vdx = ACTORS.length-1;
	    while (vdx >=0) {
		const key = ACTORS[vdx];
		
		if (floor[key].has(pack(x, y))) {
		    const col = COLORS[key][1];
		    if (col === "NEG") {
			ctx.fillStyle = lower_color ? invert(lower_color) : "#000000";
		    } else {
			ctx.fillStyle = col;
		    }
		    ctx.fillText(SPRITES[key], x*PW, ((y+1)*PW) - (PW/4));
		    break;
		}
		vdx--;
	    }
	}
    }
}

function move(x, y) {
    if (STATS.HP <= 0) {
	actorTurn();
	boardTurn();
	drawBoard(FLOORS[DEPTH]);
	updateStats();
	return;
    }
    const player_position = BRAINS.PLAYER.pos;
    BRAINS.PLAYER.DIR = pack(x, y);

    const unpacked = unpack(player_position);
    const nx = unpacked[0]+x; const ny = unpacked[1]+y;
    if (nx < 0 || W <= nx || ny < 0 || H <= ny) {
	actorTurn();
	boardTurn();
	drawBoard(FLOORS[DEPTH]);
	updateStats();
	return;
    }
    const packed = pack(nx, ny);
    if (tangAt(FLOORS[DEPTH], packed) && !CONDITIONS.has("intangible")) {
	actorTurn();
	boardTurn();
	drawBoard(FLOORS[DEPTH]);
	updateStats();
	return;
    } else {
	const brain = anybodyAt(DEPTH, packed, ["SPORE"]);
	if (brain && brain != BRAINS.PLAYER) {
	    if (brain.HP) {
		brain.HP -= STATS.STR;
	    }
	    if (brain.name == "CHEST") {
		let locked = brain.locked;
		if (brain.locked) {
		    if (STATS.INV.includes("KEY")) {
			remove(STATS.INV, "KEY");
			locked = false;
		    }
		}
		if (!locked) {
		    brain.HP = -5;
		    FLOORS[brain.floor][brain.item].add(brain.pos)
		}
	    }
	    actorTurn();
	    boardTurn();
	    drawBoard(FLOORS[DEPTH]);
	    updateStats();
	    return;
	}
    }

    FLOORS[DEPTH]["PLAYER"].delete(player_position);

    if (FLOORS[DEPTH].UPSTAIRS.has(packed)) {
	DEPTH += 1;
    } else if (FLOORS[DEPTH].DOWNSTAIRS.has(packed)) {
	DEPTH -= 1;
    }
    FLOORS[DEPTH]["PLAYER"].add(pack(unpacked[0]+x, unpacked[1]+y));
    BRAINS.PLAYER.pos = pack(unpacked[0]+x, unpacked[1]+y);

    const item = itemAt(FLOORS[DEPTH], BRAINS.PLAYER.pos)
    if (item) {
	FLOORS[DEPTH][item].delete(BRAINS.PLAYER.pos);
	STATS.INV.push(item);
    }
    if (DEPTH != FLOORS.length-1) {
	STEPS += 1;
	SPRITES.STEPS = `You took ${STEPS} steps`;
    }
    actorTurn();
    boardTurn();
    drawBoard(FLOORS[DEPTH]);
    updateStats();
}

function useItem(item) {
    if (STATS.HP <= 0) {
	return;
    }

    ITEMS[item].use();
    actorTurn();
    boardTurn();
    drawBoard(FLOORS[DEPTH]);
    updateStats();
}

function getEmptyFloor() {
    const floor = {};
    for (let idx = 0; idx < ACTORS.length; idx++) {
	floor[ACTORS[idx]] = new Set();
    }
    for (let X = 0; X < W; X++) {
	floor["STONE"].add(pack(X, 0));
	floor["STONE"].add(pack(X, H-1));
    }
    for (let Y = 0; Y < H; Y++) {
	floor["STONE"].add(pack(0, Y));
	floor["STONE"].add(pack(W-1, Y));
    }

    return floor;
}

function getStartingFloor() {
    const start = getEmptyFloor();

    start["WELCOME"].add(pack(3, 3));
    start["TUTORIAL1"].add(pack(3, 16));

    start["TUTORIAL2"].add(pack(3, 6));

    start["TUTORIAL3"].add(pack(3, 7));
    start["UPSTAIRS"].add(pack(9, 7));

    start["TUTORIAL10"].add(pack(3, 8));
    start["WATER"].add(pack(9, 8));

    start["TUTORIAL5"].add(pack(12, 6));
    start["STONE"].add(pack(18, 6));
    
    start["TUTORIAL6"].add(pack(12, 7));
    start["WALLS"].add(pack(18, 7));
    
    start["TUTORIAL7"].add(pack(12, 8));
    start["DOORS"].add(pack(18, 8));

    start["TUTORIAL8"].add(pack(21, 6));
    start["HARDWOOD"].add(pack(27, 6));

    start["TUTORIAL9"].add(pack(21, 7));
    start["RABBIT"].add(pack(27, 7));

    BRAINS["RABBIT"].push({
	name: "RABBIT",
	floor: 0,
	HP: 1,
	pos: pack(27, 7),
	update: wander,
	bleeds: true,
    })
    
    start["TUTORIAL4"].add(pack(21, 8));
    start["PLAYER"].add(pack(27, 8));

    start["TUTORIAL11"].add(pack(30, 6));
    start["CHEST"].add(pack(35, 6));

    BRAINS["CHEST"].push(makeChest(0, pack(35, 6), true));
    
    start["TUTORIAL12"].add(pack(30, 7));
    start["KEY"].add(pack(35, 7));

    return start;
}

function getFinale() {
    const finale = getEmptyFloor()

    finale["END"].add(pack(3, 3))
    finale["STEPS"].add(pack(3, 5))
    return finale;
}

function applyStairs(floor, last) {
    floor["DOWNSTAIRS"].add(last);
    const unpacked = unpack(last);
    let x = 1 + Math.floor(Math.random() * (W-2));
    let y = 1 + Math.floor(Math.random() * (H-2));
    while (TANGIBLE.includes(checkAt(floor, pack(x, y))) || Math.abs(x-unpacked[0]) + Math.abs(y-unpacked[1]) < (W+H)/2) {
	x = 1 + Math.floor(Math.random() * (W-2));
	y = 1 + Math.floor(Math.random() * (H-2));
    }
    floor["UPSTAIRS"].add(pack(x, y));
    return pack(x, y);
}

function getVillage(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();
	for (let _ = 0; _ < 3 + Math.floor(Math.random() * 10); _++) {
	    addRoom(floor, last);
	}

	last = applyStairs(floor, last);

	for (let y = 0; y < H; y++) {
	    for (let x = 0; x < W; x++) {
		const slot = checkAt(floor, pack(x, y)); 
		if (!slot) {
		    const roll = Math.floor(Math.random()*100);
		    if (roll < 5 && canFit(floor, x, y, 12, 12, ACTORS)) {
			addPond(floor, "GRASS", "WATER", x, y, 12, 12);
		    } else if (roll <= 10 && canFit(floor, x, y, 9, 5, ACTORS)) {
			addPond(floor, "GRASS", "WATER", x, y, 9, 5);
		    } else {
			const grass = `GRASS${1+Math.floor(Math.random()*3)}`;
			floor[grass].add(pack(x, y));

			if (Math.floor(Math.random()*100) == 0) {
			    BRAINS["GOOSEBALL"].push({
				floor: idx + i,
				name: "GOOSEBALL",
				pos: pack(x, y),
				update: wanderCharge,
				state: "wander",
				HP: 3,
				DMG: 12,
				bleeds: true,
			    }); 
			    floor["GOOSEBALL"].add(pack(x, y));
			}
		    }
		} else if (slot == "HARDWOOD") {
		    if (Math.floor(Math.random()*200) == 0) {
			BRAINS["VILLAGER"].push({
			    floor: idx + i,
			    name: "VILLAGER",
			    pos: pack(x, y),
			    update: waitEnrage,
			    state: "wait",
			    HP: 10,
			    maxHP: 10,
			    DMG: 20,
			    bleeds: true,
			    drops: Math.floor(Math.random() * 2) == 1 ? "KEY" : false,
			});
			floor["VILLAGER"].add(pack(x, y));
		    } else if (Math.floor(Math.random()*120) == 0) {
			BRAINS["CHEST"].push(makeChest(idx + i, pack(x, y)));
			floor["CHEST"].add(pack(x, y));
		    }
		}
	    }
	}
	
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getCaves(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	let floor = getEmptyFloor();
	const prev = last;
	last = applyStairs(floor, last);

	let placed = 0
	while (placed < 30) {
	    let copy = copyFloor(floor);
	    while (checkSolvable(copy, prev, last)) {
		floor = copyFloor(copy);
		addGash(copy);
		placed += 1;
	    }
	    placed -= 1
	    
	}

	for (let y = 0; y < H; y++) {
	    for (let x = 0; x < W; x++) {
		const slot = checkAt(floor, pack(x, y));
		if (!slot) {
		    const rock = `ROCK${1+Math.floor(Math.random()*3)}`;
		    floor[rock].add(pack(x, y));

		    if (Math.floor(Math.random() * 20) == 0) {
			floor["BAT"].add(pack(x, y));
			BRAINS["BAT"].push({
			    floor: idx + i,
			    name: "BAT",
			    pos: pack(x, y),
			    update: sleepNswarm,
			    state: "sleep",
			    HP: 3,
			    DMG: 1,
			    bleeds: true,
			});
		    } else if (Math.floor(Math.random() * 80) == 0) {
			floor["SNAKE"].add(pack(x, y));
			const mood = Math.floor(Math.random()*10) > 4 ? "mad":"chillin";
			BRAINS["SNAKE"].push({
			    floor: idx + i,
			    name: "SNAKE",
			    pos: pack(x, y),
			    update: mood == "mad" ? wanderCharge:waitEnrage,
			    state: mood == "mad" ? "wander":"wait",
			    HP: 10,
			    maxHP: 10,
			    DMG: 4,
			    bleeds: true,
			});
		    }
		} else if (slot == "HARDWOOD") {
		    const roll = Math.floor(Math.random()*400);
		    if (roll <= 10 && canFit(floor, x, y, 5, 4)) {
			addTable(floor, idx + i, x, y);
		    } else if (roll <= 11 ) {
			floor["DWARF"].add(pack(x, y));
			BRAINS.DWARF.push({
			    floor: idx+i,
			    name: "DWARF",
			    pos: pack(x, y),
			    update: wanderEnrage,
			    state: "wander",
			    HP: 25,
			    maxHP: 25,
			    DMG: 5,
			    bleeds: true,
			    drops: ["FOOD", "FOOD", "KEY", "KEY"][Math.floor(Math.random() * 4)],
			});
		    } else if (roll <= 20) {
			if (canFit(floor, x-1, y-1, 3, 3)) {
			    BRAINS["CHEST"].push(makeChest(idx + i, pack(x, y)));
			    floor["CHEST"].add(pack(x, y));
			}
		    }
		}
	    }
	}

	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getVolcano(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getCastle(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getDungeon(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getHotel(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getLibrary(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getWizardsKeep(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getDragonsLair(idx, depth, last) {
    const floors = [];
    let i = 0;
    while (i < depth) {
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
	floors.push(floor);
	i += 1;	
    }
    return { floors, last };
}

function getFloors() {
    const floors = [];
    let i = 0;
    floors.push(getStartingFloor());
    let last = pack(9, 7);

    const cavesroll = 4+Math.floor(Math.random()*4);

    const village = getVillage(floors.length, 4, last);
    last = village.last;
    for (let idx = 0; idx < village.floors.length; idx++) {
	floors.push(village.floors[idx]);
    }

    const caves = getCaves(floors.length, cavesroll, last);
    last = caves.last;
    for (let idx = 0; idx < caves.floors.length; idx++) {
	floors.push(caves.floors[idx]);
    }
    /*
    const volcano = getVolcano(floors.length, 2+Math.floor(Math.random()*2), last);
    last = volcano.last;
    for (let idx = 0; idx < volcano.floors.length; idx++) {
	floors.push(volcano.floors[idx]);
    }
    
    const castle = getCastle(floors.length, 3+Math.floor(Math.random()*4), last);
    last = castle.last;
    for (let idx = 0; idx < castle.floors.length; idx++) {
	floors.push(castle.floors[idx]);
    }
    
    const dungeon = getDungeon(floors.length, 3, last);
    last = dungeon.last;
    for (let idx = 0; idx < dungeon.floors.length; idx++) {
	floors.push(dungeon.floors[idx]);
    }

    const hotel = getHotel(floors.length, 2, last);
    last = hotel.last;
    for (let idx = 0; idx < hotel.floors.length; idx++) {
	floors.push(hotel.floors[idx]);
    }
    
    const library = getLibrary(floors.length, 3+Math.floor(Math.random()*3), last);
    last = library.last;
    for (let idx = 0; idx < library.floors.length; idx++) {
	floors.push(library.floors[idx]);
    }
    
    const wizardsKeep = getWizardsKeep(floors.length, 1+Math.floor(Math.random()*2), last);
    last = wizardsKeep.last;
    for (let idx = 0; idx < wizardsKeep.floors.length; idx++) {
	floors.push(wizardsKeep.floors[idx]);
    }
    
    const dragonsLair = getDragonsLair(floors.length, 1, last);
    last = dragonsLair.last;
    for (let idx = 0; idx < dragonsLair.floors.length; idx++) {
	floors.push(dragonsLair.floors[idx]);
    }
    */
    
    floors.push(getFinale());
    return floors;
}
function copyFloor(floor) {
    const newfloor = {};
    for (let key in floor) {
	newfloor[key] = new Set(floor[key])
    }
    return newfloor;
}

function tangAt(floor, pos) {
    for (let idx = 0; idx < TANGIBLE.length; idx++) {
	const key = TANGIBLE[idx];
	if (floor[key].has(pos)) {
	    return key;
	}
    }
    return false;
}

function itemAt(floor, pos) {
    for (let item in ITEMS) {
	if (floor[item].has(pos)) {
	    return item;
	}
    }
    return false;
}

function anybodyAt(depth, pos, ignore=[]) {
    for (let key in BRAINS) {
	if (ignore.includes(key)) {
	    continue;
	}
	if (key == "PLAYER") {
	    if (BRAINS.PLAYER.pos == pos & DEPTH == depth) {
		return BRAINS[key];
	    }
	    continue
	}
	for (let idx = 0; idx < BRAINS[key].length; idx++) {
	    const brain = BRAINS[key][idx];
	    if (brain.floor == depth && brain.pos == pos) {
		return brain;
	    } 
	}
    }

    return false;
}

function checkAt(floor, pos) {
    const actors = Object.keys(floor);
    for (let idx = 0; idx < actors.length; idx++) {
	const key = actors[idx];
	if (floor[key].has(pos)) {
	    return key;
	}
    }
    return false;
}

function checkAtAny(floors, pos) {
    for (let idx = 0; idx < floors.length; idx++) {
	const slot = checkAt(floors[idx], pos);
	if (slot) { return slot }
    }
    return false;
}

function updateStats() {
    for (let stat in STATS) {
	if (stat == "HP" && STATS[stat] <= 0) {
	    document.getElementById(stat).innerHTML = "You are dead.";
	    continue
	}
	document.getElementById(stat).innerHTML = `${STATS[stat]}`;
    }
    let buttons = "";
    for (let idx = 0; idx < STATS["INV"].length; idx++) {
	const item = STATS["INV"][idx];
	if (ITEMS[item].use) {
	    buttons = `${buttons}<br><button onclick='useItem("${item}")' class='itembutton'>${ITEMS[item].btn}</button>`;
	}
    }
    document.getElementById("INVBTNS").innerHTML = buttons;
}

function canFit(floor, left, top, w, h, blockList = [...TANGIBLE, "UPSTAIRS", "DOWNSTAIRS"]) {
    for (let x = left; x < left+w; x++) {
	for (let y = top; y < top+h; y++) {
	    const thing = checkAt(floor, pack(x, y));
	    if (thing && blockList.includes(thing)) {
		return false;
	    }
	}
    }
    return true;
}

function getLine(x1, y1, x2, y2) {
    const line = [];
    const issteep = Math.abs(y2-y1) > Math.abs(x2-x1);
    let swap;
    if (issteep) {
	swap = x1;
	x1 = y1; y1 = swap;
	swap = x2;
	x2 = y2; y2 = swap;
    }
    let rev = true;
    if (x1 > x2) {
	swap = x1;
	x1 = x2; x2 = swap;
	swap = y1;
	y1 = y2; y2 = swap;
	rev = false;
    }
    const deltax = x2 - x1;
    const deltay = Math.abs(y2-y1);
    let correction = Math.floor(deltax / 2);
    let y = y1;
    const ystep = y1 < y2 ? 1 : -1;

    for (let x = x1; x <= x2; x++) {
	line.push(issteep ? pack(y, x):pack(x, y));
	correction -= deltay;
	if (correction < 0) {
	    y += ystep;
	    correction += deltax;
	}
    }
    return line;
}

function getSpike(peak, x, y, w, h) {
    const spike = [];
    const line1 = getLine(x, y, x+peak, y+h);
    const line2 = getLine(x+peak, y+h, x+w, y);
    while (line1.length > line2.length) {
	line2.push(line2[line2.length-1]);
    }
    for (let idx = 0; idx < line1.length; idx++) {
	const unpack1 = unpack(line1[idx]);
	const unpack2 = unpack(line2[idx]);
	const direction = unpack1[0] < unpack2[0] ? 1 : -1;
	for (let dist = 0; dist <= Math.abs(unpack1[0] - unpack2[0]); dist++) {
	    spike.push(pack(unpack1[0] +(dist * direction), unpack1[1]));
	}
    }
    return spike;
}

function getBox(x, y, w, h) {
    const box = [];
    for (let idx = 0; idx < w; idx++) {
	box.push(pack(x + idx, y))
    }
    for (let idx = 1; idx < h; idx++) {
    	box.push(pack(x + w - 1, y + idx))
    }
    for (let idx = w-2; idx > 0; idx--) {
    	box.push(pack(x + idx, y + h - 1))
    }
    for (let idx = h-1; idx > 0; idx--) {
	box.push(pack(x, y + idx))
    }
    return box;
}

function tunnelMySpike(spike) {
    const micro = { "WALLS": new Set(), "HARDWOOD": new Set(), "DOORS": new Set()}
    const start = unpack(spike[Math.floor(spike.length / 2)]);

    const heads = [pack(start[0]-2, start[1]), pack(start[0]+2, start[1])]
    
    for (let x = start[0]-2; x < start[0]+3;x++) {
	for (let y = start[1]-2; y < start[1]+3;y++) {
	    if (pack(x, y) in heads) {
		micro["DOORS"].add(pack(x, y));
	    } else if (x == start[0]-2 || x == start[0]+2 || y == start[1]-2 || y == start[1]+2) {
		micro["WALLS"].add(pack(x, y));
	    } else {
		micro["HARDWOOD"].add(pack(x, y));
	    }
	}
    }

    while (heads.length) {
	let head = heads.pop();
	if (spike.includes(head)) {
	    const dirs = adjacent(head);
	    heads.push(dirs[Math.floor(Math.random()*4)]);

	    if (micro["WALLS"].has(head)) {
		micro["WALLS"].delete(head);
	    }
	    micro["HARDWOOD"].add(head);
	    dirs.forEach((pos) => {
		if (spike.includes(pos) && !micro["HARDWOOD"].has(pos)) {
		    micro["WALLS"].add(pos);
		}
	    });
	}	
    }

    return micro;
}

function addPond(floor, outside, fill, left, top, w, h) {
    for (let x = left; x < left+w; x++) {
	for (let y = top; y < top+h; y++) {
	    if (
		x == left || x == left+w-1 || y == top|| y == top+h-1
		    || (x == left+1 && y == top+1)
		    || (x == left+1 && y == top+h-2)
		    || (x == left+w-2 && y == top+1)
		    || (x == left+w-2 && y == top+h-2)
	    ) {
		const name = `${outside}${1+Math.floor(Math.random()*3)}`;
		floor[name].add(pack(x, y));
	    } else {
		floor[fill].add(pack(x, y));
	    }
	}
    }
}

function addTable(floor, depth, left, top) {
    for (let x = left; x < left+5; x++) {
	for (let y = top; y < top+4; y++) {
	    if (x == left || x == left+4 || y == top || y == top+3) {
		const carpettype = y > top+1 ? "CARPET1" : "CARPET2";
		floor[carpettype].add(pack(x, y));
		if (Math.floor(Math.random() * 4)==1) {
		    floor["DWARF"].add(pack(x, y));
		    BRAINS.DWARF.push({
			floor: depth,
			name: "DWARF",
			pos: pack(x, y),
			update: waitEnrage,
			state: "wait",
			HP: 25,
			maxHP: 25,
			DMG: 5,
			bleeds: true,
			drops: ["FOOD", "FOOD", "FOOD", "KEY"][Math.floor(Math.random() * 4)],
		    });
		}
	    } else {
		floor["TABLE"].add(pack(x, y));
	    }
	}
    }

    return;
}

function addGash(floor, last) {
    const flip =  Math.floor(Math.random()*2) == 1
    const width = 4 + Math.floor(Math.random() * 15);
    let height = 3 + Math.floor(Math.random() * 20);
    if (flip) { height = 0 - height } 
    const x = -5 +  Math.floor(Math.random() * (W - width + 10));
    const y = flip ? H-2: 1;
    const peak = Math.floor(Math.random() * width);

    const spike = getSpike(peak, x, y, width, height);

    const tunnels = tunnelMySpike(spike); 
    
    spike.forEach((pos) => {
	const unpacked = unpack(pos);
	if (unpacked[0] == 0 || unpacked[0] == W-1 || unpacked[1] == 0 || unpacked[1] == H-1) {
	    return
	}

	if (tunnels.HARDWOOD.has(pos) || floor.HARDWOOD.has(pos)) {
	    floor.HARDWOOD.add(pos);
	    if (floor.STONE.has(pos)) {
		floor.STONE.delete(pos);
	    }
	    if (floor.WALLS.has(pos)) {
		floor.WALLS.delete(pos);
	    }
	} else if (tunnels.DOORS.has(pos)) {
	    floor.DOORS.add(pos);	    
	} else if (tunnels.WALLS.has(pos)) {
	    if (floor.STONE.has(pos)) {
		floor.STONE.delete(pos);
	    }
	    floor.WALLS.add(pos);	    
	} else if (!checkAt(floor, pos)) {
	    floor.STONE.add(pos);
	}
    });
}

function addRoom (floor, last) {
    const width = 5 + Math.floor(Math.random() * 12);
    const height = 5 + Math.floor(Math.random() * 12);
    const top =  2 + Math.floor(Math.random() * (H - height - 4));
    const left = 2 + Math.floor(Math.random() * (W - width - 4));
    
    const box = getBox(left, top, width, height);
    let outside = true;

    let idx = 0;
    let doors = [
	Math.floor(Math.random() * box.length),
	Math.floor(Math.random() * box.length),
	Math.floor(Math.random() * box.length),
    ];
    box.forEach((wall) => {
	if (floor.WALLS.has(wall)) {
	    outside = !outside;
	}
	if (outside) {
	    if (wall != last) {
		if (doors.includes(idx)) {
		    floor.DOORS.add(wall);
		} else {
		    floor.WALLS.add(wall);
		}
	    }
	}
	idx += 1;
    });

    for (let x = left+1; x < width+left-1; x++) {
	for (let y = top+1; y < height+top-1; y++) {
	    const packed = pack(x, y);
	    if (floor.WALLS.has(packed)) {
		floor.WALLS.delete(packed)
	    }
	    if (x != left && x != left+width-1 && y != top && y != top + height) {
		floor.HARDWOOD.add(packed);
	    }
	}
    }
    drawBoard(floor);
}

function sporespread(floor, brain) {
    for (let idx = 0; idx < BRAINS.SPORE.length; idx++) {
	const obrain = BRAINS.SPORE[idx];
	if (obrain.gene == brain.gene || obrain.floor != brain.floor) {
	    continue;
	}
	if (obrain.pos == brain.pos) {
	    remove(BRAINS.SPORE, obrain);
	    floor[mushCombine(brain.gene, obrain.gene)].add(brain.pos);
	    return false;
	}
    }
    
    if (anybodyAt(brain.floor, brain.pos, ["SPORE"])) {
	const nbr = adjacent(brain.pos)[Math.floor(Math.random()*4)];
	brain.pos = nbr;
    }
    return true;
}

function actorTurn() {
    for (let key in BRAINS) {
	const killList = [];
	for (let idx = 0; idx < BRAINS[key].length; idx++) {
	    const brain = BRAINS[key][idx];

	    if (!brain.update(FLOORS[brain.floor], brain) || (brain.hasOwnProperty("HP") && brain.HP <= 0)) {
		killList.push(brain);
		if (brain.bleeds) {
		    FLOORS[brain.floor].BLOOD.add(brain.pos);
		}
		if (brain.drops) {
		    FLOORS[brain.floor][brain.drops].add(brain.pos);
		}
	    }
	}
	for (let idx = 0; idx < killList.length; idx++) {
	    const brain = killList[idx];
	    remove(BRAINS[key], brain);
	    FLOORS[brain.floor][key].delete(brain.pos);
	}
    }
    if (STATS.HP <= 0) {
	const player_position = BRAINS.PLAYER.pos;

	if (player_position) {
	    FLOORS[DEPTH].PLAYER.delete(player_position)
	    FLOORS[DEPTH].BLOOD.add(player_position);
	}
    }
}

function boardTurn() {
    for (let idx = 0; idx < FLOORS.length; idx++) {
	const floor = FLOORS[idx];
	floor["FIRE3"].forEach((pos) => {
	    const brain = anybodyAt(idx, pos);
	    if (brain == BRAINS.PLAYER) {
		STATS.HP -= 2;
	    } else if (brain && brain.HP) {
		brain.HP -= 2;
	    }	    
	    floor["FIRE3"].delete(pos);
	});
	floor["FIRE2"].forEach((pos) => {
	    const brain = anybodyAt(idx, pos);
	    if (brain == BRAINS.PLAYER) {
		STATS.HP -= 2;
	    } else if (brain && brain.HP) {
		brain.HP -= 2;
	    }
	    floor["FIRE2"].delete(pos);
	    floor["FIRE3"].add(pos);
	});
	floor["FIRE1"].forEach((pos) => {
	    const brain = anybodyAt(idx, pos);
	    if (brain == BRAINS.PLAYER) {
		STATS.HP -= 2;
	    } else if (brain && brain.HP) {
		brain.HP -= 2;
	    }
	    floor["FIRE1"].delete(pos);
	    floor["FIRE2"].add(pos);
	});
	for (let idx = 0; idx < FLAMMABLE.length; idx++) {
	    const name = FLAMMABLE[idx];
	    floor[name].forEach((pos) => {
		if (floor["FIRE3"].has(pos)) {
		    floor[name].delete(pos);
		    floor["ASH"].add(pos);
		    const dirs = adjacent(pos);
		    for (let idx = 0; idx < 5; idx++) {
			if (!floor["FIRE2"].has(dirs[idx]) && !floor["FIRE3"].has(dirs[idx])) {
			floor["FIRE1"].add(dirs[idx]);
			}
		    }
		} else if (floor["FIREBALL"].has(pos)) {
		    floor["FIRE1"].add(pos);
		}
	    });
	}

	floor["BLOOD"].forEach((pos) => {
	    if (!anybodyAt(idx, pos) && Math.floor(Math.random() * 50) == 0) {
		BRAINS.SPORE.push({
		    name: "SPORE",
		    pos,
		    floor: idx,
		    gene: ["A", "B", "C", "D"][Math.floor(Math.random()*4)],
		    update: sporespread,
		});
		if (Math.floor(Math.random() * 10) == 0) {
		    floor.BLOOD.delete(pos);
		}
	    }
	});
    }
}

function mushCombine(a, b) {
    const result = {
	"AB": "RED MUSHROOM",
	"AC": "BLUE MUSHROOM",
	"AD": "GREEN MUSHROOM",
	"BC": "PURPLE MUSHROOM",
	"BD": "BLACK MUSHROOM",
	"CD": "WHITE MUSHROOM",
    }
    
    const order = ["A", "B", "C", "D"];
    const idx1 = order.indexOf(a);
    const idx2 = order.indexOf(b);
    return result[`${order[Math.min(idx1, idx2)]}${order[Math.max(idx1, idx2)]}`];
}

function wander(floor, brain, safe=false) {
    if (Math.floor(Math.random() * 3) == 0) {
	const unpacked = unpack(brain.pos);
	const x = Math.floor(Math.random()*3)-1;
	const y = Math.floor(Math.random()*3)-1;
	if (tangAt(floor, pack(unpacked[0]+x, unpacked[1]+y))) {
	    return true;
	}
	const obrain = anybodyAt(FLOORS.indexOf(floor), pack(unpacked[0]+x, unpacked[1]+y), ["SPORE"]);
	if (obrain && obrain != brain) {
	    if (!safe && obrain == BRAINS.PLAYER) {
		STATS.HP -= brain.DMG;
	    } else if (!safe && obrain.HP && brain.DMG) {
		obrain.HP -= brain.DMG;
	    } 
	    return true;
	}
	floor[brain.name].delete(brain.pos);
	brain.pos = pack(unpacked[0]+x, unpacked[1]+y);
	floor[brain.name].add(brain.pos);
    }
    return true;
}

function throwstar(floor, brain) {
    floor[brain.name].delete(brain.pos);
    brain.name = brain.counter % 2 == 1 ? "STAR1" : "STAR2";
    brain.counter++;
    const result = charge(floor, brain);

    if (result == "hit") {
	floor[brain.name].delete(brain.pos);
	if (BRAINS.PLAYER.throwstaruse > 0) {
	    floor["THROWING STAR"].add(brain.pos);
	} else {
	    BRAINS.PLAYER.throwstaruse = 8;
	}
	return false;
    }

    return result;
}

function fireball(floor, brain) {
    const result = chargeBreak(floor, brain);

    if (!result) {
	const dirs = adjacent(brain.pos);
	for (let idx = 0; idx < 5; idx++) {
	    if (!floor["FIRE2"].has(dirs[idx]) && !floor["FIRE3"].has(dirs[idx])) {
		floor["FIRE1"].add(dirs[idx]);
	    }
	}

    }
    return result;
}

function chargeBreak(floor, brain) {
    return charge(floor, brain) != "hit"
}

function charge(floor, brain) {
    const unpacked = unpack(brain.pos);
    let playerpos = false;
    floor.PLAYER.forEach((pos) => {
	playerpos = pos;
    });
    
    const x = brain.direction[0] + unpacked[0];
    const y = brain.direction[1] + unpacked[1];
    if (tangAt(floor, pack(x, y))) {
	return "hit";
    } else if (pack(x, y) == playerpos && brain.DMG) {
	STATS.HP -= brain.DMG;
	return "hit";
    }
    const otherBrain = anybodyAt(FLOORS.indexOf(floor), pack(x, y), ["SPORE"]);
    if (otherBrain) {
	if (otherBrain.pos == pack(x, y)) {
	    if (otherBrain.HP && brain.DMG) {
		otherBrain.HP -= brain.DMG;
	    }
	    return "hit";
	}
    }
    
    floor[brain.name].delete(brain.pos);
    brain.pos = pack(x, y);
    floor[brain.name].add(brain.pos);
    return true;
}

function wanderCharge(floor, brain) {
    if (brain.state == "wander") {
	wander(floor, brain);
	
	let playerpos = BRAINS.PLAYER.pos;
	const direction = [0, 0];

	if (DEPTH == brain.floor) {
	    const unpackedpl = unpack(playerpos);
	    const unpacked = unpack(brain.pos);
	    if (unpacked[0] == unpackedpl[0]) {
		direction[1] = unpacked[1] > unpackedpl[1] ? -1 : 1; 
	    } else if (unpacked[1] == unpackedpl[1]) {
		direction[0] = unpacked[0] > unpackedpl[0] ? -1 : 1;
	    }
	    if (direction.reduce((a, b) => a + b) != 0) {
		brain.state = "charge";
		brain.direction = direction;
	    }
	}
	return true;
    }
    if (brain.state == "charge") {
	const pos = brain.pos;
	charge(floor, brain);
	if (pos == brain.pos) {
	    brain.state = "wander";
	}
	return true;
    }
}

function sleepNswarm(floor, brain) {
    if (brain.state == "sleep") {
	if (isnear(2, brain.pos, BRAINS.PLAYER.pos) && DEPTH == brain.floor) {
	    brain.state = "swarm";
	}
    } else if (brain.state == "swarm") {
	return swarm(floor, brain);
    }
    return true;
}

function swarm(floor, brain) {
    const unpacked = unpack(brain.pos);
    const playerpos = unpack(BRAINS.PLAYER.pos);
    const twordsx = unpacked[0] > playerpos[0] ? -1: 1;
    const twordsy = unpacked[1] > playerpos[1] ? -1: 1;
    const randx = Math.floor(Math.random()*3)-1;
    const randy = Math.floor(Math.random()*3)-1;

    const flip = Math.floor(Math.random() * 2) == 1;
    const x = flip ? twordsx: randx;
    const y = flip ? twordsy: randy;

    if (tangAt(floor, pack(unpacked[0]+x, unpacked[1]+y))) {
	return true;
    }
    const obrain =anybodyAt(FLOORS.indexOf(floor), pack(unpacked[0]+x, unpacked[1]+y), ["SPORE"]);
    if (obrain && obrain != brain) {
	if (obrain == BRAINS.PLAYER) {
	    STATS.HP -= brain.DMG;
	} else if (obrain.HP && brain.DMG) {
	    obrain.HP -= brain.DMG;
	} 
	return true;
    }
    floor[brain.name].delete(brain.pos);
    brain.pos = pack(unpacked[0]+x, unpacked[1]+y);
    floor[brain.name].add(brain.pos);

    return true;

}

function rage(floor, brain) {
    if (DEPTH != brain.floor) {
	return true;
    }
    brain.steps += 1;
    if (brain.steps > 5) {
	brain.steps = 0;
	brain.target = BRAINS.PLAYER.pos;
    }
    const mypos = unpack(brain.pos);
    const targetpos = unpack(brain.target);
    const xdiff = mypos[0] - targetpos[0];
    const ydiff = mypos[1] - targetpos[1];
    let newpos;

    if (Math.abs(xdiff) > Math.abs(ydiff)) {
	const xmod = xdiff > 0 ? -1:1;
	newpos = pack(mypos[0] + xmod, mypos[1]);
    } else {
	const ymod = ydiff > 0 ? -1:1;
	newpos = pack(mypos[0], mypos[1] + ymod);
    }
    
    const anybody = anybodyAt(brain.floor, newpos, ["SPORE"]);
    if (anybody) {
	if (anybody == BRAINS.PLAYER) {
	    STATS.HP -= brain.DMG;
	} else if (anybody.HP) {
	    anybody.HP -= brain.DMG;
	}
	return true;
    } else if (tangAt(floor, newpos)) {
	brain.steps += 5;
	return true;
    } else {
	floor[brain.name].delete(brain.pos);
	brain.pos = newpos;
	floor[brain.name].add(brain.pos);
	return true;
    }
}

function wanderEnrage(floor, brain) {
    if (brain.state == "wander") {
	if (brain.HP < brain.maxHP) {
	    brain.state = "rage";
	    brain.steps = 0;
	    brain.target = BRAINS.PLAYER.pos;
	}
	return wander(floor, brain, true);
    } else if (brain.state = "rage") {
	return rage(floor, brain);
    }
    return true;

}

function waitEnrage(floor, brain) {
    if (brain.state == "wait") {
	if (brain.HP < brain.maxHP) {
	    brain.state = "rage";
	    brain.steps = 0;
	    brain.target = BRAINS.PLAYER.pos;
	}
    } else if (brain.state = "rage") {
	return rage(floor, brain);
    }
    return true;
}

function adjacent(pos) {
    const unpacked = unpack(pos);
    return [
	pack(unpacked[0]+1, unpacked[1]),
	pack(unpacked[0], unpacked[1]+1),
	pack(unpacked[0]-1, unpacked[1]),
	pack(unpacked[0], unpacked[1]-1),
    ]
}

function isnear(distance, pos1, pos2) {
    const p1 = unpack(pos1);
    const p2 = unpack(pos2);

    return (Math.abs(p1[0] - p2[0]) <= distance) && (Math.abs(p1[1] - p2[1]) <= distance)
}

function inbetween(n, a, b) {
    return n > Math.min(a, b) && n < Math.max(a, b);
}

function checkSolvable(floor, start, end) {
    const checked = new Set();
    const heads = [start];
    if (tangAt(floor, start) || tangAt(floor, end)) {
	return false;
    }

    while (!heads.includes(end)) {
	const head = heads.pop();
	checked.add(head);
	
	const nbrs = adjacent(head);
	nbrs.forEach((pos) => {
	    if (!tangAt(floor, pos) && !checked.has(pos)) {
		heads.push(pos);
	    }
	});

	if (heads.length == 0) {
	    return false;
	}
    }
    return true;
}

function makeChest(floor, pos, forcelock = false, defaultItem = false) {
    let item = defaultItem;
    if (!item) {
	const itemKeys = Object.keys(ITEMS);
	const roll = Math.floor(Math.random() * 100);
	if (roll <= 10) {
	    item = itemKeys[Math.floor(Math.random() * itemKeys.length)];
	} else if (roll <= 30) {
	    item = "FOOD";
	} else if (roll <= 38) {
	    item = "TELEPORTER";
	} else if (roll <= 50) {
	    item = "FIRE WAND";
	} else  if (roll <= 65) {
	    item = "THROWING STAR";
	} else {
	    item = "KEY";
	}
    }

    return {
	name: "CHEST",
	item: item,
	locked: forcelock || Math.floor(Math.random() * 2),
	pos,
	floor,
	update: (room, brain) => {return true}
    };
}

drawBoard(FLOORS[DEPTH]);
updateStats();
document.onkeypress = (e) => {
    if (e.key == 'w') {
	move(0, -1);
    }
    if (e.key == 'a') {
	move(-1, 0);
    }
    if (e.key == 's') {
	move(0, 1);
    }
    if (e.key == 'd') {
	move(1, 0);
    }
}

