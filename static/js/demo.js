var W = 3;
var H = 3;
var PW = 16;
function mod(n, m) {return ((n % m) + m) % m}
function pack(x, y) {return x.toString() + "," + y.toString()}

function draw_board(ctx, cells) {
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

boards = document.getElementsByClassName("demo");
for (var i=0; i < boards.length; i++) {
    var ctx = boards[i].getContext('2d');
    ctx.canvas.width = W*PW; ctx.canvas.height = H*PW;
    var rule = boards[i].id;
    var cells = new Set();
    for (var j=0; j < rule.length; j++) {
	if (rule[j] == "1") {
	    if (j <= 3) {
		cells.add(pack(mod(j, 3), Math.floor(j/3)));
	    } else if (j > 3) {
		cells.add(pack(mod(j+1, 3), Math.floor((j+1)/3)));
	    } else {
		console.log(j);
	    }
	}
    }
    draw_board(ctx, cells);
}
