/*
To do list
----------
[] explination page
[] rule builder
[] load rule
*/

var PW, W, H;
PW = 16;
W = 33; H = 33;

var interval = null;
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
ctx.canvas.width = W*PW; ctx.canvas.height = H*PW;
ctx.font = String(PW) + "px Arial";

COLORS = {
    R : 64,
    G : 128,
    B : 192,
    classic   : classic_color,
    density   : density_color,
    direction : direction_color,
    state : "classic",
}

function classic_color(x, y, cells) {
    return cells.has(pack(x, y)) ? "#000000" : "#FFFFFF";
}
function density_color(x, y, cells) {
    let r; let b; let g;
    const slot = nbrs(cells, x, y, W, H);
    const thrd = 8 / 3;
    let density = 0;
    for (let i = 0; i < slot.length; i++) {
	if (slot.charAt(i) == "1") {
	    density += 1
	}
    }
    r = COLORS.R + (density) * (256 / 8)  
    g = COLORS.G + (density + thrd) * (256 / 8)  
    b = COLORS.B + (density + (thrd * 2)) * (256 / 8)  

    r = Math.floor(r % 255)
    g = Math.floor(g % 255)
    b = Math.floor(b % 255)

    return cells.has(x, y)
	? rgb_to_hex(255-r, 255-g, 255-b)
	: rgb_to_hex(r, g, b)
}
function direction_color(x, y, cells) {
    let r; let g; let b;
    const slot = nbrs(cells, x, y, W, H);
    const r_shade = slot[5] + slot[3] + slot[0] + slot[1] + slot[2];
    const g_shade = slot[5] + slot[3] + slot[0] + slot[1] + slot[6];
    const b_shade = slot[7] + slot[6] + slot[5] + slot[3] + slot[0];

    r = from8bits(r_shade) * 8
    g = from8bits(g_shade) * 8
    b = from8bits(b_shade) * 8

    if (cells.has(pack(x, y))) {
	r = (r + 128) % 255
        g = (g + 128) % 255
        b = (b + 128) % 255
    }

    return rgb_to_hex(255-r, 255-g, 255-b)
}

function rgb_to_hex(r, g, b) {
    return "#" + [r, g, b].map((x) => {
	x = parseInt(x).toString(16);
	return (x.length==1) ? "0"+x : x;
    }).join("");
}

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
function from8bits(b) {
    var n = 0;
    var base = 1
    for (var i=0; i < b.length; i++) {
	if (b[i] == "1") {
	    n += base;
	}
	base *= 2;
    }
    return n;
}

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
	    ctx.fillStyle = COLORS[COLORS.state](x, y, cells)
            ctx.fillRect(x*PW, y*PW, PW, PW);
        }
    }
    ctx.stroke();
}

function fresh_board(W, H) {
    cells = new Set();
    cells.add(pack(16, 16));
    return cells
}

function apply_rule(W, H, rule, cells) {
    next_gen = new Set();
    for (var y=0; y <= H; y++) {
        for (var x=0; x <= W; x++) {
            var diget = from8bits(nbrs(cells, x, y, W, H), 2);
	    if (rule[diget] == '1') {
                next_gen.add(pack(x, y))
	    }
	}
    }
    return next_gen
}

function hash_to_hex(rule) {
    var hash = "";
    for (var i=0; i<rule.length; i+=4) {
	var b = parseInt(rule.slice(i, i+4), 2).toString(16);
	hash += b;
    }
    return hash;
}
function dehash_to_bin(hash) {
    var bin = "";
    for (var i=0; i<hash.length; i++) {
	var h = "0000" + parseInt(hash[i], 16).toString(2);
	h = h.slice(h.length - 4, h.length);
	bin += h;
    }
    return bin;
}

cells = fresh_board(W, H);
draw_board(cells);
rule = dehash_to_bin(document.getElementById("rule").value);

if (rule == "") {
    rule = get_rule();
    document.getElementById("rule").value = hash_to_hex(rule);
}

/*
Buttons ~
*/

function newrule() {
    cells = fresh_board(W, H);
    draw_board(cells);
    rule = get_rule();
    document.getElementById("rule").value = hash_to_hex(rule);
}

function set_rule() {
    cells = fresh_board(W, H);
    draw_board(cells);
    rule = dehash_to_bin(document.getElementById("rule").value);
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

function newred(val) {
    COLORS.R = val;
    draw_board(cells);
}
function newgreen(val) {
    COLORS.G = val;
    draw_board(cells);
}
function newblue(val) {
    COLORS.B = val;
    draw_board(cells);
}

function new_color_state(state) {
    COLORS.state = state
    draw_board(cells)
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

