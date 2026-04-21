
console.log("Map initialized:", map);
    function canMove(x, y){
        return (map[y][x] !== WATER && map[y][x] !== SOIL) 
    }


function updatePlayer(p){

    let newX = p.px;
    let newY = p.py;
    let dirX = 0;
    let dirY = 0;

     // 2. Identify the Enemy
let target;
if (p.id === "player1") {
    target = player2;
} else {
    target = player; // This is Player 1
}

    if (keys[p.controls.up]) dirY -= p.speed;
    if (keys[p.controls.down]) dirY += p.speed;
    if (keys[p.controls.left]) dirX -= p.speed;
    if (keys[p.controls.right]) dirX += p.speed;

    if(dirX !== 0 || dirY !== 0){
            p.lastDirX = dirX;
            p.lastDirY = dirY;
    }

    newX += dirX;
    newY += dirY;


// 1. Create the Ghost Box
const ghost = {
    px: newX,
    py: newY,
    width: p.width,
    height: p.height
};


// to check for the exact coordinate on the map
    let gridX =  Math.floor(newX);
    let gridY = Math.floor(newY);

    if (
        gridY >= 0 && gridY < rows &&
        gridX >= 0 && gridX < cols &&
        canMove(gridX, gridY) &&
        !checkAABB(ghost, target)
        ){
            p.px = newX;
            p.py = newY;
        }

//creates a bullet and pushes in to entity and checks if bullet is not in cooldown
    if(keys[p.controls.shoot] && p.currentCdown === 0){
            entities.push(createBullet(p.px, p.py, p.lastDirX, p.lastDirY, p.id));
            p.currentCdown = p.fireRate;
        }

//to slow down the pushing of bullet and current cool down 
    if(p.currentCdown > 0 ){
            p.currentCdown--;
        }
    }

    function checkAABB(boxA, boxB){
        if(boxA.px < boxB.px+boxB.width &&
            boxA.px + boxA.width > boxB.px &&
            boxA.py < boxB.py+ boxB.height &&
            boxA.py + boxA.height > boxB.py
        ){
            return true;
        }
        else{
            return false;
        }
    }


// physics for bullet
    function updateBullets(){
        for(let i = 0; i < entities.length; i++){
            let crnent = entities[i];
            if(crnent.isbullet){
                crnent.px += crnent.speedX; 
                crnent.py += crnent.speedY;
            }if (crnent.owner === "player1" && checkAABB(crnent, player2)) {
    player.score++;       // Give Player 1 a point!
    crnent.dead = true;   // Kill the bullet
} 
else if (crnent.owner === "player2" && checkAABB(crnent, player)) {
    player2.score++;      // Give Player 2 a point!
    crnent.dead = true;   // Kill the bullet
}
        }
    }
