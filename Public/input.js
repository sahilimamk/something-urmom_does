const gameKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "];

window.addEventListener("resize", (e) => {
    resize();
    draw();
});

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (gameKeys.includes(key)) {

        //it checks whether the game controls are of player1 keys and 
        // are in game keys
        if (Object.values(player.controls).includes(key)) {
            const packet = {
                type: "INPUT",
                id: player.id,
                key: key,
                state: true
            };
            e.preventDefault();
            socket.send(JSON.stringify(packet));
        }
        //same idea just checking for player 2 controls and whether
        // they are in the player 2 controls  
        else if (Object.values(player2.controls).includes(key)) {
            const packet = {
                type: "INPUT",
                id: player2.id,
                key: key,
                state: true
            };
            e.preventDefault();
            socket.send(JSON.stringify(packet));
        }
    }
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    
    if (gameKeys.includes(key)) {
        
        //Check whether the the value of key is in gamekeys for player1 or 2
        if (Object.values(player.controls).includes(key)) {
            const packet = {
                type: "INPUT",
                id: player.id,
                key: key,
                state: false
            };
            e.preventDefault();
            socket.send(JSON.stringify(packet));

        } else if (Object.values(player2.controls).includes(key)) {
            const packet = {
                type: "INPUT",
                id: player2.id,
                key: key,
                state: false
            };
            e.preventDefault();
            socket.send(JSON.stringify(packet));
        }
    }
});