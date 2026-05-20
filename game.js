const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const statusEl = document.getElementById('status');
const startButton = document.getElementById('startButton');

const game = {
  width: canvas.width,
  height: canvas.height,
  player: { x: 300, y: 340, width: 80, height: 16, speed: 6 },
  obstacles: [],
  score: 0,
  lives: 3,
  speedMultiplier: 1,
  lastSpawn: 0,
  running: false,
  timestamp: 0,
};

const keys = { left: false, right: false };

function resetGame() {
  game.player.x = (game.width - game.player.width) / 2;
  game.obstacles = [];
  game.score = 0;
  game.lives = 3;
  game.speedMultiplier = 1;
  game.lastSpawn = 0;
  game.running = false;
  game.timestamp = 0;
  updateUI();
  statusEl.textContent = 'Use ← / → or A / D to move.';
  drawScene();
}

function updateUI() {
  scoreEl.textContent = game.score;
  livesEl.textContent = game.lives;
}

function addObstacle() {
  const size = 24 + Math.random() * 28;
  const x = Math.random() * (game.width - size);
  const speed = 2.5 + Math.random() * 2.4 + game.speedMultiplier;
  game.obstacles.push({ x, y: -size, size, speed });
}

function drawPlayer() {
  ctx.fillStyle = '#6cf9ff';
  ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
  ctx.strokeStyle = '#b0f9ff';
  ctx.strokeRect(game.player.x, game.player.y, game.player.width, game.player.height);
}

function drawObstacle(obstacle) {
  ctx.fillStyle = '#ff5f7a';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
  gradient.addColorStop(0, '#0b1636');
  gradient.addColorStop(1, '#14254f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);
}

function drawScene() {
  drawBackground();
  drawPlayer();
  game.obstacles.forEach(drawObstacle);
}

function collide(player, obstacle) {
  return !(
    player.x + player.width < obstacle.x ||
    player.x > obstacle.x + obstacle.size ||
    player.y + player.height < obstacle.y ||
    player.y > obstacle.y + obstacle.size
  );
}

function update(delta) {
  if (!game.running) return;

  const movement = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  game.player.x += movement * game.player.speed;
  game.player.x = Math.max(0, Math.min(game.width - game.player.width, game.player.x));

  game.lastSpawn += delta;
  if (game.lastSpawn > 700) {
    addObstacle();
    game.lastSpawn = 0;
  }

  game.obstacles.forEach(obstacle => {
    obstacle.y += obstacle.speed;
  });

  game.obstacles = game.obstacles.filter(obstacle => {
    if (obstacle.y > game.height) {
      game.score += 5;
      return false;
    }
    return true;
  });

  if (game.timestamp > 10000) {
    game.speedMultiplier = 1 + Math.floor(game.timestamp / 10000) * 0.25;
  }

  for (const obstacle of game.obstacles) {
    if (collide(game.player, obstacle)) {
      game.lives -= 1;
      game.obstacles = game.obstacles.filter(item => item !== obstacle);
      statusEl.textContent = 'Hit! Keep dodging.';
      if (game.lives <= 0) {
        game.running = false;
        statusEl.textContent = 'Game Over! Press Start to play again.';
        startButton.textContent = 'Restart';
        break;
      }
    }
  }

  game.score += Math.floor(delta * 0.025);
  game.timestamp += delta;
  updateUI();
}

function gameLoop(time) {
  if (!game.running) {
    drawScene();
    return;
  }

  const delta = time - (game.lastFrameTime || time);
  game.lastFrameTime = time;

  update(delta);
  drawScene();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  resetGame();
  game.running = true;
  startButton.textContent = 'Restart';
  statusEl.textContent = 'Dodge the blocks!';
  game.lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = true;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    keys.left = false;
  }
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    keys.right = false;
  }
});

startButton.addEventListener('click', () => {
  if (!game.running) {
    startGame();
  } else {
    resetGame();
    startGame();
  }
});

resetGame();
