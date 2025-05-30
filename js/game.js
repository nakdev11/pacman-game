// ゲームの状態を管理するクラス
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 30; // 1マスのサイズ（ピクセル）
        
        // ゲームオブジェクトの初期化
        this.maze = new Maze();
        // パックマンの初期位置（グリッドの中央）
        const startX = 1;  // 左端から2マス目
        const startY = 1;  // 上端から2マス目
        this.pacman = new Pacman(startX, startY, this.maze.gridSize);
        this.dots = [];
        this.score = 0;
        this.gameOver = false;
        
        // ゲームの初期化
        this.init();
    }
    
    // ゲームの初期化
    init() {
        // パックマンの初期位置を設定（迷路の空きスペースに合わせる）
        this.pacman.x = 1;
        this.pacman.y = 1;
        this.pacman.pixelX = this.pacman.x * this.gridSize + this.gridSize / 2;
        this.pacman.pixelY = this.pacman.y * this.gridSize + this.gridSize / 2;
        this.pacman.targetX = this.pacman.x;
        this.pacman.targetY = this.pacman.y;
        this.pacman.direction = { x: 0, y: 0 };
        this.pacman.nextDirection = { x: 0, y: 0 };
        
        // ドットの生成
        this.createDots();
        
        // キーボードイベントの設定
        this.setupEventListeners();
        
        // ゲームループの開始
        this.lastTime = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    // ドットを生成
    createDots() {
        // 壁のない場所にドットを配置
        for (let y = 0; y < this.maze.rows; y++) {
            for (let x = 0; x < this.maze.cols; x++) {
                // 壁の位置にはドットを配置しない
                if (!this.maze.isWall(x, y)) {
                    // 迷路の外周から1マス内側のみにドットを配置
                    if (x > 0 && x < this.maze.cols - 1 && y > 0 && y < this.maze.rows - 1) {
                        this.dots.push(new Dot(x, y, this.maze.gridSize));
                    }
                }
            }
        }
    }
    
    // キーボード入力のハンドラ
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
                this.pacman.setDirection(0, -1);
                break;
            case 'ArrowDown':
                this.pacman.setDirection(0, 1);
                break;
            case 'ArrowLeft':
                this.pacman.setDirection(-1, 0);
                break;
            case 'ArrowRight':
                this.pacman.setDirection(1, 0);
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
        }
    }

    handleKeyUp() {
        // キーを離したときの処理（必要に応じて実装）
    }

    // キーボード入力とタッチコントロールの設定
    setupEventListeners() {
        // キーボード入力
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // タッチコントロール
        const setupButton = (id, dx, dy) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const start = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.pacman.nextDirection = { x: dx, y: dy };
                this.pacman.direction = { x: dx, y: dy };
            };
            
            const end = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.pacman.nextDirection.x === dx && this.pacman.nextDirection.y === dy) {
                    this.pacman.nextDirection = { x: 0, y: 0 };
                }
                if (this.pacman.direction.x === dx && this.pacman.direction.y === dy) {
                    this.pacman.direction = { x: 0, y: 0 };
                }
            };
            
            // タッチイベント
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('touchcancel', end, { passive: false });
            
            // マウスイベント（タッチデバイスでも発火する場合があるため）
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };
        
        // 各ボタンの設定
        setupButton('up', 0, -1);
        setupButton('down', 0, 1);
        setupButton('left', -1, 0);
        setupButton('right', 1, 0);
        
        // 画面全体のタッチを無効化（スクロール防止）
        document.addEventListener('touchmove', (e) => {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // ゲームループ
    gameLoop(timestamp) {
        // 前回のフレームからの経過時間を計算
        const deltaTime = timestamp - (this.lastTime || 0);
        this.lastTime = timestamp;
        
        // ゲームの更新
        this.update(deltaTime);
        
        // 描画
        this.render();
        
        // ゲームオーバーでなければ次のフレームをリクエスト
        if (!this.gameOver) {
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }
    
    // ゲームの状態を更新
    update(deltaTime) {
        // パックマンの更新
        this.pacman.update(this.maze);
        
        // ドットとの衝突判定
        this.checkDotCollision();
        
        // ゲームクリアチェック
        this.checkGameClear();
    }
    
    // ドットとの衝突判定
    checkDotCollision() {
        const pacmanPos = this.pacman.getGridPosition();
        
        this.dots.forEach(dot => {
            if (!dot.collected) {
                // パックマンの現在のグリッド位置とドットの位置を比較
                const dx = dot.x * this.gridSize + this.gridSize / 2 - this.pacman.pixelX;
                const dy = dot.y * this.gridSize + this.gridSize / 2 - this.pacman.pixelY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // パックマンがドットに十分近づいたら取得
                if (distance < this.gridSize * 0.7) {
                    this.score += dot.collect();
                    document.getElementById('score').textContent = this.score;
                }
            }
        });
    }
    
    // ゲームクリアのチェック
    checkGameClear() {
        const remainingDots = this.dots.filter(dot => !dot.collected).length;
        if (remainingDots === 0) {
            this.gameOver = true;
            alert('ゲームクリア！ スコア: ' + this.score);
        }
    }
    
    // 描画処理
    render() {
        // 画面をクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 迷路を描画
        this.maze.draw(this.ctx);
        
        // ドットを描画
        this.dots.forEach(dot => dot.draw(this.ctx));
        
        // パックマンを描画
        this.pacman.draw(this.ctx);
    }
    
    // ゲームをリセット
    reset() {
        this.pacman.reset();
        this.dots = [];
        this.createDots();
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.gameOver = false;
        this.lastTime = 0;
        if (!this.gameOver) {
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }
}

// ゲームの開始
window.onload = () => {
    const game = new Game();
}
