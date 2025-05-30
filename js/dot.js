class Dot {
    constructor(x, y, gridSize) {
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;
        this.radius = gridSize / 8;  // ドットの半径
        this.collected = false;      // 取得済みフラグ
    }


    // ドットを描画
    draw(ctx) {
        if (!this.collected) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                this.x * this.gridSize + this.gridSize / 2,  // マスの中央に配置
                this.y * this.gridSize + this.gridSize / 2,
                this.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }


    // ドットを取得
    collect() {
        if (!this.collected) {
            this.collected = true;
            return 1;  // スコア加算値
        }
        return 0;
    }
}
