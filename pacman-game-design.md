# パックマン風ゲーム 設計書

## 1. 概要
シンプルなパックマン風のゲームをWebブラウザ上で実装します。
PCとスマートフォンの両方に対応しており、キーボードまたはタッチ操作でプレイできます。

## 2. ゲームの仕様

### 2.1 ゲーム画面
- キャンバスサイズ: 600x600ピクセル
- グリッドサイズ: 20x20マス（1マス=30x30ピクセル）
- レスポンシブ対応: スマートフォンでもプレイ可能

### 2.2 ゲーム要素

#### 2.2.1 パックマン
- 黄色い円形のキャラクター
- キーボードの矢印キー（↑↓←→）または画面のタッチコントロールで移動
- 滑らかな移動（グリッド単位ではなくピクセル単位での移動）
- 移動方向に応じて向きが変わる

#### 2.2.2 迷路
- 壁は青色（#1a75ff）の四角形で表現
- パックマンは壁を通り抜けられない
- 固定の迷路レイアウトを実装
  ```
  ####################
  #..................#
  #.#.#.#............#
  #.#.#.#............#
  #.....#............#
  #....#.............#
  #...#..............#
  #......#...........#
  #.....#............#
  #....#....#........#
  #...#######........#
  #.............#.#..#
  #..........#.......#
  #........#####.....#
  #..........#.......#
  #........#####.....#
  #..........#.......#
  #..........#.......#
  #..................#
  ####################
  ```

#### 2.2.3 ドット
- 白い小さな円形（グリッドの中央に配置）
- 半径: グリッドサイズの1/8
- パックマンが近づくと取得される
- 1つ取得するごとに1点加算
- 取得済みのドットは表示されない

### 2.3 ゲームの流れ
1. ゲーム開始時に迷路とドット、パックマンを配置
2. プレイヤーは矢印キーまたはタッチコントロールでパックマンを操作
3. パックマンがドットに近づくとドットが消え、スコアが加算
4. すべてのドットを取得するとゲームクリア
5. Rキーでいつでもゲームをリセット可能

## 3. 技術仕様

### 3.1 使用技術
- HTML5 Canvas: ゲーム画面の描画
- JavaScript (ES6+): ゲームロジック
- CSS3: レスポンシブデザインとスタイリング

### 3.2 ファイル構成
```
pacman-game/
├── index.html          # ゲームのメインHTML
├── css/
│   └── style.css      # スタイルシート（レスポンシブ対応）
└── js/
    ├── game.js        # ゲームのメインロジック（Gameクラス）
    ├── maze.js        # 迷路クラス（Mazeクラス）
    ├── dot.js         # ドットクラス（Dotクラス）
    └── pacman.js      # パックマンクラス（Pacmanクラス）
```

### 3.3 クラス設計

#### 3.3.1 Game クラス
- ゲーム全体の状態管理
- ゲームループの実行（60FPSを目標）
- キーボード入力とタッチコントロールの処理
- スコア管理
- ゲームの初期化とリセット機能
- 当たり判定（パックマンとドット）

#### 3.3.2 Pacman クラス
- 位置情報（グリッド単位とピクセル単位の両方）
- 現在の移動方向と次の移動方向の管理
- 壁との衝突判定
- 滑らかな移動のための補間処理
- 画面端から反対側への移動（必要に応じて）

#### 3.3.3 Maze クラス
- 迷路データの管理（壁の位置）
- 壁の描画
- 移動可能判定（isWalkableメソッド）
- グリッドベースの位置判定（isInBoundsメソッド）
- 壁の存在判定（isWallメソッド）

#### 3.3.4 Dot クラス
- ドットの位置（グリッド単位）
- 取得状態の管理（collectedプロパティ）
- ドットの描画
- 取得処理（collectメソッド）

## 4. 実装の詳細

### 4.1 パックマンの移動システム
- グリッドベースの移動とピクセル単位の滑らかな移動を組み合わせた実装
- 移動方向のキューイング（nextDirection）によるスムーズな方向転換
- 壁衝突時の処理と方向転換の最適化

### 4.2 当たり判定
- パックマンとドットの距離ベースの判定
- グリッドベースの壁との衝突判定
- 効率的な衝突検出のための空間分割（必要に応じて）

### 4.3 レスポンシブデザイン
- スマートフォン向けのタッチコントロール（方向キーボタン）
- 画面サイズに応じたキャンバスのスケーリング
- タッチ操作の最適化（タッチフィードバック、誤操作防止）

## 5. 今後の拡張案

- ゴーストの追加（敵キャラクター）
- パワーエサの実装（一時的にゴーストを食べられる）
- 複数のステージの実装
- サウンドエフェクトの追加
- ハイスコアの保存（localStorageを使用）
- スタート画面とゲームオーバー画面の追加
- アニメーション効果の強化（パックマンの口パクなど）
- アクセシビリティ対応（キーボード操作のカスタマイズなど）
