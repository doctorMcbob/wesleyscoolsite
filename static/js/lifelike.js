/**
   If you're reading this, hello! :)

   Please dont hesitate to ask me about anything, wootenwesley@gmail.com
   I finally got a real programming job <3 ! LETS GOOOOO
*/

const svgns = "http://www.w3.org/2000/svg";
const board = document.getElementById('board');

let W; let H;
let PW = 16; // pixel width

let play = false;
let showInfo = false;

let cells = new Set();

cells.add("2 1");
cells.add("3 2");
cells.add("3 3");
cells.add("2 3");
cells.add("1 3");

// default game of life rules
const keepAlive = new Set([2, 3]);
const comeAlive = new Set([3]);

let HUD = drawnHUD();
let INFO = drawnInfo();

// colors
const DEAD = "white";
const ALIVE = "black";
const GRID = "gray";

function setDimensions() {
    PW = 16;

    W = Math.floor( document.body.offsetWidth / PW )
    H = Math.floor( document.body.offsetHeight / PW ) - 8

    if (W < 28) {
	PW = document.body.offsetWidth / 28;
	W = 28;
	H = Math.floor( document.body.offsetHeight / PW ) - 3
    }
    board.setAttribute('height', (H+3)*PW);
    board.setAttribute('width', W*PW);
    HUD = drawnHUD();
    INFO = drawnInfo();
    updateBoard();
}

function drawnHUD() {
    let HUD = `<rect width="${W*PW}" height=${PW*3} x="0" y="0" stroke="black" fill="white"/>`;
    HUD += `<text x="${PW}" y="${PW}" font-size="${PW}" fill="black">Keep Alive</text>`;
    HUD += `<text x="${PW}" y="${PW*2+(PW/2)}" font-size="${PW}" fill="black">Come Alive</text>`;

    for (let i=1; i<=8; i++) {

	let col = keepAlive.has(i)
	    ? "gray"
	    : "white";

	HUD += `<rect width="${PW*1.5}" height=${PW*1.5} x="${(PW*5)+(PW*1.5*i)}" y="0" fill="${col}" stroke="black" />`
	HUD += `<text x="${(PW*5)+(PW*1.5*i)+(PW/2)}" y="${PW}" font-size="${PW}">${i}</text>`	
    	col = comeAlive.has(i)
	    ? "gray"
	    : "white";
	HUD += `<rect width="${PW*1.5}" height=${PW*1.5} x="${(PW*5)+(PW*1.5*i)}" y="${PW*1.5}" fill="${col}" stroke="black" />`
	HUD += `<text x="${(PW*5)+(PW*1.5*i)+(PW/2)}" y="${PW*2+(PW/2)}" font-size="${PW}">${i}</text>`
    }

    col = play
	? "gray"
	: "white";
    HUD += `<rect width="${PW*3}" height="${PW*3}" x="${(W-3)*PW}" y="0" stroke="black" fill="${col}" />`
    HUD += `<polygon points="${((W-3)*PW)+(PW*(2/3))},${(PW*(2/3))} ${((W-3)*PW)+(PW*(2/3))},${(PW*3)-(PW*(2/3))} ${(W*PW)-(PW*(2/3))},${PW*1.5}" fill="black" />`

    HUD += `<rect width="${PW*3}" height="${PW*3}" x="${(W-6)*PW}" y="0" stroke="black" fill="white" />`
    HUD += `<text x="${(W-6)*PW + PW/2}" y="${PW*2.5}" font-size="${PW*3}px">C</text>`

        HUD += `<rect width="${PW*3}" height="${PW*3}" x="${(W-9)*PW}" y="0" stroke="black" fill="white" />`
    HUD += `<text x="${(W-9)*PW + PW/2}" y="${PW*2.5}" font-size="${PW*3}px">I</text>`

    return HUD;
}

function updateBoard() {
    let input = `<rect width="${W*PW}" height="${H*PW}" y="${PW*3}" fill="white" stroke-width="2" stroke="black" />`;
    for (let y = 0; y < H; y++) {
	for (let x = 0; x < W; x++) {
	    const col = cells.has(`${x} ${y}`)
		  ? ALIVE
		  : DEAD;
	    input += `<rect x="${x*PW}" y="${(y+3)*PW}" width="${PW}" height="${PW}" fill="${col}" stroke="${GRID}" />`;
	}
    }
    if (showInfo) input += INFO;
    board.innerHTML = HUD + input;
}

function drawnInfo () {
    let info = `<rect x="${PW*5}" y="${PW*5}" height="${PW*20}" width="${PW*20}" fill="white" stroke="black" stroke-width="5px"/>`;
    info += `<text x="${PW*7}" y="${PW*7}" font-size="${PW}">Life Like Cellular Automata Explination</text>`
    info += `<text x="${PW*7}" y="${PW*9}" font-size="${PW}">A cell will stay "alive" if the number</text>` 
    info += `<text x="${PW*8}" y="${PW*10}" font-size="${PW}">of surrounding neighbors is in</text>`
    info += `<text x="${PW*8}" y="${PW*11}" font-size="${PW}">the "Keep Alive" set.</text>`
    info += `<text x="${PW*7}" y="${PW*13}" font-size="${PW}">A "dead" cell will come "alive" if</text>`
    info += `<text x="${PW*8}" y="${PW*14}" font-size="${PW}">the number of surrounding neighbors</text>`
    info += `<text x="${PW*8}" y="${PW*15}" font-size="${PW}">is in the "Come Alive" set.</text>`
    info += `<text x="${PW*7}" y="${PW*17}" font-size="${PW}">Regular Game of Life rules</text>`
    info += `<text x="${PW*8}" y="${PW*18}" font-size="${PW}">Keep Alive 2, 3</text>`
    info += `<text x="${PW*8}" y="${PW*19}" font-size="${PW}">Stay Alive 3</text>`
    info += `<text x="${PW*7}" y="${PW*21}" font-size="${PW}">Have fun!</text>`
    info += `<text x="${PW*8}" y="${PW*22}" font-size="${PW}">Send me any cool patterns you find</text>`

    return info;
}

function clear () {
    cells = new Set();
}

function sum_nbrs (x, y) {
    let nbrs = 0;
    for (let y_ of [y-1, y, y+1]) {
	for (let x_ of [x-1, x, x+1]) {
	    if (!(x === x_ && y === y_)) {
		if (cells.has(`${x_} ${y_}`)) {
		    nbrs += 1;
		}
	    }
	}
    }
    
    return nbrs;
}

function applyRule (cells) {
    const next = new Set();
    for (let y = 0; y < H; y++) {
	for (let x = 0; x < W; x++) {
	    const nbrs = sum_nbrs(x, y);
	    if (
		(!cells.has(`${x} ${y}`)
		 && comeAlive.has(nbrs))
		    || (cells.has(`${x} ${y}`)
			&& keepAlive.has(nbrs))
	    ) {
		next.add(`${x} ${y}`);
	    }
	}
    }
    return next;
}

function clickHandler (event) {
    const rect = board.getBoundingClientRect()
    let mx = event.pageX - rect.left;
    let my = event.pageY - rect.top;

    showInfo = false;
    
    if (my > PW*3) {
	play = false;

	let pos = `${Math.floor(mx / PW)} ${Math.floor((my / PW) - 3)}`;
	if (cells.has(pos)) {
	    cells.delete(pos);
	} else {
	    cells.add(pos);
	}
    } else if (my < PW*3) {
	if (mx > (W - 3) * PW) {
	    play = !play;
	} else {
	    play = false;
	    if (mx > (W - 6) * PW) {
		clear();
	    } else if (mx > (W - 9) * PW) {
		showInfo = true;
	    } else if (mx > PW * 5 + PW * 1.5
		       && mx < PW * 5 + PW * 9 * 1.5) {
		const i = Math.floor((mx - PW * 5 + PW * 1.5) / (PW * 1.5)) - 1
		
		if (my < (PW * 1.5)) {
		    if (keepAlive.has(i)) {
			keepAlive.delete(i);
		    } else {
			keepAlive.add(i);
		    }
		} else if (my > (PW * 1.5)) {
		    if (comeAlive.has(i)) {
			comeAlive.delete(i);
		    } else {
			comeAlive.add(i);
		    }
		}
	    }
	}
    }
    HUD = drawnHUD();
    updateBoard();
}

const draw = setInterval(() => {
    if (play) {
	cells = applyRule(cells);
	updateBoard();
    }
}, 500);

setDimensions();

board.addEventListener('click', clickHandler);
window.addEventListener('resize', setDimensions);

