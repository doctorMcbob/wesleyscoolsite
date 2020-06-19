var W, H, PW;
W = 32; H = 16;
PW = 16;
var interval = null;
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
ctx.canvas.width = W*PW; ctx.canvas.height = H*PW;
ctx.font = String(PW) + "px Arial";

function randint(max, min) {return Math.floor(Math.random()*(max - min)+min)}
function pack(x, y) {return x.toString() + "," + y.toString()}

class node {
    constructor(data) {
        this.data = data;
        this.pntr = null;
    }
}
var stack = null

function random_board(density) {
    var cells = new Set();
    for (var i=0; i < W*H / density; i++) {cells.add(pack(randint(0, W), randint(0, H)))}
    return cells
}

function draw_board(cells) {
    ctx.beginPath();
    for (var x = 0; x < W; x++) {
       for (var y = 0; y < H; y++) {
           if (cells.has(pack(x, y))) {ctx.fillStyle = "#4444FF"} else {ctx.fillStyle = "#999999"}
           ctx.fillRect(x*PW, y*PW, PW, PW);
	   ctx.rect(x*PW, y*PW, PW, PW);
	   ctx.fillStyle = "#CCCCCC";
           ctx.fillText(String(nbrs(x, y)), (x*PW)+PW/4, (y+1)*PW)
       }
    }
    ctx.stroke();
}

function nbrs(x, y) {
    var sum = 0;
    for (var i=x-1; i <= x+1; i++) {
        for (var j=y-1; j <= y+1; j++) {
            if (pack(i, j) == pack(x, y)) continue
            if (cells.has(pack(i, j))) {
                sum += 1;
	    }
	}
    }
    return sum;
}

function life(cells) {
    var next = new Set();
    for (var x=0; x < W; x++) {
        for (var y=0; y < H; y++) {
            var n = nbrs(x, y);
            if (n == 3) next.add(pack(x, y))
            if (cells.has(pack(x, y)) && (n == 2 || n == 3)) next.add(pack(x, y)) 
	}
    } 
    return next;
}

function clearboard() {
    if (interval != null) play();
    cells = new Set();
    stack = new node(cells);
    draw_board(cells);
}

function fill() {
    if (interval != null) play();
    cells = random_board(3);
    stack = new node(cells);
    draw_board(cells);
}

function next() {
    cells = life(cells);
    var nde = new node(cells);
    nde.pntr = stack;
    stack = nde;
    draw_board(cells);
}

function back() {
    if (interval != null) play();
    if (stack.pntr != null) {
        cells = stack.pntr.data;
        stack = stack.pntr;
        draw_board(cells);
    }
}

function reset() {
    if (interval != null) play();
    while (stack.pntr != null) stack = stack.pntr;
    cells = stack.data;
    draw_board(cells);
    
}

function play() {
    var btn = document.getElementById("play");
    if (btn.innerHTML == " Play " && interval == null) {
        next();
        btn.innerHTML = " Stop ";
        interval = window.setInterval(next, 500);
    } else {
        btn.innerHTML = " Play ";
        clearInterval(interval);
        interval = null;
    }
}

function click(e) {
    if (interval != null) play();
    var rect = canvas.getBoundingClientRect();
    var pos = pack(Math.floor((e.x-rect.left)/PW), Math.floor((e.y-rect.top)/PW));
    if (cells.has(pos)) cells.delete(pos);
    else cells.add(pos);
    stack.data = cells;
    draw_board(cells);
}

canvas.addEventListener('click', click)

fill();
