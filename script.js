const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

    const rows = 100;
    const cols = 100;
    const GRASS = 0;
    const WATER = 1;
    const SOIL = 2;
    const map = [];
    const gameKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright","w", "a", "s", "d", " "]
    const tileSize = 58;

    for (let y = 0; y < rows; y++) {
        map[y] = [];
        for (let x = 0; x < cols; x++) {
            map[y][x] = GRASS;
        }
    }
    const player = {
        id: "player1",
        px:2,
        py:2,
        speed: 0.1,
        color: "#FF0000"
    };
        
    const player2 = {
        id: "player2",
        px:5,
        py:5,
        speed: 0.1,
        color: "#000000"
    };

    const entities = [player, player2];

    const keys = {};

    function createPatch(cx, cy, radius, type) {
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                let dx = cx + x;
                let dy = cy + y;
                if (dx >= 0 && dx    < cols && dy >= 0 && dy < rows) {
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
   

    console.log("Map initialized:", map);
    function canMove(x, y){
        return (map[y][x] !== WATER && map[y][x] !== SOIL
        ) 
    }

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function draw() {
        const colors = [
            "#4CAF50", // grass (green)
            "#2196F3", // water (blue)
            "#8B4513"  // soil (brown)
        ];

        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        cameraX = player.px * tileSize - canvas.width / 2;
        cameraY = player.py * tileSize - canvas.height / 2;

        let startcols = Math.max(0,Math.floor(cameraX/tileSize));
        let endcols = Math.min(cols,startcols + Math.ceil(canvas.width/tileSize) +1);

        let startrows = Math.max(0, Math.floor(cameraY/tileSize));
        let endrows = Math.min(rows, startrows + Math.ceil(canvas.height/tileSize) +1);

// to draw the only seeing part of the window
        for (let y = startrows; y < endrows; y++) {

            for (let x = startcols; x < endcols; x++) {

                const tileType = map[y][x];
                ctx.fillStyle = colors[tileType] || "#FF0000"; 

                ctx.fillRect(
                    Math.floor( x * tileSize - cameraX),
                    Math.floor(y * tileSize - cameraY),
                    Math.ceil(tileSize),
                    Math.ceil(tileSize)
                );
            }
        }

        //to travel through all the entities
        for(let i = 0; i < entities.length; i++){
            let crnEnt = entities[i];

            ctx.fillStyle = crnEnt.color;

            ctx.fillRect(
                crnEnt.px*tileSize - cameraX,
                crnEnt.py*tileSize - cameraY,
                tileSize,
                tileSize
            );
        }
    }

 
    function update(){
        let newX = player.px;
        let newY = player.py;

        if (keys["w"]) newY -= player.speed;
        if (keys["a"]) newX -= player.speed;
        if (keys["s"]) newY += player.speed;
        if (keys["d"]) newX += player.speed;

        let gridX =  Math.floor(newX);
        let gridY = Math.floor(newY);
        
        if (
            gridY >= 0 && gridY < rows &&
            gridX >= 0 && gridX < cols &&
            canMove(gridX, gridY)
        ) {
            player.px =  newX;
            player.py = newY;
        }
    }
        
    function update2(){
        let newX = player2.px;
        let newY = player2.py;

        if (keys["arrowup"]) newY -= player2.speed;
        if (keys["arrowdown"]) newY += player2.speed;
        if (keys["arrowleft"]) newX -= player2.speed;
        if (keys["arrowright"]) newX += player2.speed;

        let gridX =  Math.floor(newX);
        let gridY = Math.floor(newY);
        
        if (
            gridY >= 0 && gridY < rows &&
            gridX >= 0 && gridX < cols &&
            canMove(gridX, gridY)
        ) {
            player2.px =  newX;
            player2.py = newY;
        }
    }

// physics for bullet
    function updateBullets(){
        for(let i = 0; i < entities.length; i++){
            let crnent = entities[i];
            if(crnent.isbullet){
                crnent.px += crnent.speedX; 
            }
        }
    }

    function gameloop(){
        update();
        update2();
        updateBullets();
        draw();
        requestAnimationFrame(gameloop);
    }

    window.addEventListener("resize", (e) =>{
        resize();
        draw();
    });


window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (gameKeys.includes(key)) {
        e.preventDefault();
    }
    if(key === " "){
        const bullet = {
            px: player.px,
            py: player.py,
            color : "#f57e00e8",
            isbullet: true,
            speedX: 0.05
        }
        entities.push(bullet);
    }
    keys[key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});


    console.log(keys);
    window.onload = () => {
        resize();
        gameloop();
        console.log("Initial draw complete");
    };
    
    if (document.readyState === "complete") {
        resize();
    }
    