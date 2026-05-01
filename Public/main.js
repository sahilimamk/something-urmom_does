   
for (let y = 0; y < rows; y++) {
        map[y] = [];
        for (let x = 0; x < cols; x++) {
            map[y][x] = GRASS;
        }
    }

    const player1 = {
        controls: { 
            up: "w", 
            down: "s", 
            left: "a", 
            right: "d",
            shoot: " "},
        width:1,
        height: 1,
        lastDirX: 1,
        lastDirY:0, 
        id: "player1",
        px:2,
        py:2,
        speed: 0.1,
        fireRate:30,
        currentCdown: 0,
        score: 0,
        color: Theme.colors.player1
    };
        
    const player2 = {
        controls: { 
            up: "arrowup", 
            down: "arrowdown", 
            left: "arrowleft", 
            right: "arrowright", 
            shoot: "enter"},
        height:1,
        width:1,
        lastDirX: 0,
        lastDirY:0, 
        id: "player2",
        px:5,
        py:5,
        speed: 0.1,
        fireRate: 30,
        currentCdown: 0,
        score: 0,
        color: Theme.colors.player2
    };

    const entities = [player1, player2];

    const keys = {};


//create a patch of soil or water in the map like a cricle 
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
   
    


// renders the whole game
function gameloop(){
    handleClientInput(player1, keys, player2, map, rows, cols);
    handleClientInput(player2, keys, player1, map, rows, cols);
    draw();
    requestAnimationFrame(gameloop);
}
    console.log(keys);

//websocket connection to connect to server
const socket = new WebSocket("wss://game-multi-nf73.onrender.com");    socket.addEventListener('message', (e) => {
    const state = JSON.parse(e.data);
    
    if(state.type === "GAME_OVER"){
        alert(state.winner + " wins!");
        return;
    }
    
    // rest of your existing code

    console.log("state.bullets:", state.bullets);

    player1.px = state.player1.px;
    player1.py = state.player1.py;
    player2.px = state.player2.px;
    player2.py = state.player2.py;
    player1.score = state.player1.score;
    player2.score = state.player2.score;

    entities.length = 2; // keep player and player2, wipe old bullets
    for (const b of state.bullets) {
        b.color = b.owner === "player1" ? Theme.colors.player1 : Theme.colors.player2;
        entities.push(b);
    }
    });
    
    window.onload = () => {
        resize();
        gameloop();
        console.log("Initial draw complete");
    };
    
    if (document.readyState === "complete") {
        resize();
    }
