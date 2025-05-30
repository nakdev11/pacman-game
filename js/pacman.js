class Pacman {
    constructor(x, y, gridSize) {
        this.x = x;  // グリッドX座標
        this.y = y;  // グリッドY座標
        this.gridSize = gridSize;
        this.radius = gridSize / 2 - 2;
        this.speed = 0.3;  // 移動速度（ピクセル/フレーム）
        this.pixelX = x * gridSize + gridSize / 2;  // ピクセル単位のX座標
        this.pixelY = y * gridSize + gridSize / 2;  // ピクセル単位のY座標
        this.targetX = x;  // 目標のグリッドX座標
        this.targetY = y;  // 目標のグリッドY座標
        this.direction = { x: 0, y: 0 };  // 現在の移動方向
        this.nextDirection = { x: 0, y: 0 };  // 次の移動方向
        this.mouthAngle = 0.2;  // 口の開き具合
        this.mouthChange = 0.05; // 口の動きの速さ
        this.maxMouthAngle = 0.3; // 口の最大開き具合
    }

    
    // パックマンを初期位置にリセット
    reset() {
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.targetX = this.x;
        this.targetY = this.y;
        this.pixelX = this.x * this.gridSize + this.gridSize / 2;
        this.pixelY = this.y * this.gridSize + this.gridSize / 2;
    }
    
    // パックマンを描画
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#FFD700'; // 黄色
        
        // パックマンの位置に移動
        ctx.translate(this.pixelX, this.pixelY);
        
        // 向きに応じて回転
        let rotation = 0;
        if (this.direction.x === 1) rotation = 0; // 右
        else if (this.direction.x === -1) rotation = Math.PI; // 左
        else if (this.direction.y === -1) rotation = Math.PI * 1.5; // 上
        else if (this.direction.y === 1) rotation = Math.PI * 0.5; // 下
        
        ctx.rotate(rotation);
        
        // パックマンの口のアニメーション
        this.mouthAngle += this.mouthChange;
        if (this.mouthAngle > this.maxMouthAngle || this.mouthAngle < 0) {
            this.mouthChange *= -1;
        }
        
        // パックマンを描画
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, this.mouthAngle * Math.PI, -this.mouthAngle * Math.PI);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // キー入力に応じて移動方向を設定
    setDirection(dx, dy) {
        // 現在の移動方向と逆方向には移動できない
        if ((this.direction.x !== 0 && dx === -this.direction.x) || 
            (this.direction.y !== 0 && dy === -this.direction.y)) {
            return;
        }
        this.nextDirection = { x: dx, y: dy };
    }
    
    // パックマンの位置を更新
    update(maze) {
        // 現在のグリッド位置を計算
        const currentGridX = Math.round((this.pixelX - this.gridSize / 2) / this.gridSize);
        const currentGridY = Math.round((this.pixelY - this.gridSize / 2) / this.gridSize);
        
        // グリッドの中央に近づいたら方向転換を試みる
        const isAtGridCenter = 
            Math.abs(this.pixelX - (currentGridX * this.gridSize + this.gridSize / 2)) < 1 &&
            Math.abs(this.pixelY - (currentGridY * this.gridSize + this.gridSize / 2)) < 1;
        
        if (isAtGridCenter) {
            this.x = currentGridX;
            this.y = currentGridY;
            
            // 次の方向に移動可能な場合は方向を変更
            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                const nextX = this.x + this.nextDirection.x;
                const nextY = this.y + this.nextDirection.y;
                
                if (maze.isWalkable(nextX, nextY)) {
                    this.direction = { ...this.nextDirection };
                }
            }
            
            // 現在の方向に移動可能かチェック
            if (this.direction.x !== 0 || this.direction.y !== 0) {
                const targetX = this.x + this.direction.x;
                const targetY = this.y + this.direction.y;
                
                if (maze.isWalkable(targetX, targetY)) {
                    this.targetX = targetX;
                    this.targetY = targetY;
                } else {
                    // 壁にぶつかったら移動を止める
                    this.direction = { x: 0, y: 0 };
                }
            }
        }
        
        // 目標に向かって移動
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            const targetPixelX = this.targetX * this.gridSize + this.gridSize / 2;
            const targetPixelY = this.targetY * this.gridSize + this.gridSize / 2;
            
            const dx = targetPixelX - this.pixelX;
            const dy = targetPixelY - this.pixelY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.5) {
                // 目標に向かって移動
                const moveX = (dx / distance) * this.speed * this.gridSize;
                const moveY = (dy / distance) * this.speed * this.gridSize;
                
                this.pixelX += moveX;
                this.pixelY += moveY;
                
                // 目標を超えないように調整
                if ((this.direction.x > 0 && this.pixelX > targetPixelX) ||
                    (this.direction.x < 0 && this.pixelX < targetPixelX)) {
                    this.pixelX = targetPixelX;
                }
                if ((this.direction.y > 0 && this.pixelY > targetPixelY) ||
                    (this.direction.y < 0 && this.pixelY < targetPixelY)) {
                    this.pixelY = targetPixelY;
                }
            }
        }
    }
    
    // パックマンのグリッド位置を取得
    getGridPosition() {
        // 最も近いグリッド座標を返す
        const gridX = Math.round((this.pixelX - this.gridSize / 2) / this.gridSize);
        const gridY = Math.round((this.pixelY - this.gridSize / 2) / this.gridSize);
        return { x: gridX, y: gridY };
    }
}
