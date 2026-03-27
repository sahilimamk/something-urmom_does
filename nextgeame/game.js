// ── Map Configuration ────────────────────────────────────────
const MAP_COLS = 60;
const MAP_ROWS = 40;
const TILE_SIZE = 32;

const CANVAS_TILE_COLS = 24;   // visible columns
const CANVAS_TILE_ROWS = 16;   // visible rows
const CANVAS_W = CANVAS_TILE_COLS * TILE_SIZE;
const CANVAS_H = CANVAS_TILE_ROWS * TILE_SIZE;

const MINIMAP_SCALE = 3;
const MINIMAP_W = MAP_COLS * MINIMAP_SCALE;
const MINIMAP_H = MAP_ROWS * MINIMAP_SCALE;

// ── Tile Types ───────────────────────────────────────────────
const TILE = {
    GRASS: 0,
    WATER: 1,
    SAND: 2,
    FOREST: 3,
    STONE: 4,
    PATH: 5,
    FLOWER: 6,
};

const TILE_META = {
    [TILE.GRASS]: { name: 'Grass', colors: ['#2d6a4f', '#40916c', '#52b788'], walkable: true },
    [TILE.WATER]: { name: 'Water', colors: ['#0077b6', '#0096c7', '#00b4d8'], walkable: false },
    [TILE.SAND]: { name: 'Sand', colors: ['#e9c46a', '#f4a261', '#e9c46a'], walkable: true },
    [TILE.FOREST]: { name: 'Forest', colors: ['#1b4332', '#2d6a4f', '#1b4332'], walkable: true },
    [TILE.STONE]: { name: 'Stone', colors: ['#6b705c', '#a5a58d', '#6b705c'], walkable: false },
    [TILE.PATH]: { name: 'Path', colors: ['#b08968', '#ddb892', '#b08968'], walkable: true },
    [TILE.FLOWER]: { name: 'Flower', colors: ['#2d6a4f', '#40916c', '#52b788'], walkable: true },
};

// ── Procedural Map Generation ────────────────────────────────
function generateMap() {
    const map = [];

    // Simple Perlin-ish noise via multiple sine waves
    function noise(x, y) {
        return (
            Math.sin(x * 0.15 + y * 0.1) * 0.3 +
            Math.sin(x * 0.07 - y * 0.13) * 0.3 +
            Math.sin((x + y) * 0.09) * 0.2 +
            Math.cos(x * 0.12 + y * 0.18) * 0.2
        );
    }

    for (let r = 0; r < MAP_ROWS; r++) {
        const row = [];
        for (let c = 0; c < MAP_COLS; c++) {
            const n = noise(c, r);

            if (n < -0.35) row.push(TILE.WATER);
            else if (n < -0.2) row.push(TILE.SAND);
            else if (n < 0.15) row.push(TILE.GRASS);
            else if (n < 0.35) row.push(TILE.FOREST);
            else row.push(TILE.STONE);
        }
        map.push(row);
    }

    // Carve paths
    for (let r = 0; r < MAP_ROWS; r++) {
        const pc = Math.floor(MAP_COLS / 2) + Math.round(Math.sin(r * 0.3) * 3);
        if (pc >= 0 && pc < MAP_COLS) map[r][pc] = TILE.PATH;
        if (pc + 1 < MAP_COLS) map[r][pc + 1] = TILE.PATH;
    }
    for (let c = 0; c < MAP_COLS; c++) {
        const pr = Math.floor(MAP_ROWS / 2) + Math.round(Math.sin(c * 0.25) * 2);
        if (pr >= 0 && pr < MAP_ROWS) map[pr][c] = TILE.PATH;
    }

    // Sprinkle flowers on grass
    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            if (map[r][c] === TILE.GRASS && Math.random() < 0.08) {
                map[r][c] = TILE.FLOWER;
            }
        }
    }

    return map;
}

// ── Player ───────────────────────────────────────────────────
const player = {
    x: MAP_COLS / 2,      // tile-based position (float for smooth movement)
    y: MAP_ROWS / 2,
    radius: TILE_SIZE * 0.35,
    speed: 4.5,           // tiles per second
    sprint: false,
    trail: [],            // recent positions for trail effect
};

// ── Input ────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key === 'Shift') player.sprint = true;
});
window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === 'Shift') player.sprint = false;
});

// ── Canvas Setup ─────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const miniCanvas = document.getElementById('minimap-canvas');
const mctx = miniCanvas.getContext('2d');
miniCanvas.width = MINIMAP_W;
miniCanvas.height = MINIMAP_H;

// ── HUD Elements ─────────────────────────────────────────────
const posDisplay = document.getElementById('pos-display');
const tileDisplay = document.getElementById('tile-display');
const speedDisplay = document.getElementById('speed-display');

// ── Map Data ─────────────────────────────────────────────────
const map = generateMap();

// Make sure player starts on a walkable tile
(function ensureWalkableStart() {
    const cx = Math.floor(player.x);
    const cy = Math.floor(player.y);
    if (!TILE_META[map[cy]?.[cx]]?.walkable) {
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                if (TILE_META[map[r][c]].walkable) {
                    player.x = c + 0.5;
                    player.y = r + 0.5;
                    return;
                }
            }
        }
    }
})();

// ── Rendering Helpers ────────────────────────────────────────
let animTime = 0;

function tileColor(type, col, row) {
    const colors = TILE_META[type].colors;
    // Checker-like variation
    const idx = (col + row) % colors.length;
    return colors[idx];
}

function drawTile(col, row, screenX, screenY) {
    const type = map[row]?.[col];
    if (type === undefined) {
        ctx.fillStyle = '#0a0c12';
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        return;
    }

    ctx.fillStyle = tileColor(type, col, row);
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // Water animation
    if (type === TILE.WATER) {
        const wave = Math.sin(animTime * 2 + col * 0.5 + row * 0.3) * 0.12;
        ctx.fillStyle = `rgba(255,255,255,${0.06 + wave})`;
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }

    // Flower dots
    if (type === TILE.FLOWER) {
        const fx = screenX + TILE_SIZE * 0.5;
        const fy = screenY + TILE_SIZE * 0.35 + Math.sin(animTime * 3 + col) * 1.5;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fillStyle = ['#f472b6', '#fb923c', '#facc15', '#a78bfa'][(col * 3 + row) % 4];
        ctx.fill();
    }

    // Subtle grid line
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
}

function drawPlayer(screenX, screenY) {
    // Glow
    const glowRadius = player.radius * 3;
    const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowRadius);
    glow.addColorStop(0, 'rgba(129,140,248,0.35)');
    glow.addColorStop(0.5, 'rgba(129,140,248,0.08)');
    glow.addColorStop(1, 'rgba(129,140,248,0)');
    ctx.beginPath();
    ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Trail
    for (let i = 0; i < player.trail.length; i++) {
        const t = player.trail[i];
        const alpha = (i / player.trail.length) * 0.25;
        const r = player.radius * (0.3 + (i / player.trail.length) * 0.5);
        const tsx = (t.x - camera.x) * TILE_SIZE + CANVAS_W / 2;
        const tsy = (t.y - camera.y) * TILE_SIZE + CANVAS_H / 2;
        ctx.beginPath();
        ctx.arc(tsx, tsy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129,140,248,${alpha})`;
        ctx.fill();
    }

    // Body
    const pulse = 1 + Math.sin(animTime * 4) * 0.06;
    ctx.beginPath();
    ctx.arc(screenX, screenY, player.radius * pulse, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(
        screenX - 2, screenY - 2, 0,
        screenX, screenY, player.radius * pulse
    );
    bodyGrad.addColorStop(0, '#c7d2fe');
    bodyGrad.addColorStop(0.6, '#818cf8');
    bodyGrad.addColorStop(1, '#6366f1');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(screenX - 2, screenY - 2, player.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();
}

// ── Camera ───────────────────────────────────────────────────
const camera = { x: player.x, y: player.y };
const CAMERA_LERP = 0.08;

function updateCamera() {
    camera.x += (player.x - camera.x) * CAMERA_LERP;
    camera.y += (player.y - camera.y) * CAMERA_LERP;
}

// ── Minimap ──────────────────────────────────────────────────
function drawMinimap() {
    // Draw tiles
    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            mctx.fillStyle = TILE_META[map[r][c]].colors[0];
            mctx.fillRect(c * MINIMAP_SCALE, r * MINIMAP_SCALE, MINIMAP_SCALE, MINIMAP_SCALE);
        }
    }

    // Viewport rect
    const vx = (camera.x - CANVAS_TILE_COLS / 2) * MINIMAP_SCALE;
    const vy = (camera.y - CANVAS_TILE_ROWS / 2) * MINIMAP_SCALE;
    const vw = CANVAS_TILE_COLS * MINIMAP_SCALE;
    const vh = CANVAS_TILE_ROWS * MINIMAP_SCALE;
    mctx.strokeStyle = 'rgba(255,255,255,0.6)';
    mctx.lineWidth = 1;
    mctx.strokeRect(vx, vy, vw, vh);

    // Player dot
    const px = player.x * MINIMAP_SCALE;
    const py = player.y * MINIMAP_SCALE;
    mctx.beginPath();
    mctx.arc(px, py, 3, 0, Math.PI * 2);
    mctx.fillStyle = '#818cf8';
    mctx.fill();
    mctx.beginPath();
    mctx.arc(px, py, 5, 0, Math.PI * 2);
    mctx.strokeStyle = 'rgba(129,140,248,0.5)';
    mctx.lineWidth = 1;
    mctx.stroke();
}

// ── Collision Check ──────────────────────────────────────────
function canMoveTo(x, y) {
    // Check the 4 corners of the player's bounding box
    const halfTile = 0.35;
    const corners = [
        { cx: x - halfTile, cy: y - halfTile },
        { cx: x + halfTile, cy: y - halfTile },
        { cx: x - halfTile, cy: y + halfTile },
        { cx: x + halfTile, cy: y + halfTile },
    ];
    for (const corner of corners) {
        const col = Math.floor(corner.cx);
        const row = Math.floor(corner.cy);
        if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
        if (!TILE_META[map[row][col]].walkable) return false;
    }
    return true;
}

// ── Update Logic ─────────────────────────────────────────────
function update(dt) {
    const spd = player.speed * (player.sprint ? 1.8 : 1) * dt;

    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
    }

    // Try X and Y independently for wall sliding
    const newX = player.x + dx * spd;
    const newY = player.y + dy * spd;

    if (dx !== 0 && canMoveTo(newX, player.y)) {
        player.x = newX;
    }
    if (dy !== 0 && canMoveTo(player.x, newY)) {
        player.y = newY;
    }

    // Trail
    if (dx !== 0 || dy !== 0) {
        player.trail.push({ x: player.x, y: player.y });
        if (player.trail.length > 12) player.trail.shift();
    } else if (player.trail.length > 0) {
        player.trail.shift();
    }

    updateCamera();
}

// ── Render ───────────────────────────────────────────────────
function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Fill background
    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Determine visible tile range
    const startCol = Math.floor(camera.x - CANVAS_TILE_COLS / 2);
    const startRow = Math.floor(camera.y - CANVAS_TILE_ROWS / 2);
    const endCol = startCol + CANVAS_TILE_COLS + 1;
    const endRow = startRow + CANVAS_TILE_ROWS + 1;

    // Camera offset (sub-tile)
    const offsetX = (camera.x - CANVAS_TILE_COLS / 2 - startCol) * TILE_SIZE;
    const offsetY = (camera.y - CANVAS_TILE_ROWS / 2 - startRow) * TILE_SIZE;

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const sx = (c - startCol) * TILE_SIZE - offsetX;
            const sy = (r - startRow) * TILE_SIZE - offsetY;
            drawTile(c, r, sx, sy);
        }
    }

    // Player screen position
    const psx = (player.x - camera.x) * TILE_SIZE + CANVAS_W / 2;
    const psy = (player.y - camera.y) * TILE_SIZE + CANVAS_H / 2;
    drawPlayer(psx, psy);

    // Minimap
    drawMinimap();

    // HUD
    const tileCol = Math.floor(player.x);
    const tileRow = Math.floor(player.y);
    posDisplay.textContent = `${tileCol}, ${tileRow}`;
    const currentTile = map[tileRow]?.[tileCol];
    tileDisplay.textContent = currentTile !== undefined ? TILE_META[currentTile].name : '—';
    speedDisplay.textContent = player.sprint ? 'Sprint' : 'Normal';
}

// ── Game Loop ────────────────────────────────────────────────
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap delta
    lastTime = timestamp;
    animTime += dt;

    update(dt);
    render();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(ts => {
    lastTime = ts;
    gameLoop(ts);
});
