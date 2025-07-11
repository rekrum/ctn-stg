const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// アスペクト比（横 / 縦） = 2:3
const ASPECT_RATIO = 2 / 3;

// キャンバスリサイズ
function resizeCanvas() {
  const height = window.innerHeight;
  const width = height * ASPECT_RATIO;
  canvas.width = width;
  canvas.height = height;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// リソース読み込み
const playerImg = new Image();
playerImg.src = "cottonyo_face.png";
const redCanImg = new Image();
redCanImg.src = "透過ラオ.png";
const curryImg = new Image();
curryImg.src = "food_curry-rice_7142.png";

const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.2;
const se_hit = new Audio("hit.mp3");
se_hit.volume = 0.2;

// BGM ON/OFF & 音量スライダー（常に操作可能）
document.getElementById("bgmToggle").addEventListener("change", e => {
  bgm.muted = !e.target.checked;
});
document.getElementById("volumeControl").addEventListener("input", e => {
  const vol = parseFloat(e.target.value);
  bgm.volume = vol;
  se_hit.volume = vol;
});

// タップ時BGM再生
function tryPlayBGM() {
  bgm.play().catch(() => {});
}

// プレイヤー初期化
let playerSize = canvas.width * 0.15;
let player = {
  x: canvas.width / 2 - playerSize / 2,
  y: canvas.height * 0.85,
  width: playerSize,
  height: playerSize,
  speed: canvas.width * 0.01
};

let bullets = [];
let score = 0;
let keys = {};
let gameOver = false;
let difficulty = 1;
let isTouching = false;
let touchX = 0;

// 操作イベント
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
canvas.addEventListener("touchstart", e => {
  isTouching = true;
  touchX = e.touches[0].clientX;
  tryPlayBGM();
});
canvas.addEventListener("touchmove", e => {
  touchX = e.touches[0].clientX;
});
canvas.addEventListener("touchend", () => isTouching = false);

// 弾生成
function spawnBullet() {
  const bulletSize = canvas.width * 0.08;
  for (let i = 0; i < difficulty; i++) {
    const img = Math.random() < 0.5 ? redCanImg : curryImg;
    bullets.push({
      x: Math.random() * (canvas.width - bulletSize),
      y: -bulletSize,
      width: bulletSize,
      height: bulletSize,
      speed: canvas.height * (0.004 + Math.random() * 0.003),
      img: img
    });
  }
}

// ゲーム更新
function update() {
  if (gameOver) return;

  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  if (isTouching) {
    const rect = canvas.getBoundingClientRect();
    const targetX = touchX - rect.left;
    if (targetX < player.x) player.x -= player.speed;
    else if (targetX > player.x + player.width) player.x += player.speed;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  bullets.forEach(b => b.y += b.speed);
  bullets = bullets.filter(b => b.y < canvas.height);

  // 当たり判定（80% ヒットボックス）
  const hitboxScale = 0.8;
  const hitboxW = player.width * hitboxScale;
  const hitboxH = player.height * hitboxScale;
  const hitboxX = player.x + (player.width - hitboxW) / 2;
  const hitboxY = player.y + (player.height - hitboxH) / 2;

  for (let b of bullets) {
    if (
      b.x < hitboxX + hitboxW &&
      b.x + b.width > hitboxX &&
      b.y < hitboxY + hitboxH &&
      b.y + b.height > hitboxY
    ) {
      gameOver = true;
      se_hit.play();
      document.getElementById("finalScoreText").textContent = "スコア: " + score;
      document.getElementById("gameOverScreen").style.display = "flex";
    }
  }

  score += 1;
  if (score % 300 === 0) difficulty += 1;
}

// 描画
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  bullets.forEach(b => ctx.drawImage(b.img, b.x, b.y, b.width, b.height));
  ctx.fillStyle = "black";
  ctx.font = Math.floor(canvas.height * 0.04) + "px Arial";
  ctx.fillText("スコア: " + score, 10, 30);
}

// ループ
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ゲーム開始
function startGame() {
  document.getElementById("startScreen").style.display = "none";
  tryPlayBGM();
  setInterval(spawnBullet, 700);
  gameLoop();
}
