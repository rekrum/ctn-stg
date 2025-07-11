const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 画像読み込み
const playerImg = new Image();
playerImg.src = "cottonyo_face.png";
const redCanImg = new Image();
redCanImg.src = "透過ラオ.png";
const curryImg = new Image();
curryImg.src = "food_curry-rice_7142.png";

// 音声ファイル
const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.2; // 初期音量 20%
const se_hit = new Audio("hit.mp3");
se_hit.volume = 0.2;

// 音量・ON/OFFスイッチ連動
document.getElementById("bgmToggle").addEventListener("change", e => {
  bgm.muted = !e.target.checked;
});
document.getElementById("volumeControl").addEventListener("input", e => {
  const vol = parseFloat(e.target.value);
  bgm.volume = vol;
  se_hit.volume = vol;
});

// プレイヤー状態
let player = { x: 200, y: 520, width: 64, height: 64, speed: 5 };

// ゲーム状態
let bullets = [];
let score = 0;
let keys = {};
let gameOver = false;
let difficulty = 1;
let isTouching = false;
let touchX = 0;

// キーボード操作
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// タッチ操作（スマホ）
canvas.addEventListener("touchstart", e => {
  isTouching = true;
  touchX = e.touches[0].clientX;
  bgm.play(); // スマホで音を出すには操作後でないと再生できないため
});
canvas.addEventListener("touchmove", e => {
  touchX = e.touches[0].clientX;
});
canvas.addEventListener("touchend", () => {
  isTouching = false;
});

// 弾を生成
function spawnBullet() {
  for (let i = 0; i < difficulty; i++) {
    const img = Math.random() < 0.5 ? redCanImg : curryImg;
    bullets.push({
      x: Math.random() * (canvas.width - 32),
      y: -32,
      width: 32,
      height: 32,
      speed: 2 + Math.random() * 2,
      img: img
    });
  }
}

// 状態更新
function update() {
  if (gameOver) return;

  // プレイヤー移動（キーボード）
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // タッチ移動（スマホ）
  if (isTouching) {
    let rect = canvas.getBoundingClientRect();
    let targetX = touchX - rect.left;
    if (targetX < player.x) player.x -= player.speed;
    else if (targetX > player.x + player.width) player.x += player.speed;
  }

  // 画面外に出ないよう制限
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // 弾の移動
  bullets.forEach(b => b.y += b.speed);
  bullets = bullets.filter(b => b.y < canvas.height);

  // 当たり判定（プレイヤーを80%縮小）
  const hitboxScale = 0.8;
  const hitboxWidth = player.width * hitboxScale;
  const hitboxHeight = player.height * hitboxScale;
  const hitboxX = player.x + (player.width - hitboxWidth) / 2;
  const hitboxY = player.y + (player.height - hitboxHeight) / 2;

  for (let b of bullets) {
    if (b.x < hitboxX + hitboxWidth &&
        b.x + b.width > hitboxX &&
        b.y < hitboxY + hitboxHeight &&
        b.y + b.height > hitboxY) {
      gameOver = true;
      se_hit.play();
      document.getElementById("finalScoreText").textContent = "スコア: " + score;
      document.getElementById("gameOverScreen").style.display = "flex";
    }
  }

  // スコア加算
  score += 1;

  // 一定スコアごとに難易度上昇
  if (score % 300 === 0) difficulty += 1;
}

// 描画
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  bullets.forEach(b => ctx.drawImage(b.img, b.x, b.y, b.width, b.height));

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("スコア: " + score, 10, 30);
}

// ゲームループ
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// スタートボタンから呼ばれる関数
function startGame() {
  document.getElementById("startScreen").style.display = "none";
  bgm.play();
  setInterval(spawnBullet, 700);
  gameLoop();
}
