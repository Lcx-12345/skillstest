const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

const CONFIG = {
    GRID_SIZE: 20,
    GRID_COLS: 20,
    GRID_ROWS: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 10,
    MIN_SPEED: 50,
    FOODS_PER_LEVEL: 5,
    INITIAL_SNAKE_LENGTH: 3
};

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    playTone(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.enabled || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playEat() {
        this.playTone(880, 0.1, 'square', 0.15);
        setTimeout(() => this.playTone(1100, 0.1, 'square', 0.12), 50);
    }

    playGameOver() {
        this.playTone(200, 0.3, 'sawtooth', 0.15);
        setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.12), 150);
    }

    playClick() {
        this.playTone(600, 0.05, 'square', 0.1);
    }

    playLevelUp() {
        this.playTone(523, 0.1, 'square', 0.15);
        setTimeout(() => this.playTone(659, 0.1, 'square', 0.15), 100);
        setTimeout(() => this.playTone(784, 0.15, 'square', 0.15), 200);
    }
}

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundManager();
        
        this.state = GameState.MENU;
        this.snake = [];
        this.food = null;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.level = 1;
        this.highScore = this.loadHighScore();
        this.speed = CONFIG.INITIAL_SPEED;
        this.foodsEaten = 0;
        
        this.lastTime = 0;
        this.accumulator = 0;
        this.animationFrame = null;
        
        this.particles = [];
        this.foodPulse = 0;
        
        this.initElements();
        this.bindEvents();
        this.updateHighScoreDisplay();
    }

    initElements() {
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.pauseOverlay = document.getElementById('pause-overlay');
        
        this.scoreEl = document.getElementById('score');
        this.levelEl = document.getElementById('level');
        this.highScoreEl = document.getElementById('high-score');
        this.menuHighScoreEl = document.getElementById('menu-high-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalLevelEl = document.getElementById('final-level');
        this.finalHighScoreEl = document.getElementById('final-high-score');
        this.newRecordEl = document.getElementById('new-record');
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.goToMenu());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('back-menu-btn').addEventListener('click', () => this.goToMenu());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (this.state !== GameState.PLAYING) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30) this.setDirection(1, 0);
                else if (dx < -30) this.setDirection(-1, 0);
            } else {
                if (dy > 30) this.setDirection(0, 1);
                else if (dy < -30) this.setDirection(0, -1);
            }
        });
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
                this.togglePause();
            }
            return;
        }
        
        if (this.state !== GameState.PLAYING) return;
        
        switch (key) {
            case 'arrowup':
            case 'w':
                e.preventDefault();
                this.setDirection(0, -1);
                break;
            case 'arrowdown':
            case 's':
                e.preventDefault();
                this.setDirection(0, 1);
                break;
            case 'arrowleft':
            case 'a':
                e.preventDefault();
                this.setDirection(-1, 0);
                break;
            case 'arrowright':
            case 'd':
                e.preventDefault();
                this.setDirection(1, 0);
                break;
        }
    }

    setDirection(x, y) {
        if (this.direction.x + x === 0 && this.direction.y + y === 0) return;
        this.nextDirection = { x, y };
    }

    showScreen(screen) {
        [this.menuScreen, this.gameScreen, this.gameoverScreen].forEach(s => {
            s.classList.remove('active');
        });
        
        if (screen === GameState.MENU) this.menuScreen.classList.add('active');
        else if (screen === GameState.PLAYING || screen === GameState.PAUSED) {
            this.gameScreen.classList.add('active');
        } else if (screen === GameState.GAME_OVER) this.gameoverScreen.classList.add('active');
    }

    startGame() {
        this.sound.init();
        this.sound.playClick();
        
        this.resetGame();
        this.state = GameState.PLAYING;
        this.showScreen(GameState.PLAYING);
        this.pauseOverlay.classList.add('hidden');
        
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.gameLoop();
    }

    resetGame() {
        this.snake = [];
        const startX = Math.floor(CONFIG.GRID_COLS / 2);
        const startY = Math.floor(CONFIG.GRID_ROWS / 2);
        
        for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
            this.snake.push({ x: startX - i, y: startY });
        }
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.level = 1;
        this.speed = CONFIG.INITIAL_SPEED;
        this.foodsEaten = 0;
        this.particles = [];
        
        this.spawnFood();
        this.updateUI();
    }

    restartGame() {
        this.sound.playClick();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.startGame();
    }

    goToMenu() {
        this.sound.playClick();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.state = GameState.MENU;
        this.showScreen(GameState.MENU);
        this.updateHighScoreDisplay();
    }

    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.pauseOverlay.classList.remove('hidden');
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.pauseOverlay.classList.add('hidden');
            this.lastTime = performance.now();
            this.gameLoop();
        }
        this.sound.playClick();
    }

    spawnFood() {
        let newFood;
        let attempts = 0;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * CONFIG.GRID_COLS),
                y: Math.floor(Math.random() * CONFIG.GRID_ROWS)
            };
            attempts++;
        } while (this.isSnakeAt(newFood.x, newFood.y) && attempts < 100);
        
        this.food = newFood;
    }

    isSnakeAt(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    gameLoop(currentTime = 0) {
        if (this.state !== GameState.PLAYING) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.speed) {
            this.update();
            this.accumulator -= this.speed;
        }
        
        this.foodPulse += deltaTime * 0.005;
        this.updateParticles(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update() {
        this.direction = { ...this.nextDirection };
        
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        if (this.checkCollision(newHead)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(newHead);
        
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        if (head.x < 0 || head.x >= CONFIG.GRID_COLS || head.y < 0 || head.y >= CONFIG.GRID_ROWS) {
            return true;
        }
        
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }

    eatFood() {
        this.score += 10 * this.level;
        this.foodsEaten++;
        
        this.spawnEatParticles(this.food.x, this.food.y);
        this.sound.playEat();
        
        if (this.foodsEaten >= CONFIG.FOODS_PER_LEVEL) {
            this.levelUp();
        }
        
        this.spawnFood();
        this.updateUI();
    }

    levelUp() {
        this.level++;
        this.foodsEaten = 0;
        this.speed = Math.max(CONFIG.MIN_SPEED, this.speed - CONFIG.SPEED_INCREMENT);
        this.sound.playLevelUp();
    }

    spawnEatParticles(gridX, gridY) {
        const x = gridX * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        const y = gridY * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1,
                color: '#ff00ff'
            });
        }
    }

    updateParticles(deltaTime) {
        const decay = deltaTime * 0.002;
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= decay;
            return p.life > 0;
        });
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        this.sound.playGameOver();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.finalScoreEl.textContent = this.score;
        this.finalLevelEl.textContent = this.level;
        this.finalHighScoreEl.textContent = this.highScore;
        
        if (isNewRecord) {
            this.newRecordEl.classList.remove('hidden');
        } else {
            this.newRecordEl.classList.add('hidden');
        }
        
        this.showScreen(GameState.GAME_OVER);
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.levelEl.textContent = this.level;
        this.highScoreEl.textContent = this.highScore;
    }

    updateHighScoreDisplay() {
        this.highScore = this.loadHighScore();
        this.menuHighScoreEl.textContent = this.highScore;
        if (this.highScoreEl) {
            this.highScoreEl.textContent = this.highScore;
        }
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('neonSnakeHighScore') || '0', 10);
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('neonSnakeHighScore', this.highScore.toString());
        } catch (e) {}
    }

    render() {
        const ctx = this.ctx;
        const size = CONFIG.GRID_SIZE;
        
        ctx.fillStyle = '#05050a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
        this.drawParticles();
    }

    drawGrid() {
        const ctx = this.ctx;
        const size = CONFIG.GRID_SIZE;
        
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= CONFIG.GRID_COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * size, 0);
            ctx.lineTo(x * size, CONFIG.GRID_ROWS * size);
            ctx.stroke();
        }
        
        for (let y = 0; y <= CONFIG.GRID_ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * size);
            ctx.lineTo(CONFIG.GRID_COLS * size, y * size);
            ctx.stroke();
        }
    }

    drawFood() {
        if (!this.food) return;
        
        const ctx = this.ctx;
        const size = CONFIG.GRID_SIZE;
        const x = this.food.x * size + size / 2;
        const y = this.food.y * size + size / 2;
        
        const pulse = Math.sin(this.foodPulse) * 0.2 + 1;
        const radius = (size / 2 - 2) * pulse;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawSnake() {
        const ctx = this.ctx;
        const size = CONFIG.GRID_SIZE;
        
        for (let i = this.snake.length - 1; i >= 0; i--) {
            const segment = this.snake[i];
            const x = segment.x * size;
            const y = segment.y * size;
            
            const progress = i / Math.max(this.snake.length - 1, 1);
            
            let r, g, b;
            if (i === 0) {
                r = 57; g = 255; b = 20;
            } else {
                const t = progress;
                r = Math.floor(57 + (0 - 57) * t);
                g = Math.floor(255 + (255 - 255) * t);
                b = Math.floor(20 + (255 - 20) * t);
            }
            
            const color = `rgb(${r}, ${g}, ${b})`;
            
            const padding = 1;
            const segSize = size - padding * 2;
            const radius = 3;
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = i === 0 ? 15 : 8;
            
            this.roundRect(ctx, x + padding, y + padding, segSize, segSize, radius);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            if (i === 0) {
                this.drawEyes(x, y, size);
            }
        }
    }

    drawEyes(x, y, size) {
        const ctx = this.ctx;
        const eyeSize = 3;
        const eyeOffset = 5;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (this.direction.x === 1) {
            eye1X = x + size - eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + size - eyeOffset;
            eye2Y = y + size - eyeOffset;
        } else if (this.direction.x === -1) {
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + eyeOffset;
            eye2Y = y + size - eyeOffset;
        } else if (this.direction.y === -1) {
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + size - eyeOffset;
            eye2Y = y + eyeOffset;
        } else {
            eye1X = x + eyeOffset;
            eye1Y = y + size - eyeOffset;
            eye2X = x + size - eyeOffset;
            eye2Y = y + size - eyeOffset;
        }
        
        ctx.fillStyle = '#05050a';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
