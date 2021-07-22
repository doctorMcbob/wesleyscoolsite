let PW = 16;
let WIDTH = 32;
let HEIGHT = 32;
let CX = 0 - WIDTH / 2;
let CY = 0 - HEIGHT / 2;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const ruleCanvas = document.getElementById('rule');
const ruleCtx = ruleCanvas.getContext('2d');

ctx.canvas.width = WIDTH * PW;
ctx.canvas.height = HEIGHT * PW;

let PLAY = false;

let CELLS = new Set();
let LINES = [];

let STATES = 3
let NODE = {
    x : 0, y : 0,
    state : 0,
}
let RULE = {};

/* ~~~~ HELPERS ~~~~ */
function randint(max) { return Math.floor(Math.random() * max) }

function packCell(n1, n2) { return `${n1},${n2}` }
function unpackCell(s) { return s.split(',') }

function packLine(c1, c2) { return `${c1}|${c2}`}
function unpackLine(s) { return s.split('|') }

/* ~~~~ RULE FUNCTIONALITY ~~~~ */
function applyExit(exit) {
    /*  0 1 2   exits as so
     *  3 @ 4
     *  5 6 7
     */
    const pre = packCell(NODE.x, NODE.y);
    switch (exit) {
        case 0: NODE.x -= 1; NODE.y -= 1; break;
        case 1:              NODE.y -= 1; break;
        case 2: NODE.x += 1; NODE.y -= 1; break;
        case 3: NODE.x -= 1;              break;
        case 4: NODE.x += 1;              break;
        case 5: NODE.x -= 1; NODE.y += 1; break;
        case 6:              NODE.y += 1; break;
        case 7: NODE.x += 1; NODE.y += 1; break;
    }
    const line = packLine(pre, packCell(NODE.x, NODE.y));
    if (!LINES.includes(line)) LINES.unshift(line);
}

function applyRule() {
    const block = CELLS.has(packCell(NODE.x, NODE.y))
	  ? 1
	  : 0;
    const next = RULE[`${block},${NODE.state}`].split(',');
    
    NODE.state = parseInt(next[1]);

    const pos = packCell(NODE.x, NODE.y);
    if (CELLS.has(pos) && next[2] == 0) {
	CELLS.delete(pos);
    } else if (next[2] == 1) {
	CELLS.add(pos);
    }
    applyExit(parseInt(next[0]));
}

function randomRule() {
    const rule = {};

    for (let block = 0; block < 2; block++) {
        for (let state = 0; state < STATES; state++) {
            // our position, our state ... exit, state , block 
            rule[`${block},${state}`] = `${randint(8)},${randint(STATES)},${randint(2)}`;
        }
    }
    
    return rule;
}

function clearRule() {
    /* There is no blank rule in this context so its more of a normalize rule */
    const rule = {};

    for (let block = 0; block < 2; block++) {
        for (let state = 0; state < STATES; state++) {
            // our position, our state ... exit, state , block 
            rule[`${block},${state}`] = `4,0,0`;
        }
    }
    
    return rule;
}

/* ~~~~ DRAW FUNCTIONALITY ~~~~ */
function drawBoard(ctx, dim, cor)  {
    // context, dimensions, corner
    const W = dim[0]; const H = dim[1];
    const X = cor[0]; const Y = cor[1];

    ctx.beginPath();

    for (let y = Y; y < Y + H; y++) {
        for (let x = X; x < X + W; x++) {
            ctx.fillStyle = CELLS.has(packCell(x, y))
                ? '#888888'
                : '#EEEEEE';
            ctx.fillRect((x-X)*PW, (y-Y)*PW, PW, PW);
	}
    }
    ctx.stroke();
}

function drawNode(ctx, dim, cor) {
    // context, dimensions, corner
    const W = dim[0]; const H = dim[1];
    const X = cor[0]; const Y = cor[1];
    
    ctx.beginPath();
    ctx.font = `${PW}px Helvetica`;
    ctx.fillStyle = '#000000';
    ctx.fillText(NODE.state, (NODE.x - X) * PW, (NODE.y - Y + 1) * PW);
    ctx.stroke();
}
    
function drawLines(ctx, dim, cor) {
    // context, dimensions, corner
    const W = dim[0]; const H = dim[1];
    const X = cor[0]; const Y = cor[1];
    
    ctx.beginPath();

    ctx.strokeStyle = '#882222';

    for (let idx = 0; idx < LINES.length; idx++) {
        let line = unpackLine(LINES[idx]);
        let p1 = unpackCell(line[0]);
        let p2 = unpackCell(line[1]);

        ctx.moveTo((parseInt(p1[0]) - X) * PW + PW / 2, (parseInt(p1[1]) - Y) * PW + PW / 2);
        ctx.lineTo((parseInt(p2[0]) - X) * PW + PW / 2, (parseInt(p2[1]) - Y) * PW + PW / 2);
    }
    
    ctx.stroke();
}

function drawRuleSegment(ruleCtx, position, ruleKey, ruleValue) {
    let X = position[0]; let Y = position[1];
    let keyBlock = ruleKey[0];
    let keyState = ruleKey[1];
    let valueExit = ruleValue[0];
    let valueState = ruleValue[1];
    let valueBlock = ruleValue[2];

    ruleCtx.beginPath();

    ruleCtx.fillStyle = keyBlock === 1
        ? '#888888'
        : '#EEEEEE';
    ruleCtx.fillRect(X, Y, 16, 16);

    ruleCtx.fillStyle = '#000000';
    ruleCtx.font = `16px Helvetica`;
    ruleCtx.fillText(keyState, X, Y + 16);

    ruleCtx.stroke();

    X += 32;
    Y -= 16;

    ruleCtx.beginPath();
    
    ctx.strokeStyle = '#333333';

    let d = 0;
    for (let n = 0; n < 9; n++) {
        if (n === 4) {
            ruleCtx.fillStyle = valueBlock === 1
                ? '#888888'
                : '#EEEEEE';
            ruleCtx.fillRect(X + 16 * (n % 3), Y + 16 * Math.floor(n / 3), 16, 16);
            ruleCtx.rect(X + 16 * (n % 3), Y + 16 * Math.floor(n / 3), 16, 16);        
            continue;
        }
        ruleCtx.fillStyle = '#EEEEEE';
        ruleCtx.fillRect(X + 16 * (n % 3), Y + 16 * Math.floor(n / 3), 16, 16);
        ruleCtx.rect(X + 16 * (n % 3), Y + 16 * Math.floor(n / 3), 16, 16);

        if (d === valueExit) {
            ruleCtx.fillStyle = '#000000';
            ruleCtx.font = `16 Helvetica`;
            ruleCtx.fillText(valueState, X + 16 * (n % 3), Y + 16 * Math.floor(n / 3) + 16);
        }

        d++;
    }
    ruleCtx.stroke();
}

function drawRule(ruleCtx) {
    ruleCtx.canvas.width = STATES * 7 * 16;
    ruleCtx.canvas.height = 6 * 16 * 2;

    let x = 16; let y = 32;
    for (let block = 0; block < 2; block++) {
        for (let state = 0; state < STATES; state++) {

            let rule = RULE[`${block},${state}`].split(',');
            let ruleExit = parseInt(rule[0]);
            let ruleState = parseInt(rule[1]);
            let ruleBlock = parseInt(rule[2]);

            drawRuleSegment(ruleCtx, [x, y], [block, state], [ruleExit, ruleState, ruleBlock]);
            x += 16 * 7;
        }
        x = 16;
        y += 16 * 6;
    }
}

function draw(ctx) {
    drawBoard(ctx, [WIDTH, HEIGHT], [CX, CY]);
    drawNode(ctx, [WIDTH, HEIGHT], [CX, CY]);
    drawLines(ctx, [WIDTH, HEIGHT], [CX, CY]);
}

/* ~~~~ HTML FUNCTIONALITY ~~~~ */
function updateRule() {
    RULE = randomRule();
    drawRule(ruleCtx);
}

function clearRuleButton() {
    RULE = clearRule();
    drawRule(ruleCtx);
}

function nextButton() {
    applyRule();
    draw(ctx);
}

function resetBoard() {
    PW = 16;
    WIDTH = 32;
    HEIGHT = 32;
    CX = 0 - WIDTH / 2;
    CY = 0 - HEIGHT / 2;
    CELLS = new Set();
    LINES = [];
    NODE = {
	    x : 0, y : 0,
	    state : 0,
    }
    draw(ctx);
}

function updateStates(value) {
    STATES = parseInt(value);
    resetBoard();
}

function playToggle() {
    if (PLAY) {
        clearInterval(PLAY);
        PLAY = false;
    } else {
	PLAY = setInterval(() => {
            if (i % INTER == 0) {
		RULE = randomRule();
		drawRule(ruleCtx);
            }
            applyRule();
	    CX = NODE.x - WIDTH / 2;
	    CY = NODE.y - HEIGHT / 2;
	    draw(ctx);
	    
            i++;
	}, 60);
	playGame()
    }
}

function playGame() {
    if (PLAY) clearInterval(PLAY);

    else resetBoard();

    const INTER = 20;

    let i = 0;
    PLAY = setInterval(() => {
        if (i % INTER == 0) {
            RULE = randomRule();
	    drawRule(ruleCtx);
        }
        applyRule();
	CX = NODE.x - WIDTH / 2;
	CY = NODE.y - HEIGHT / 2;
	draw(ctx);
	
        i++;
    }, 60);
}

/* ~~~~ SCRIPT ~~~~ */
draw(ctx);
updateStates(3);
RULE = clearRule();
drawRule(ruleCtx);

// ~~~~ KEYBOARD FUNCTIONALITY ~~~~
document.addEventListener('keydown', (e) => {
    if (e.code == "KeyA") CX -= 4;
    if (e.code == "KeyW") CY -= 4;
    if (e.code == "KeyD") CX += 4;
    if (e.code == "KeyS") CY += 4;

    if (e.code == "KeyZ" && PW < 32) {
	PW = PW * 2;
	WIDTH = WIDTH / 2;
	HEIGHT = HEIGHT / 2;
    }
    if (e.code == "KeyX" && PW > 8) {
	PW = PW / 2;
	WIDTH = WIDTH * 2;
	HEIGHT = HEIGHT * 2;
    }
        
    draw(ctx);
});

