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
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const obstacleSlider = document.getElementById('obstacle-slider');
    const obstacleValue = document.getElementById('obstacle-value');
    
    // 游戏配置
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 7;
    let baseSpeed = 7; // 基础速度，由滑块控制
    let obstacleCount = 8; // 障碍物数量，由滑块控制
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // 蛇的初始位置和速度
    let snake = [
        { x: 10, y: 10 },  // 蛇头
        { x: 9, y: 10 }    // 蛇身
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // 颜色配置
    const colors = {
        background: '#ffffff',
        snake: '#e74c3c',        // 红色蛇身
        snakeHead: '#c0392b',    // 深红色蛇头
        food: '#f1c40f',        // 黄色食物
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
        // 如果蛇还没有开始移动，不进行移动
        if (velocityX === 0 && velocityY === 0) {
            return;
        }
        
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
            
            // 增加速度（基于基础速度）
            if (score % 50 === 0) {
                speed = baseSpeed + (score / 50) * 0.5;
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
    }
    
    // 绘制蛇
    function drawSnake() {
        snake.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            
            if (index === 0) {
                // 绘制蛇头 - 卡通化设计
                ctx.fillStyle = colors.snakeHead;
                
                // 绘制圆角矩形蛇头
                ctx.beginPath();
                const radius = 8;
                ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, radius);
                ctx.fill();
                
                // 添加蛇头边框
                ctx.strokeStyle = '#a93226';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制眼睛
                ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                // 根据移动方向调整眼睛位置
                let eyeX1, eyeY1, eyeX2, eyeY2;
                if (velocityX === 1) { // 向右
                    eyeX1 = x + gridSize - eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY2 = y + gridSize - eyeOffset;
                } else if (velocityX === -1) { // 向左
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + eyeOffset;
                    eyeY2 = y + gridSize - eyeOffset;
                } else if (velocityY === -1) { // 向上
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY2 = y + eyeOffset;
                } else { // 向下或初始状态
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + gridSize - eyeOffset;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY2 = y + gridSize - eyeOffset;
                }
                
                // 绘制白色眼球
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, 2 * Math.PI);
                ctx.fill();
                
                // 绘制黑色瞳孔
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                
            } else {
                // 绘制蛇身 - 卡通化设计
                ctx.fillStyle = colors.snake;
                
                // 绘制圆角矩形蛇身
                ctx.beginPath();
                const radius = 6;
                ctx.roundRect(x + 3, y + 3, gridSize - 6, gridSize - 6, radius);
                ctx.fill();
                
                // 添加蛇身边框
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // 添加蛇身纹理
                ctx.fillStyle = '#d35400';
                ctx.beginPath();
                ctx.arc(x + gridSize/2, y + gridSize/2, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
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
        snake = [
            { x: 10, y: 10 },  // 蛇头
            { x: 9, y: 10 }    // 蛇身
        ];
        velocityX = 0;
        velocityY = 0;
        food = generateFood();
        score = 0;
        scoreElement.textContent = score;
        speed = baseSpeed; // 使用基础速度
        gameOver = false;
        gamePaused = false;
        
        // 根据滑块设置生成障碍物
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
    
    // 速度滑块事件监听
    speedSlider.addEventListener('input', function(e) {
        baseSpeed = parseInt(e.target.value);
        speed = baseSpeed;
        speedValue.textContent = baseSpeed;
        console.log('游戏速度设置为:', baseSpeed);
    });
    
    // 障碍物数量滑块事件监听
    obstacleSlider.addEventListener('input', function(e) {
        obstacleCount = parseInt(e.target.value);
        obstacleValue.textContent = obstacleCount;
        console.log('障碍物数量设置为:', obstacleCount);
        
        // 如果游戏未运行，立即更新障碍物
        if (!gameRunning) {
            generateObstacles(obstacleCount);
            clearCanvas();
            drawGrid();
            drawSnake();
            drawFood();
            drawObstacles();
        }
    });
    
    // 初始化游戏
    clearCanvas();
    drawGrid();
    drawSnake();
    drawFood();
    // 先初始化障碍物数组，再生成障碍物
    obstacles = [];
    generateObstacles(obstacleCount);
    drawObstacles();
    
    console.log('游戏初始化完成');
    } catch (error) {
        console.error('游戏初始化出错:', error);
        // 显示友好的错误信息，但不跳转到错误页面
        alert('游戏加载出现问题，请刷新页面重试');
    }
});