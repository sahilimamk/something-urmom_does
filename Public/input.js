const gameKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright","w", "a", "s", "d", " "]

window.addEventListener("resize", (e) =>{
        resize();
        draw();
    });


window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if(gameKeys.includes(key)){
        if(Object.values(player.controls).includes(key)){

    const packet = {
        type: "INPUT",
        id: player.id,
        key: key,
        state:true
    }


    e.preventDefault();
    socket.send(JSON.stringify(packet));  
    }
    else if(Object.values(player2.controls).includes(key)){

    const packet = {
        type: "INPUT",
        id: player2.id,
        key: key,
        state:true
    }

});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if(gameKeys.includes(key)){
    const packet = {
        type: "INPUT",
        id: "player1",
        key: key,
        state: false
    }
    e.preventDefault();
    socket.send(JSON.stringify(packet));
}    
});