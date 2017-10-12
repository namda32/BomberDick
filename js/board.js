
function Board(width, height, level_number) {

    // Board dimensions
    this.width = width;
    this.height = height;

    // Load white and blue blocks of the specified level
    this.level = level[level_number];

    // All powers
    this.powerups = {
        1: "fire",
        2: "skate",
        3: "geta",
        4: "bomb"
    }

    // Create 2D array that will store generated power-ups (same dimensions as board of blocks)
    this.board_powerups = create_2D_array(height, width);

    // Randomly distribute power-ups across board
    this.load_power_ups();

}

// Generate power-ups under 1/5th of the white blocks only
Board.prototype.load_power_ups = function() {
    for (var i = 0; i < this.height; i++)
        for (var j = 0; j < this.width; j++)
            if (Math.floor(Math.random()*5) == 0 && this.level[i][j] == 1)
                this.board_powerups[i][j] = Math.floor(Math.random()*4)+1;
            else
                this.board_powerups[i][j] = 0;
}
