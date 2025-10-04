document.addEventListener('DOMContentLoaded', () => {
    // 獲取畫布和上下文
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    
    // 遊戲設置
    const gridSize = 20; // 網格大小
    const tileCount = canvas.width / gridSize; // 網格數量
    let snake = []; // 蛇身體
    let food = {}; // 食物
    let dx = gridSize; // X方向移動
    let dy = 0; // Y方向移動
    let score = 0; // 分數
    let highScore = localStorage.getItem('snakeHighScore') || 0; // 最高分
    let gameInterval; // 遊戲循環
    let gameSpeed = 250; // 遊戲速度（毫秒）- 值越大移動越慢
    let isPaused = false; // 是否暫停
    let isGameOver = false; // 是否遊戲結束
    let isGameStarted = false; // 是否開始遊戲
    
    // 按鈕元素
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // 分數元素
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    
    // 初始化遊戲
    function initGame() {
        // 初始化蛇
        snake = [
            {x: 5 * gridSize, y: 10 * gridSize},
            {x: 4 * gridSize, y: 10 * gridSize},
            {x: 3 * gridSize, y: 10 * gridSize}
        ];
        
        // 初始化方向
        dx = gridSize;
        dy = 0;
        
        // 初始化分數
        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        
        // 生成食物
        generateFood();
        
        // 重置遊戲狀態
        isGameOver = false;
        isPaused = false;
        
        // 繪製初始畫面
        drawGame();
    }
    
    // 生成食物
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount) * gridSize,
            y: Math.floor(Math.random() * tileCount) * gridSize
        };
        
        // 確保食物不會生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (food.x === snake[i].x && food.y === snake[i].y) {
                generateFood();
                break;
            }
        }
    }
    
    // 繪製方格背景
    function drawGrid() {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // 繪製垂直線
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 繪製水平線
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // 繪製遊戲
    function drawGame() {
        // 清空畫布
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 繪製方格背景
        drawGrid();
        
        // 繪製食物
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        
        // 繪製蛇
        for (let i = 0; i < snake.length; i++) {
            // 蛇頭和身體使用不同顏色
            if (i === 0) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
            
            // 繪製蛇身體的邊框
            ctx.strokeStyle = '#222';
            ctx.strokeRect(snake[i].x, snake[i].y, gridSize, gridSize);
        }
        
        // 如果遊戲結束，顯示遊戲結束文字
        if (isGameOver) {
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('遊戲結束', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('按重新開始按鈕再玩一次', canvas.width / 2, canvas.height / 2 + 30);
        }
        
        // 如果遊戲暫停，顯示暫停文字
        if (isPaused && !isGameOver) {
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('遊戲暫停', canvas.width / 2, canvas.height / 2);
        }
    }
    
    // 更新遊戲
    function updateGame() {
        if (isGameOver || isPaused) return;
        
        // 移動蛇
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        // 檢查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分數
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 生成新食物
            generateFood();
            
            // 增加遊戲速度
            if (gameSpeed > 50) {
                gameSpeed -= 5;
                clearInterval(gameInterval);
                gameInterval = setInterval(updateGame, gameSpeed);
            }
        } else {
            // 如果沒吃到食物，移除尾部
            snake.pop();
        }
        
        // 檢查碰撞
        checkCollision();
        
        // 繪製遊戲
        drawGame();
    }
    
    // 檢查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 檢查是否撞到牆
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }
        
        // 檢查是否撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // 遊戲結束
    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        drawGame();
    }
    
    // 開始遊戲
    function startGame() {
        if (!isGameStarted) {
            initGame();
            gameInterval = setInterval(updateGame, gameSpeed);
            isGameStarted = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            restartBtn.disabled = false;
        }
    }
    
    // 暫停遊戲
    function pauseGame() {
        if (isGameStarted && !isGameOver) {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? '繼續' : '暫停';
            drawGame();
        }
    }
    
    // 重新開始遊戲
    function restartGame() {
        clearInterval(gameInterval);
        initGame();
        gameSpeed = 250;
        isGameStarted = true;
        gameInterval = setInterval(updateGame, gameSpeed);
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = '暫停';
    }
    
    // 按鈕事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    
    // 鍵盤控制
    document.addEventListener('keydown', (e) => {
        // 如果遊戲結束或暫停，不處理按鍵
        if (isGameOver || isPaused) return;
        
        // 根據按鍵改變方向
        switch (e.key) {
            case 'ArrowUp':
                // 防止直接反向移動
                if (dy === 0) {
                    dx = 0;
                    dy = -gridSize;
                }
                break;
            case 'ArrowDown':
                if (dy === 0) {
                    dx = 0;
                    dy = gridSize;
                }
                break;
            case 'ArrowLeft':
                if (dx === 0) {
                    dx = -gridSize;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
                if (dx === 0) {
                    dx = gridSize;
                    dy = 0;
                }
                break;
        }
    });
    
    // 初始化按鈕狀態
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
    
    // 初始化遊戲
    initGame();
});