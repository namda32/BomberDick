// Canvas
var context;
var WIDTH;
var HEIGHT;

// Board
var board;
var block_size = 40;

// Array of players
var player = [];

// Sprites
var dick_bomberman;
var black_bomberman;
var red_bomberman;
var blue_bomberman;
var bomb_sprite;
var explosion_sprite;

init();
main();

// Initialize everything
function init() {
    // Get a reference to the canvas and indicate that we'll be working in 2D
    var canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    // Get canvas dimensions
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    // Black borders (default)
    context.strokeStyle = "black";

    // For some reason, the canvas dimensions differ by one pixel when zooming in or out
    if (WIDTH != 600)
        WIDTH = 600;
    if (HEIGHT != 600)
        HEIGHT = 600;

    // Disable smoothness for pixelated effect
    context.webkitImageSmoothingEnabled = false;

    // Load level map
    board = new Board(15, 15, 1);

    // Load sprites
    dick_bomberman = new Image();
    black_bomberman = new Image();
    red_bomberman = new Image();
    blue_bomberman = new Image();
    bomb_sprite = new Image();
    explosion_sprite = new Image();
    powerups_sprite = new Image();

    dick_bomberman.src = 'assets/sprites/dick_bomberman.gif';
    black_bomberman.src = 'assets/sprites/black_bomberman.gif';
    red_bomberman.src = 'assets/sprites/red_bomberman.gif';
    blue_bomberman.src = 'assets/sprites/blue_bomberman.gif';
    bomb_sprite.src = 'assets/sprites/bombs.gif';
    explosion_sprite.src = 'assets/sprites/explosion.gif';
    powerups_sprite.src = 'assets/sprites/power-ups.gif';

    // Initialize players
    player[0] = new Player(dick_bomberman, "Clement", 0, block_size, block_size);
    player[1] = new Player(black_bomberman, "Freddy", 1, WIDTH-2*block_size, block_size);
    player[2] = new Player(red_bomberman, "Fredo", 2, block_size, HEIGHT-2*block_size);
    player[3] = new Player(blue_bomberman, "Freda", 3, WIDTH-2*block_size, HEIGHT-2*block_size);

    input();
}

// Game loop
function main() {
    requestAnimationFrame(main);
    update();
    draw();
}

// Handle input
function input() {
    document.addEventListener('keydown', function(event) {
            switch(event.keyCode) {
                case 37:    // left
                    player[0].left = true;
                    break;
                case 38:    // up
                    player[0].up = true;
                    break;
                case 39:    // right
                    player[0].right = true;
                    break;
                case 40:    // down
                    player[0].down = true;
                    break;
                case 32:    // space
                    if (player[0].bombs.length < player[0].bomb_limit)
                        player[0].release_bomb = true;
                    break;
                default:
                    break;
            }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.keyCode) {
            case 37:    // left
                player[0].left = false;
                player[0].frame["left"] = 0;
                break;
            case 38:    // up
                player[0].up = false;
                player[0].frame["up"] = 0;
                break;
            case 39:    // right
                player[0].right = false;
                player[0].frame["right"] = 12;
                break;
            case 40:    // down
                player[0].down = false;
                player[0].frame["down"] = 0;
                break;
            default:
                break;
        }
    });

}

// Update game state
function update() {
    for (var i = 0; i < player.length; i++) {

        // Remove exploded bombs (which can happen even when the player is dead)
        if (typeof(player[i].bombs[0]) != "undefined" && player[i].bombs[0].extinguished)
            player[i].bombs.shift();

        // Update bomb state (which can happen even when the player is dead)
        for (var j = 0; j < player[i].bombs.length; j++)
            player[i].bombs[j].update();

        if (player[i].alive) {

            // Update player position and sprite animation
            player[i].move();

            // Check if player is stepping on a power-up and have him pick it up
            var board_x = bitmap_position(player[i].x + player[i].sprite_width/2);
            var board_y = bitmap_position(player[i].y + player[i].sprite_height/2);
            var power_up = board.board_powerups[board_y][board_x];
            if (power_up != 0) {
                board.board_powerups[board_y][board_x] = 0;
                player[i].add_power_up(power_up);
            }

            // Release new bombs
            if (player[i].release_bomb) {

                // Bombs are placed on board tiles according to the position of the center of the player
                var x_bomb = pixel_position(bitmap_position(player[i].x + player[i].sprite_width/2));
                var y_bomb = pixel_position(bitmap_position(player[i].y + player[i].sprite_height/2));

                // Add bomb to the player's set of "released bombs"
                player[i].bombs.push(new Bomb(bomb_sprite,
                            explosion_sprite,
                            x_bomb,
                            y_bomb,
                            player[i].bomb_radius));

                player[i].release_bomb = false;
            }

        }
    }
}

function draw() {

    // Clear screen (erase everything)
    context.clearRect(0, 0, WIDTH, HEIGHT);

    // Fill background with pitch black
    context.fillStyle = "rgba(0, 0, 0, 1)";
    draw_block(0, 0, WIDTH, HEIGHT);

    // Draw power_ups
    for (var i = 0; i < board.height; i++)
        for (var j = 0; j < board.width; j++) {
            var powerup = board.board_powerups[i][j];
            if (powerup != 0 && board.level[i][j] == 0) {
                var sprite = fetch_sprite(board.powerups[powerup]);
                context.drawImage(powerups_sprite, sprite[0], sprite[1], sprite[2], sprite[3], pixel_position(j), pixel_position(i), sprite[2]*(block_size/sprite[3]), block_size);
            }
        }

    // Draw blocks
    for (var i = 0; i < 15; i++)
        for (var j = 0; j < 15; j++)
            if (board.level[j][i] == 1) {
                context.fillStyle = "rgba(255, 255, 255, 1)";
                draw_block(pixel_position(i), pixel_position(j), block_size, block_size);
            }
            else if (board.level[j][i] == 2) {
                context.fillStyle = "rgba(214, 228, 240, 1)";
                draw_block(pixel_position(i), pixel_position(j), block_size, block_size);
            }

    // Draw bombs
    for (var i = 0; i < player.length; i++)
        for (var j = 0; j < player[i].bombs.length; j++)
            player[i].bombs[j].draw();


    // Draw players
    for (var i = 0; i < player.length; i++)
        if (player[i].alive == true)
            player[i].draw();

}
