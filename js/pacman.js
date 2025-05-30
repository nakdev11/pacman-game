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
    setDirection(dx, dy, maze) {
        // 無効な方向は無視
        if ((dx === 0 && dy === 0) || (dx !== 0 && dy !== 0)) {
            return;
        }
        
        // 現在の位置を計算
        const currentGridX = Math.round((this.pixelX - this.gridSize / 2) / this.gridSize);
        const currentGridY = Math.round((this.pixelY - this.gridSize / 2) / this.gridSize);
        
        // グリッド中央に近いかどうかを判定（閾値を緩和）
        const centerThreshold = 0.5;
        const isAtGridCenter = 
            Math.abs(this.pixelX - (currentGridX * this.gridSize + this.gridSize / 2)) < centerThreshold &&
            Math.abs(this.pixelY - (currentGridY * this.gridSize + this.gridSize / 2)) < centerThreshold;
        
        // 次の方向を設定
        this.nextDirection = { x: dx, y: dy };
        
        // 現在の位置がグリッド上にほぼある場合、または現在動いていない場合は即座に方向転換
        if (isAtGridCenter || (this.direction.x === 0 && this.direction.y === 0)) {
            // 移動先が有効な場合は即座に方向転換
            const nextX = currentGridX + dx;
            const nextY = currentGridY + dy;
            
            if (maze.isWalkable(nextX, nextY)) {
                this.direction = { x: dx, y: dy };
                this.x = currentGridX;
                this.y = currentGridY;
                this.targetX = nextX;
                this.targetY = nextY;
                
                // 位置を正確にグリッドに合わせる
                this.pixelX = this.x * this.gridSize + this.gridSize / 2;
                this.pixelY = this.y * this.gridSize + this.gridSize / 2;
                return true; // 方向転換が成功
            }
        }
        
        return false; // 方向転換が行われなかった
    }
    
    // パックマンの位置を更新
    update(maze) {
        // 現在のグリッド位置を計算
        const currentGridX = Math.round((this.pixelX - this.gridSize / 2) / this.gridSize);
        const currentGridY = Math.round((this.pixelY - this.gridSize / 2) / this.gridSize);
        
        // グリッドの中央に近づいたかどうかを判定（閾値を緩和）
        const centerThreshold = 0.1;
        const isAtGridCenter = 
            Math.abs(this.pixelX - (currentGridX * this.gridSize + this.gridSize / 2)) < centerThreshold &&
            Math.abs(this.pixelY - (currentGridY * this.gridSize + this.gridSize / 2)) < centerThreshold;
        
        if (isAtGridCenter) {
            this.x = currentGridX;
            this.y = currentGridY;
            
            // 現在の方向に移動可能かチェック
            if (this.direction.x !== 0 || this.direction.y !== 0) {
                const targetX = this.x + this.direction.x;
                const targetY = this.y + this.direction.y;
                
                if (!maze.isWalkable(targetX, targetY)) {
                    // 壁にぶつかったら移動を止める
                    this.direction = { x: 0, y: 0 };
                    this.nextDirection = { x: 0, y: 0 };
                    
                    // 次の方向があれば試みる
                    if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                        const nextX = this.x + this.nextDirection.x;
                        const nextY = this.y + this.nextDirection.y;
                        
                        if (maze.isWalkable(nextX, nextY)) {
                            this.direction = { ...this.nextDirection };
                            this.targetX = nextX;
                            this.targetY = nextY;
                        }
                    }
                } else {
                    // 現在の方向に進み続ける
                    this.targetX = targetX;
                    this.targetY = targetY;
                }
            } else if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                // 現在の方向がなく、次の方向がある場合は方向転換を試みる
                const nextX = this.x + this.nextDirection.x;
                const nextY = this.y + this.nextDirection.y;
                
                if (maze.isWalkable(nextX, nextY)) {
                    this.direction = { ...this.nextDirection };
                    this.targetX = nextX;
                    this.targetY = nextY;
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
