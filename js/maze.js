class Maze {
    constructor() {
        this.gridSize = 30; // 1マスのサイズ（ピクセル）
        this.rows = 20;    // 行数（20x20のグリッド）
        this.cols = 20;    // 列数
        this.walls = [];   // 壁の位置を格納する配列
        this.initializeMaze();
    }


    // 迷路の初期化
    initializeMaze() {
        // 設計書に基づく20x20マスの迷路（#が壁、.が通路）
        const mazeLayout = [
            '####################',  // 0
            '#..................#',  // 1
            '#.#.#.#............#',  // 2
            '#.#.#.#............#',  // 3
            '#.....#............#',  // 4
            '#....#.............#',  // 5
            '#...#..............#',  // 6
            '#......#...........#',  // 7
            '#.....#............#',  // 8
            '#....#....#........#',  // 9
            '#...#######........#',  // 10
            '#.............#.#..#',  // 11
            '#..........#.......#',  // 12
            '#........#####.....#',  // 13
            '#..........#.......#',  // 14
            '#........#####.....#',  // 15
            '#..........#.......#',  // 16
            '#..........#.......#',  // 17
            '#..................#',  // 18
            '####################'   // 19
        ];

        // 壁の位置を設定
        for (let y = 0; y < mazeLayout.length; y++) {
            for (let x = 0; x < mazeLayout[y].length; x++) {
                if (mazeLayout[y][x] === '#') {
                    this.walls.push({ x, y });
                }
            }
        }
    }

    // 壁の描画
    draw(ctx) {
        ctx.fillStyle = '#1a75ff';
        this.walls.forEach(wall => {
            ctx.fillRect(
                wall.x * this.gridSize,
                wall.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        });
    }


    // 指定された位置が壁かどうかを判定
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }


    // 指定された位置が迷路の範囲内かどうかを判定
    isInBounds(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }


    // 指定された位置が移動可能かどうかを判定
    isWalkable(x, y) {
        return this.isInBounds(x, y) && !this.isWall(x, y);
    }
}
