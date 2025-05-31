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
        // 現在押されているキーに応じて方向を設定
        switch (e.key) {
            case 'ArrowUp':
                this.pacman.setDirection(0, -1, this.maze);
                break;
            case 'ArrowDown':
                this.pacman.setDirection(0, 1, this.maze);
                break;
            case 'ArrowLeft':
                this.pacman.setDirection(-1, 0, this.maze);
                break;
            case 'ArrowRight':
                this.pacman.setDirection(1, 0, this.maze);
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
        }
    }

    handleKeyUp(e) {
        // キーを離しても移動を継続するため、キーを離したときの処理は行わない
        // ただし、Rキーは例外として処理
        if (e.key.toLowerCase() === 'r') {
            return;
        }
        // キーを離しても方向転換は行わない
    }

    // キーボード入力とタッチコントロールの設定
    setupEventListeners() {
        // キーボード入力
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 現在の方向を追跡
        this.currentDirection = { x: 0, y: 0 };
        this.activeButtons = new Set();
        
        // タッチコントロール
        /**
         * 指定されたIDを持つボタンをタッチコントロールとして設定
         * @param {string} id - ボタンのID
         * @param {number} dx - 方向のx成分
         * @param {number} dy - 方向のy成分
         */
        const setupButton = (id, dx, dy) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const start = (e) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                e.stopPropagation();
                
                // ボタンをアクティブに追加
                this.activeButtons.add(id);
                
                // 方向を設定
                this.currentDirection = { x: dx, y: dy };
                this.pacman.setDirection(dx, dy, this.maze);
                
                // 即座に反映させるためにゲームループをトリガー
                if (!this._animationFrameId) {
                    this._animationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
                }
            };
            
            const end = (e) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                e.stopPropagation();
                
                // ボタンを非アクティブに
                this.activeButtons.delete(id);
                
                // このボタンが最後のアクティブなボタンの場合のみ停止
                if (this.activeButtons.size === 0) {
                    this.currentDirection = { x: 0, y: 0 };
                    this.pacman.direction = { x: 0, y: 0 };
                    this.pacman.nextDirection = { x: 0, y: 0 };
                } else {
                    // 他のボタンがアクティブな場合は、その方向を設定
                    const lastButtonId = Array.from(this.activeButtons).pop();
                    const lastButton = document.getElementById(lastButtonId);
                    if (lastButton) {
                        lastButton.dispatchEvent(new Event('touchstart'));
                    }
                }
            };
            
            // タッチイベント
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            
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
        // 前回のフレームからの経過時間を計算（ミリ秒を秒に変換）
        const deltaTime = (timestamp - (this.lastTime || timestamp)) / 1000;
        this.lastTime = timestamp;
        
        // フレームレートを制御（60FPSを目標）
        const fps = 60;
        const frameTime = 1 / fps;
        
        // 前回の更新から十分な時間が経過していたら更新
        if (deltaTime > 0) {
            // ゲームの更新（経過時間を渡す）
            this.update(Math.min(deltaTime, 0.1)); // 最大100msに制限
            
            // 描画（常にスムーズに）
            this.render();
        }
        
        // ゲームオーバーでなければ次のフレームをリクエスト
        if (!this.gameOver) {
            this._animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
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
