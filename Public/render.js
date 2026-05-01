const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    }



    
function draw() {
        
        ctx.fillStyle = Theme.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

//calculates the position of camera respective to the map
        cameraX = player1.px * Theme.sizes.tile - canvas.width / 2;
        cameraY = player1.py * Theme.sizes.tile - canvas.height / 2;

//it helps calculate the startcols and endcols for the map to draw what we view only
        let startcols = Math.max(0,Math.floor(cameraX/Theme.sizes.tile));
        let endcols = Math.min(cols,startcols + Math.ceil(canvas.width/Theme.sizes.tile) +1);

        let startrows = Math.max(0, Math.floor(cameraY/Theme.sizes.tile));
        let endrows = Math.min(rows, startrows + Math.ceil(canvas.height/Theme.sizes.tile) +1);

// to draw the only seeing part of the window
        for (let y = startrows; y < endrows; y++) {

            for (let x = startcols; x < endcols; x++) {

                const tileType = map[y][x];
                switch (tileType) {
                    case GRASS: 
                        ctx.fillStyle = Theme.colors.grass; 
                        break;
                    case WATER: 
                        ctx.fillStyle = Theme.colors.water; 
                        break;
                    case SOIL:  
                        ctx.fillStyle = Theme.colors.soil;  
                        break;
                    default:   
                        ctx.fillStyle = "#FF0000";          
                        break;
                }

                ctx.fillRect(
                    Math.floor( x * Theme.sizes.tile - cameraX),
                    Math.floor(y * Theme.sizes.tile - cameraY),
                    Math.ceil(Theme.sizes.tile),
                    Math.ceil(Theme.sizes.tile)
                );
            }
        }

        //to travel through all the entities
        for(let i = 0; i < entities.length; i++){
            let crnEnt = entities[i];

            ctx.fillStyle = crnEnt.color;

            ctx.fillRect(
                crnEnt.px*Theme.sizes.tile - cameraX,
                crnEnt.py*Theme.sizes.tile - cameraY,
                Theme.sizes.tile,
                Theme.sizes.tile
            );
        }


ctx.fillStyle = "white"; // Or use Theme.colors.player1
ctx.font = "20px Arial";

// Draw Player 1's score on the top left
ctx.fillText("P1 Score: " + player1.score, 20, 30);

// Draw Player 2's score on the top right
// (Assuming your canvas is something like 800px wide, adjust the X coordinate if needed)
ctx.fillText("P2 Score: " + player2.score, 600, 30);
}

    
