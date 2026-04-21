const express = require('express');
const http = require('http');
const WebSocketServer = require('ws').Server;

const app = express();

app.use(express.static(__dirname + "/Public"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server:server });
    
const gameState = {
    player1: {id:"player1", px:2, py:2},
    player2: {id:"player2", px:5, py:5}
}


//the input buffer to store game movement
const inputBuffer = [];

//sets a timer for the game 
setInterval(() => {
    for(const item of inputBuffer){
            for(const item of inputBuffer){
    if(item.state === true){
        const player = gameState[item.id];
        if(item.key === 'w' || item.key === 'arrowup') player.py -= 0.1;
        if(item.key === 's' || item.key === 'arrowdown') player.py += 0.1;
        if(item.key === 'a' || item.key === 'arrowleft') player.px -= 0.1;
        if(item.key === 'd' || item.key === 'arrowright') player.px += 0.1;
    }
}}



inputBuffer.length = 0;
        

    wss.clients.forEach(function each(client){
            client.send(JSON.stringify(gameState))
        });
    }, 50)

//opens a dual server for it to connect to get data from 
//player packet and close the connection when it is over
wss.on('connection', (ws) => {
    console.log("Player connected");

    ws.on('message', (packet)=>{
        inputBuffer.push(JSON.parse(packet.toString()));
    })

    ws.on('close', () => {
        console.log("Player disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running");
});