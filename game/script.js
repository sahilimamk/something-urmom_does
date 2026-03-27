console.log("SAHIL IMAM KHAN")


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rows = 16;
const cols = 32;
const GRASS = 0;
const WATER = 1;
const SOIL = 2;
const map = [];

for (let y = 0; y < rows; y++) {
    map[y] = [];
    for (let x = 0; x < cols; x++) {
        map[y][x] = GRASS;
    }
}
const player = {
    px: 5,
    py: 5,
    speed: 0.2
};

const keys = {};

function createPatch(cx, cy, radius, type) {
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            let dx = cx + x;
            let dy = cy + y;
            if (dx >= 0 && dx < cols && dy >= 0 && dy < rows) {
                if (x * x + y * y <= radius * radius) {
                    map[dy][dx] = type;
                }
            }
        }
    }
}

createPatch(10, 8, 4, WATER);  // Lake 1
createPatch(25, 5, 3, WATER);  // Lake 2
createPatch(5, 12, 3, SOIL);   // Soil Patch 1
createPatch(20, 10, 4, SOIL);  // Soil Patch 2

console.log("Map initialized:", map);
function canMove(x, y) {
    return (map[y][x] !== WATER && map[y][x] !== SOIL)
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function draw() {

    const tileSize = Math.min(canvas.width / cols, canvas.height / rows);
    const offsetX = (canvas.width - cols * tileSize) / 2;
    const offsetY = (canvas.height - rows * tileSize) / 2;

    const colors = [
        "#4CAF50", // grass (green)
        "#2196F3", // water (blue)
        "#8B4513"  // soil (brown)
    ];

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tileType = map[y][x];
            ctx.fillStyle = colors[tileType] || "#FF0000";

            ctx.fillRect(
                Math.floor(offsetX + x * tileSize),
                Math.floor(offsetY + y * tileSize),
                Math.ceil(tileSize),
                Math.ceil(tileSize)
            );
        }
    }

    ctx.fillStyle = "#FF0000";

    ctx.fillRect(player.px * tileSize + offsetX,
        player.py * tileSize + offsetY,
        tileSize,
        tileSize
    );
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    let newX = player.px;
    let newY = player.py;

    if (key === "w") newY -= player.speed;
    if (key === "a") newX -= player.speed;
    if (key === "s") newY += player.speed;
    if (key === "d") newX += player.speed;

    let gridX = Math.floor(newX);
    let gridY = Math.floor(newY);

    if (
        gridY >= 0 && gridY < rows &&
        gridX >= 0 && gridX < cols &&
        canMove(gridX, gridY)
    ) {
        player.px = Math.max(0, Math.min(cols - 1, newX));
        player.py = Math.max(0, Math.min(rows - 1, newY));
    }
    draw();
});

window.addEventListener("keyup", (e) => {
    const key = e.key;
    if (e.key === " ") {

    }
});
window.addEventListener("resize", (e) => {
    resize();
    draw();
});

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});



window.onload = () => {
    resize();
    console.log("Initial draw complete");
};

if (document.readyState === "complete") {
    resize();
}