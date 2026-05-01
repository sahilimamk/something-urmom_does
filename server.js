const express = require('express');
const http = require('http');
const WebSocketServer = require('ws').Server;
const {checkAABB, createBullet, applyMovement, canMove, updateBullets} = require('./Public/physics.js');

const app = express();

app.use(express.static(__dirname + "/Public"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server: server });

    
const gameState = {
    bullets: [],
    player1: { id: "player1", px: 2, py: 2, score:0, width: 1, height: 1 },
    player2: { id: "player2", px: 5, py: 5, score:0, width: 1, height: 1 }
};

const activeKeys = {
    player1: {},
    player2: {}
};

// sets a timer for the game 
setInterval(() => {
    // Process continuous movement for both players
    ['player1', 'player2'].forEach(id => {
        if(gameState[id].score >= 5){
        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: "GAME_OVER",
                winner: id
                }));
            });
            // Reset scores
        gameState.player1.score = 0 ;
        gameState.player2.score = 0 ;
        
        // Reset to spawn positions
        gameState.player1.px = 2;
        gameState.player1.py = 2;
        gameState.player2.px = 5;
        gameState.player2.py = 5;

        // Clear all bullets out of the air
        gameState.bullets = [] ; 
    }
        
        const p = gameState[id];
        const target = id === "player1" ? gameState.player2 : gameState.player1;
        
        let dirX = 0, dirY = 0;
        const keys = activeKeys[id];
        
        if (keys['w'] || keys['arrowup']) dirY -= 0.1;
        if (keys['s'] || keys['arrowdown']) dirY += 0.1;
        if (keys['a'] || keys['arrowleft']) dirX -= 0.1;
        if (keys['d'] || keys['arrowright']) dirX += 0.1;

        if (dirX !== 0 || dirY !== 0) {
            applyMovement(p, dirX, dirY, target, null, null, null);
            p.px = Math.max(0, Math.min(99, p.px));
            p.py = Math.max(0, Math.min(99, p.py));
            
        }
    });

    
// looping through each bullet for 
    updateBullets(gameState.bullets, gameState.player1, gameState.player2);

    gameState.bullets = gameState.bullets.filter(b => !b.dead);

    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify(gameState));
    });

}, 16);



// opens a dual server for it to connect to get data from 
// player packet and close the connection when it is over
wss.on('connection', (ws) => {
    console.log("Player connected");

    ws.on('message', (packet) => {
        try {
            const parsed = JSON.parse(packet.toString());
            if(parsed.type === "INPUT" && (parsed.key === " " || parsed.key === "enter") && parsed.state === true){
                    console.log("SHOOT received", parsed);

                const shooter = gameState[parsed.id];
                const dX = shooter.lastDirX !== undefined ? shooter.lastDirX : 1;
                const dY = shooter.lastDirY !== undefined ? shooter.lastDirY : 0;
                
                gameState.bullets.push(createBullet(
                    shooter.px, shooter.py, 
                    dX, dY, parsed.id));
            }else{
                activeKeys[parsed.id][parsed.key] = parsed.state;
            }
        } catch (e) {
            console.error("Invalid packet received:", e);
        }
    });

    ws.on('close', () => {
        console.log("Player disconnected");
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
