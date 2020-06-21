/*
To do list
----------
[] explination page
[] rule builder
[] load rule
*/

var PW, W, H;
PW = 16;
W = 64; H = 32;

var interval = null;
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
ctx.canvas.width = W*PW; ctx.canvas.height = H*PW;
ctx.font = String(PW) + "px Arial";

function mod(n, m) {return ((n % m) + m) % m}
function get_rule() {
    str = '';
    while (str.length < 256) {
	str += Math.round(Math.random()).toString();
    }
    return str;
}
function pack(x, y) {return x.toString() + "," + y.toString()}
function tobin(n, b) {return ('0'.repeat(b) + n.toString(2)).substr(-b)}

function nbrs(cells, x, y, W, H) {
    var ret = "";
    for (var j=y-1; j <= y+1; j++) {
        for (var i=x-1; i <= x+1; i++) {
            if (pack(mod(i, W), mod(j, H)) == pack(x, y)) continue
            if (cells.has(pack(mod(i, W), mod(j, H)))) {
                ret += "1";
            } else {
                ret += "0";
            }
        }
    }
    return ret;
}

function draw_board(cells) {
    ctx.beginPath();
    for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
            if (cells.has(pack(x, y))) {ctx.fillStyle = "#4444FF"} else {ctx.fillStyle = "#999999"}
            ctx.fillRect(x*PW, y*PW, PW, PW);
            ctx.rect(x*PW, y*PW, PW, PW);
        }
    }
    ctx.stroke();
}



function fresh_board(W, H) {
    cells = new Set();
    cells.add(pack(W/2, H/2));
    return cells
}

function apply_rule(W, H, rule, cells) {
    next_gen = new Set();
    for (var y=0; y <= H; y++) {
        for (var x=0; x <= W; x++) {
            var diget = parseInt(nbrs(cells, x, y, W, H), 2);
	    if (rule[diget] == '1') {
                next_gen.add(pack(x, y))
	    }
	}
    }
    return next_gen
}


cells = fresh_board(W, H);
draw_board(cells);
rule = get_rule();
bint = BigInt('0b'+rule);
hash = bint.toString(36);
document.getElementById("rule").value = hash;

/*
Buttons ~
*/

function newrule() {
    cells = fresh_board(W, H);
    draw_board(cells);
    rule = get_rule();
    bint = BigInt('0b'+rule);
    hash = bint.toString(36);
    document.getElementById("rule").value = hash;
}


function next() {
    cells = apply_rule(W, H, rule, cells);
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
    draw_board(cells);
}

canvas.addEventListener('click', click);
