// ** ** ** ** ** SET UP ** ** ** ** **
var W, H, PW;
W = 32; H = 32;
PW = 16;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.canvas.width = W*PW; ctx.canvas.height = H*PW; 

// ** ** ** ** ** UTILITY FUNCTIONS ** ** ** ** **
function get(grid, x, y) { return  grid[y][x] }
function sum(list) { return list.reduce( (a, b) => { return a + b } ) }
function position_in(list, x, y) {
    for (i=0; i<list.length; i++) {
	if ( x == list[i].X && y == list[i].Y ) {
	    return true;
	}
    }
    return false;
}

function make_slot() { return { N : 0, E : 0, S : 0, W : 0 } }

function randint(max, min) { return Math.floor(Math.random()*(max - min)+min) }
function choice(list) { return list[randint(0, list.length-1)] }

function remove(item, list) {
    var i = list.indexOf(item);
    list.splice(i, 1);
}

function blank_sheet() {
    var maze = [];
    for (Y=0; Y<H; Y++) {
	maze.push([]);
	for (X=0; X<W; X++) {
	    maze[maze.length - 1].push(make_slot())
	}
    }
    return maze;
}

function resolve_slot(maze, slot, position, heads, marked) {
    n = choice([2, 2, 3, 4]);
    while ( sum([slot.N, slot.E, slot.S, slot.W]) < n ) {
	switch (randint(0, 4)) {
	case 0:
	    slot.N = 1;
	    break;
	case 1:
	    slot.E = 1;
	    break;
	case 2:
	    slot.S = 1;
	    break;
       	case 3:
	    slot.W = 1;
	    break;
	}
    }
    
    if ( slot.N ) {
	var x_ = position.X; var y_ = position.Y - 1;
	if ( y_ >= 0 ) {
	    if (position_in(heads, x_, y_) == false
		&&
		position_in(marked, x_, y_) == false) {
		
		get(maze, x_, y_).S = 1;
		heads.push( { X: x_, Y: y_ } );
	    }  else if ( get(maze, x_, y_).S == 0 ) {
		slot.N = 0;
	    }
	} else {
	    slot.N = 0;
	}
    }
    
    if ( slot.E ) {
	var x_ = position.X + 1; var y_ = position.Y;
	if ( x_ < W ) {
	    if (position_in(heads, x_, y_) == false
		&&
		position_in(marked, x_, y_) == false) {
		
		get(maze, x_, y_).W = 1;
		heads.push( { X: x_, Y: y_ } );
	    }  else if ( get(maze, x_, y_).W == 0 ) {
		slot.E = 0;
	    }
	} else {
	    slot.E = 0;
	}
    }
    
    if ( slot.S ) {
	var x_ = position.X; var y_ = position.Y + 1;
	if ( y_ < H ) {
	    if (position_in(heads, x_, y_) == false
		&&
		position_in(marked, x_, y_) == false) {
		
		get(maze, x_, y_).N = 1;
		heads.push( { X: x_, Y: y_ } );
	    }  else if ( get(maze, x_, y_).N == 0 ) {
		slot.S = 0;
	    }
	} else {
	    slot.S = 0;
	}
    }
    
    if ( slot.W ) {
	var x_ = position.X - 1; var y_ = position.Y;
	if ( x_ >= 0 ) {
	    if (position_in(heads, x_, y_) == false
		&&
		position_in(marked, x_, y_) == false) {
		
		get(maze, x_, y_).E = 1;
		heads.push( { X: x_, Y: y_ } );
	    }  else if ( get(maze, x_, y_).E == 0 ) {
		slot.W = 0;
	    }
	} else {
	    slot.W = 0;
	}
    }
    marked.push(position);
}

// ** ** ** ** ** MAZE ALGORITHMS ** ** ** ** **
function breadth_first () {
    var maze = blank_sheet();
    var ent = { X : randint(0, W-1), Y : randint(0, H-1) };
    var heads = [ ent ];
    var marked = [];

    while ( heads.length != 0 || marked.length < (W * H) ) {
	if ( heads.length == 0 ) {
	    var item = choice(marked);
	    heads.push( item );
	    remove(item, marked);
	}

	position = heads[0];
	heads.shift();
	slot = get(maze, position.X, position.Y);

	resolve_slot(maze, slot, position, heads, marked);
    }

    return { maze: maze, ent: ent };
}

function depth_first () {
    var maze = blank_sheet();
    var ent = { X : randint(0, W-1), Y : randint(0, H-1) };
    var heads = [ ent ];
    var marked = [];

    while ( heads.length != 0 || marked.length < (W * H) ) {
	
	if ( heads.length == 0 ) {
	    var item = choice(marked);
	    heads.push( item );
	    remove(item, marked);
	}

	position = heads.pop();
	slot = get(maze, position.X, position.Y);

	resolve_slot(maze, slot, position, heads, marked);
    }
    return { maze: maze, ent: ent };
}


// ** ** ** ** ** DRAWING ** ** ** ** ** 
function draw_maze(maze, ent) {
    var col, slot;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W*PW, H*PW);
    for (Y=0; Y<H; Y++) {
	for (X=0; X<H; X++) {
	    if (X == ent.X && Y == ent.Y) {
		ctx.fillStyle = "#FF0000";
	    } else {
		ctx.fillStyle = "#FFFFFF";
	    }
	    slot = get(maze, X, Y);
	    if (slot.N || slot.E || slot.S || slot.W) {
		ctx.fillRect(X*PW + PW/8, Y*PW + PW/8, PW - (PW/8) * 2, PW - (PW/8) * 2);
	    } else {
		continue;
	    }
	    if (slot.N) {
		ctx.fillRect(X*PW + PW/8, Y*PW, PW - (PW/8)*2, PW/8);
	    }
	    if (slot.E) {
		ctx.fillRect(X*PW + (PW - (PW/8)), Y*PW + PW/8, PW/8, PW - (PW/8)*2);
	    }
	    if (slot.S) {
		ctx.fillRect(X*PW + PW/8, Y*PW + (PW - (PW/8)), PW - (PW/8)*2, PW/8);
	    }
	    if (slot.W) {
		ctx.fillRect(X*PW, Y*PW + (PW/8), PW/8, PW - (PW/8)*2);
	    }
	}
    }
}

var MAZE = depth_first();
draw_maze(MAZE.maze, MAZE.ent);
