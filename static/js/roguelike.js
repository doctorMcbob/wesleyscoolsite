'use strict'
/*
Hey there cool kid code reader!

You're prob wondering what the fuck is going on.
if your just looking for some console commands
to give yourself an over powered run, try:

DEPTH = 10; // look at any floor
STATS.HP = 1000;
STATS.STR = 1000;

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

// keys
const ACTORS = [
    "WALLS", "STONE",
    "BLOOD", "HARDWOOD",
    "WATER",
    "GRASS1",  "GRASS2",  "GRASS3",
    "DOORS", "DOWNSTAIRS", "UPSTAIRS",
    "GOOSEBALL", "RABBIT", "VILLAGER",

    "PLAYER",

    "END", "STEPS",
    "WELCOME", "TUTORIAL1", "TUTORIAL2", "TUTORIAL3", "TUTORIAL4",
    "TUTORIAL5", "TUTORIAL6", "TUTORIAL7", "TUTORIAL8", "TUTORIAL9",
    "TUTORIAL10",
];
const TANGIBLE = ["WALLS", "STONE", "WATER"]
// token representation
const SPRITES = {
    "STONE"     : "#",
    "WATER"     : "~",
    "WALLS"     : "#",
    "VILLAGER"  : "0",
    "BLOOD"     : " ",
    "GRASS1"    : ",",
    "GRASS2"    : ",",
    "GRASS3"    : ".",
    "UPSTAIRS"  : ">",
    "DOWNSTAIRS": "<",
    "DOORS"     : "_",
    "HARDWOOD"  : "+",
    "PLAYER"    : "@",
    "RABBIT"    : "r",
    "GOOSEBALL" : "g",
    
    "END"       : "You have reached the end! ~",
    "STEPS"     : "You took 0 steps",
    "WELCOME"   : "Welcome to my cool roguelike!",
    "TUTORIAL1" : "W A S D to move",
    "TUTORIAL2" : "Down stairs:",
    "TUTORIAL3" : "Up stairs:",
    "TUTORIAL4" : "Player: ",
    "TUTORIAL5" : "Stone:",
    "TUTORIAL6" : "Wall:",
    "TUTORIAL7" : "Door:",
    "TUTORIAL8" : "Floor:",
    "TUTORIAL9" : "Rabbit:",
    "TUTORIAL10": "Water:",
};

// background, foreground
const FLOOR = "#CFCFCF";
const COLORS = {
    "STONE": ["#676767", "#002233"],
    "WALLS": ["#C19A6B", "#4D3300"],
    "WATER": ["#4F42B5", "#0077BE"],
    "BLOOD": ["#AF002A", "#000000"],
    "UPSTAIRS"  : ["#FFFF00", "#000000"],
    "DOWNSTAIRS": ["#FFFF00", "#000000"],
    "DOORS": ["#C19A6B", "#664C28"],
    "GRASS1": ["#BFFFB3", "#004D0D"],
    "GRASS2": ["#BFFFB3", "#113300"],
    "GRASS3": ["#BFFFB3", "#004D0D"],
    "PLAYER": [false, "#CCAA00"],
    "RABBIT": [false, "#9F9289"],
    "GOOSEBALL": [false, "#994D00"],
    "VILLAGER": [false, "#4D004D"],
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
}

const BRAINS = {
    "GOOSEBALL": [],
    "RABBIT": [],
    "VILLAGER": [],
}

// player attributes
const CONDITIONS = new Set();
const STATS = {
    "HP": 100,
    "STR": 1,
    "INV": []
}

// sets of positions
const FLOORS = getFloors()
let DEPTH = 0;
let STEPS = 0;

function pack(x, y) {
    return `${x},${y}`;
}

function unpack(pos) {
    var unpacked = pos.split(",");
    return [Number(unpacked[0]), Number(unpacked[1])]
}

function draw(actor, x, y) {
    if (COLORS[actor][0]) {
	ctx.fillStyle = COLORS[actor][0];
    }
}

function drawBoard (floor) {
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, 0, PW*W, PW*H);

    for (let y = 0; y < H; y++) {
	for (let x = 0; x < W; x++) {
	    const packed = pack(x, y);

	    let idx = 0;
	    while (idx < ACTORS.length) {
	    	const key = ACTORS[idx];

		if (floor[key].has(pack(x, y)) && COLORS[key][0]) {
		    ctx.fillStyle = COLORS[key][0];
		    ctx.fillRect(x*PW, y*PW, PW, PW);
		    break;
		}
		idx++;
	    }
	    let vdx = ACTORS.length-1;
	    while (vdx >=0) {
		const key = ACTORS[vdx];
		
		if (floor[key].has(pack(x, y))) {
		    ctx.fillStyle = COLORS[key][1];
		    ctx.fillText(SPRITES[key], x*PW, ((y+1)*PW) - (PW/4));
		    break;
		}
		vdx--;
	    }
	}
    }
}

function move(x, y) {
    let player_position;
    FLOORS[DEPTH].PLAYER.forEach((pos) => {
	player_position = pos
    });
    if (!player_position) {
	actorTurn();
	boardTurn();
	drawBoard(FLOORS[DEPTH]);
	updateStats();
	return;
    }
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
    if (tangAt(FLOORS[DEPTH], packed) && !CONDITIONS.has("ingangable")) {
	actorTurn();
	boardTurn();
	drawBoard(FLOORS[DEPTH]);
	updateStats();
	return;
    } else {
	const brain = anybodyAt(DEPTH, packed);
	if (brain) {
	    if (brain.HP) {
		brain.HP -= STATS.STR;
	    }
	    actorTurn();
	    boardTurn();
	    drawBoard(FLOORS[DEPTH]);
	    updateStats();
	    return;
	}
    }
    FLOORS[DEPTH]["PLAYER"].delete(player_position)

    if (FLOORS[DEPTH].UPSTAIRS.has(packed)) {
	DEPTH += 1;
    } else if (FLOORS[DEPTH].DOWNSTAIRS.has(packed)) {
	DEPTH -= 1;
    }
    FLOORS[DEPTH]["PLAYER"].add(pack(unpacked[0]+x, unpacked[1]+y))

    if (DEPTH != FLOORS.length-1) {
	STEPS += 1;
	SPRITES.STEPS = `You took ${STEPS} steps`;
    }
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
    })
    
    start["TUTORIAL4"].add(pack(21, 8));
    start["PLAYER"].add(pack(27, 8));

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
	    addRoom(floor);
	}

	last = applyStairs(floor, last);

	for (let y = 0; y < H; y++) {
	    for (let x = 0; x < W; x++) {
		const slot = checkAt(floor, pack(x, y)); 
		if (!slot) {
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
			});
			floor["GOOSEBALL"].add(pack(x, y));
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
			    DMG: 20,
			});
			floor["VILLAGER"].add(pack(x, y));
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
	const floor = getEmptyFloor();

	last = applyStairs(floor, last);
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

    const village = getVillage(floors.length, 4, last);
    last = village.last;
    for (let idx = 0; idx < village.floors.length; idx++) {
	floors.push(village.floors[idx]);
    }

    /*

    const caves = getCaves(floors.length, 4+Math.floor(Math.random()*4), last);
    last = caves.last;
    for (let idx = 0; idx < caves.floors.length; idx++) {
	floors.push(caves.floors[idx]);
    }

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

function tangAt(floor, pos) {
    for (let idx = 0; idx < TANGIBLE.length; idx++) {
	const key = TANGIBLE[idx];
	if (floor[key].has(pos)) {
	    return key;
	}
    }
    return false;
}

function anybodyAt(floor, pos) {
    for (let key in BRAINS) {
	for (let idx = 0; idx < BRAINS[key].length; idx++) {
	    const brain = BRAINS[key][idx];
	    if (brain.floor == floor && brain.pos == pos) {
		return brain;
	    } 
	}
    }

    return false;
}

function checkAt(floor, pos) {
    for (let idx = 0; idx < ACTORS.length; idx++) {
	const key = ACTORS[idx];
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
	    document.getElementById(stat).innerHTML = 'You are dead.';
	    continue
	}
	document.getElementById(stat).innerHTML = `${STATS[stat]}`;
    }
}

function getBox(actor, x, y, w, h) {
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

function addRoom (floor) {
    const width = 5 + Math.floor(Math.random() * 12);
    const height = 5 + Math.floor(Math.random() * 12);
    const top =  2 + Math.floor(Math.random() * (H - height - 4));
    const left = 2 + Math.floor(Math.random() * (W - width - 4));
    
    const box = getBox("WALLS", left, top, width, height);
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
	    if (doors.includes(idx)) {
		floor.DOORS.add(wall);
		
	    } else {
		floor.WALLS.add(wall);
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

function actorTurn() {
    for (let key in BRAINS) {
	const killList = [];
	for (let idx = 0; idx < BRAINS[key].length; idx++) {
	    const brain = BRAINS[key][idx];

	    if (!brain.update(FLOORS[brain.floor], brain) || (brain.hasOwnProperty("HP") && brain.HP <= 0)) {
		killList.push(brain);
		FLOORS[brain.floor].BLOOD.add(brain.pos);
	    }
	}
	for (let idx = 0; idx < killList.length; idx++) {
	    const brain = killList[idx];
	    remove(BRAINS[key], brain);
	    FLOORS[brain.floor][key].delete(brain.pos);
	}
    }
    if (STATS.HP <= 0) {
	let player_position;
	FLOORS[DEPTH].PLAYER.forEach((pos) => {
	    player_position = pos
	});
	if (player_position) {
	    FLOORS[DEPTH].PLAYER.delete(player_position)
	    FLOORS[DEPTH].BLOOD.add(player_position);
	}
    }
}

function boardTurn() {
    
}

function wander(floor, brain) {
    if (Math.floor(Math.random() * 3) == 0) {
	const unpacked = unpack(brain.pos);
	const x = Math.floor(Math.random()*3)-1;
	const y = Math.floor(Math.random()*3)-1;
	if (tangAt(floor, pack(unpacked[0]+x, unpacked[1]+y))
	    || anybodyAt(FLOORS.indexOf(floor), pack(unpacked[0]+x, unpacked[1]+y))) {
	    return true;
	}
	floor[brain.name].delete(brain.pos);
	brain.pos = pack(unpacked[0]+x, unpacked[1]+y);
	floor[brain.name].add(brain.pos);
    }
    return true;
}

function charge(floor, brain) {
    const unpacked = unpack(brain.pos);
    let playerpos = false;
    floor.PLAYER.forEach((pos) => {
	playerpos = pos;
    });
    
    const x = brain.direction[0] + unpacked[0];
    const y = brain.direction[1] + unpacked[1];
    if (tangAt(floor, pack(x, y)) || anybodyAt(FLOORS.indexOf(floor), pack(x, y))) {
	return true;
    } else if (pack(x, y) == playerpos && brain.DMG) {
	STATS.HP -= brain.DMG
	return true;
    }
    
    floor[brain.name].delete(brain.pos);
    brain.pos = pack(x, y);
    floor[brain.name].add(brain.pos);
    
    return true;
}

function wanderCharge(floor, brain) {
    if (brain.state == "wander") {
	wander(floor, brain);
	let playerpos = false;
	const direction = [0, 0];
	floor.PLAYER.forEach((pos) => {
	    playerpos = pos;
	});

	if (playerpos) {
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

function waitEnrage(floor, brain) {
    return true;
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

