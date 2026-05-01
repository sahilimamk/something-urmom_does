
function canMove(x, y, map) {
    return (map[y][x] !== WATER && map[y][x] !== SOIL);
}

// SHARED — works on both client and server
function applyMovement(p, dirX, dirY, target, map, rows, cols) {

    let newX = p.px;
    let newY = p.py;


    if (dirX !== 0 || dirY !== 0) {
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
    let gridX = Math.floor(newX);
    let gridY = Math.floor(newY);

    // When map is null (server-side), skip tile/bounds checks
    let tileOk = true;
    if (map && rows != null && cols != null) {
        tileOk = gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols && canMove(gridX, gridY, map);
    }

    if (tileOk && !checkAABB(ghost, target)) {
        p.px = newX;
        p.py = newY;
    }


    // to slow down the pushing of bullet and current cool down 

}

// CLIENT ONLY — reads keyboard, calls shared function
function handleClientInput(p, keys, target, map, rows, cols) {
    let dirX = 0, dirY = 0;
    if (keys[p.controls.up]) dirY -= p.speed;
    if (keys[p.controls.down]) dirY += p.speed;
    if (keys[p.controls.left]) dirX -= p.speed;
    if (keys[p.controls.right]) dirX += p.speed;

    applyMovement(p, dirX, dirY, target, map, rows, cols);
}


function createBullet(startX, startY, dirX, dirY, ownerID){
        return {
            width: 1,
            height: 1,
            px: startX,
            py: startY,
            isbullet: true,
            speedX: 1.5 * dirX,
            speedY: 1.5 * dirY,
            owner: ownerID,
            life: 120
        };
}

function checkAABB(boxA, boxB) {
    if (
        boxA.px < boxB.px + boxB.width &&
        boxA.px + boxA.width > boxB.px &&
        boxA.py < boxB.py + boxB.height &&
        boxA.py + boxA.height > boxB.py
    ) {
        return true;
    } else {
        return false;
    }
}

// physics for bullet
function updateBullets(bullets, player1, player2){
        for (let i = 0; i < bullets.length; i++) {
        let crnent = bullets[i];
    
            crnent.px += crnent.speedX;
            crnent.py += crnent.speedY;

            crnent.life --;
        
        if (crnent.life <= 0) {
            crnent.dead = true;
        }

        if (crnent.owner === "player1" && checkAABB(crnent, player2)) {
            player1.score++;       // Give Player 1 a point!
            crnent.dead = true;    // Kill the bullet
        } else if (crnent.owner === "player2" && checkAABB(crnent, player1)) {
            player2.score++;      // Give Player 2 a point!
            crnent.dead = true;   // Kill the bullet
        }
    }
}

if(typeof module !== "undefined"){
    module.exports = {
        checkAABB, 
        createBullet, applyMovement, updateBullets, canMove}
}