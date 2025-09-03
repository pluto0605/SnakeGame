document.addEventListener('DOMContentLoaded', () => {
    try {
    // 获取DOM元素
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // 游戏配置
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 7;
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // 蛇的初始位置和速度
    let snake = [
        { x: 10, y: 10 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // 颜色配置
    const colors = {
        background: '#ffffff',
        snake: '#2ecc71',
        snakeHead: '#27ae60',
        food: '#e74c3c',
        grid: '#f0f0f0',
        obstacle: '#7f8c8d'
    };
    
    // 障碍物数组
    let obstacles = [];
    
    // 食物位置
    let food = generateFood();
    
    // 游戏循环
    function gameLoop() {
        if (gameOver) return;
        if (gamePaused) return;
        
        setTimeout(() => {
            clearCanvas();
            drawGrid();
            moveSnake();
            drawFood();
            drawObstacles();
            drawSnake();
            checkCollision();
            
            if (gameRunning && !gameOver) {
                requestAnimationFrame(gameLoop);
            }
        }, 1000 / speed);
    }
    
    // 清空画布
    function clearCanvas() {
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 绘制网格
    function drawGrid() {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= tileCount; i++) {
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            // 水平线
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    // 移动蛇
    function moveSnake() {
        // 创建新的蛇头
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 生成新的食物
            food = generateFood();
            
            // 增加速度
            if (score % 50 === 0) {
                speed += 0.5;
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
    }
    
    // 绘制蛇
    function drawSnake() {
        snake.forEach((segment, index) => {
            // 蛇头使用不同颜色
            ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snake;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // 添加边框
            ctx.strokeStyle = '#219653';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }
    
    // 生成食物
    function generateFood() {
        let newFood;
        let invalidPosition;
        
        do {
            invalidPosition = false;
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // 确保食物不会生成在蛇身上
            for (let segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    invalidPosition = true;
                    break;
                }
            }
            
            // 确保食物不会生成在障碍物上
            if (!invalidPosition) {
                for (let obstacle of obstacles) {
                    if (obstacle.x === newFood.x && obstacle.y === newFood.y) {
                        invalidPosition = true;
                        break;
                    }
                }
            }
        } while (invalidPosition);
        
        return newFood;
    }
    
    // 绘制食物
    function drawFood() {
        ctx.fillStyle = colors.food;
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            endGame();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }
        
        // 检查是否撞到障碍物
        for (let obstacle of obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                endGame();
                return;
            }
        }
    }
    
    // 游戏结束
    function endGame() {
        gameOver = true;
        gameRunning = false;
        
        // 显示游戏结束信息
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('按"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // 开始游戏
    function startGame() {
        if (!gameRunning && !gamePaused) {
            resetGame();
            gameRunning = true;
            gameLoop();
        } else if (gamePaused) {
            gamePaused = false;
            gameLoop();
        }
    }
    
    // 暂停游戏
    function pauseGame() {
        if (gameRunning && !gameOver) {
            gamePaused = !gamePaused;
            if (!gamePaused) {
                gameLoop();
            }
        }
    }
    
    // 绘制障碍物
    function drawObstacles() {
        ctx.fillStyle = colors.obstacle;
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 1;
            ctx.strokeRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
        });
    }
    
    // 生成障碍物
    function generateObstacles(count) {
        obstacles = [];
        let attempts = 0;
        const maxAttempts = 100;
        
        while (obstacles.length < count && attempts < maxAttempts) {
            attempts++;
            const obstacle = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // 确保障碍物不会生成在蛇身上、食物上或其他障碍物上
            let validPosition = true;
            
            // 检查是否与蛇重叠
            for (let segment of snake) {
                if (segment.x === obstacle.x && segment.y === obstacle.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // 检查是否与食物重叠
            if (validPosition && food.x === obstacle.x && food.y === obstacle.y) {
                validPosition = false;
            }
            
            // 检查是否与其他障碍物重叠
            if (validPosition) {
                for (let existingObstacle of obstacles) {
                    if (existingObstacle.x === obstacle.x && existingObstacle.y === obstacle.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // 确保障碍物不会生成在蛇头周围的安全区域
            const safeDistance = 3;
            if (validPosition) {
                const headX = snake[0].x;
                const headY = snake[0].y;
                if (Math.abs(obstacle.x - headX) < safeDistance && Math.abs(obstacle.y - headY) < safeDistance) {
                    validPosition = false;
                }
            }
            
            if (validPosition) {
                obstacles.push(obstacle);
            }
        }
    }
    
    // 重置游戏
    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        velocityX = 0;
        velocityY = 0;
        food = generateFood();
        score = 0;
        scoreElement.textContent = score;
        speed = 7;
        gameOver = false;
        gamePaused = false;
        
        // 根据难度生成障碍物
        const obstacleCount = Math.floor(tileCount * 0.1); // 约10%的格子有障碍物
        generateObstacles(obstacleCount);
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        // 防止反方向移动
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (velocityY !== 1) {
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (velocityY !== -1) {
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (velocityX !== 1) {
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (velocityX !== -1) {
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
            case ' ':
                pauseGame();
                break;
        }
    });
    
    // 按钮事件监听
    startBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('开始游戏按钮被点击');
        startGame();
    });
    
    pauseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('暂停按钮被点击');
        pauseGame();
    });
    
    restartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('重新开始按钮被点击');
        resetGame();
        gameRunning = true;
        gameLoop();
    });
    
    // 初始化游戏
    clearCanvas();
    drawGrid();
    drawSnake();
    drawFood();
    // 先初始化障碍物数组，再生成障碍物
    obstacles = [];
    generateObstacles(Math.floor(tileCount * 0.1));
    drawObstacles();
    
    console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化出错:', error);
        // 显示友好的错误信息，但不跳转到错误页面
        alert('游戏加载出现问题，请刷新页面重试');
    }
});