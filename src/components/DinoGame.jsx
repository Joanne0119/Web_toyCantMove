import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- 遊戲常數 ---
const GAME_SPEED = 5;         // 遊戲移動速度
const JUMP_FORCE = 17;        // 跳躍力道
const GRAVITY = 0.8;          // 重力
const OBSTACLE_INTERVAL_MIN = 900;  // 障礙物出現最小間隔 (毫秒)
const OBSTACLE_INTERVAL_MAX = 2200; // 障礙物出現最大間隔 (毫秒)
const PLAYER_BOTTOM_POS = 10; // 玩家距離地上的高度

const DinoGame = () => {
    // --- React 狀態 ---
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // --- DOM 元素 Refs ---
    const gameAreaRef = useRef(null);
    const playerRef = useRef(null);

    // --- 遊戲狀態 Refs (用來在 game loop 中更新，不會觸發 re-render) ---
    const playerY = useRef(PLAYER_BOTTOM_POS); // 玩家 Y 軸位置
    const playerVel = useRef(0);         // 玩家 Y 軸速度
    const obstacles = useRef([]);        // 儲存障礙物 { element: DOMNode, x: number }
    const gameLoopRef = useRef(null);      // 儲存 requestAnimationFrame 的 ID
    const obstacleTimerRef = useRef(0);    // 障礙物計時器
    const scoreRef = useRef(0);          // 用於 game loop 內的即時分數

    // --- 遊戲邏輯函數 ---

    // 建立一個障礙物
    const createObstacle = () => {
        if (!gameAreaRef.current) return;
        
        const obstacleEl = document.createElement('div');
        // --- 障礙物樣式 (你可以換成 🌵) ---
        obstacleEl.style.position = 'absolute';
        obstacleEl.style.bottom = `${PLAYER_BOTTOM_POS}px`; // 跟玩家在同一條線上
        obstacleEl.style.width = '20px';
        obstacleEl.style.height = '40px';
        obstacleEl.style.backgroundColor = 'green';
        obstacleEl.style.fontSize = '28px'; // 讓 emoji 變大
        obstacleEl.textContent = '🌵';
        // --------------------------------

        const gameAreaWidth = gameAreaRef.current.clientWidth;
        const x = gameAreaWidth; // 從最右邊開始
        obstacleEl.style.transform = `translateX(${x}px)`;

        gameAreaRef.current.appendChild(obstacleEl);
        obstacles.current.push({ element: obstacleEl, x: x, scored: false });
    };

    // 遊戲主循環 (Game Loop)
    const gameLoop = useCallback(() => {
        if (!playerRef.current) return;

        // 1. 更新玩家 
        playerVel.current -= GRAVITY;
        playerY.current += playerVel.current;
        if (playerY.current < PLAYER_BOTTOM_POS) {
            playerY.current = PLAYER_BOTTOM_POS;
            playerVel.current = 0;
        }
        playerRef.current.style.transform = `translateY(${-playerY.current + PLAYER_BOTTOM_POS}px)`;

        // 2. 更新障礙物
        const playerRect = playerRef.current.getBoundingClientRect();
        
        for (let i = obstacles.current.length - 1; i >= 0; i--) {
            const ob = obstacles.current[i];
            ob.x -= GAME_SPEED;
            ob.element.style.transform = `translateX(${ob.x}px)`;

            // 碰撞偵測
            const obRect = ob.element.getBoundingClientRect();
            if (
                playerRect.left < obRect.right &&
                playerRect.right > obRect.left &&
                playerRect.top < obRect.bottom &&
                playerRect.bottom > obRect.top
            ) {
                // --- 遊戲結束 ---
                setIsGameOver(true);
                setIsRunning(false);

                // [!!] 使用函式更新來避免 stale closure
                setHighScore(prevHighScore => Math.max(prevHighScore, scoreRef.current));
                
                cancelAnimationFrame(gameLoopRef.current);
                return;
            }

            // 計分 (保持不變)
            if (!ob.scored && ob.x < playerRect.left) {
                ob.scored = true;
                scoreRef.current += 10;
                setScore(scoreRef.current);
            }

            // 移除螢幕外的障礙物 (保持不變)
            if (ob.x < -30) {
                ob.element.remove();
                obstacles.current.splice(i, 1);
            }
        }

        // 3. 產生新的障礙物 (保持不變)
        obstacleTimerRef.current -= 16;
        if (obstacleTimerRef.current <= 0) {
            createObstacle();
            obstacleTimerRef.current = Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN;
        }

        // 4. 請求下一幀 (保持不變)
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        
    }, []);

    // 處理跳躍
    const handleJump = useCallback(() => {
        if (playerY.current === PLAYER_BOTTOM_POS) { // 只能在地上時跳躍
            playerVel.current = JUMP_FORCE;
        }
    }, []);

    // 開始/重新開始遊戲
    const startGame = useCallback(() => {
        // 重設所有狀態
        setIsGameOver(false);
        setScore(0);
        scoreRef.current = 0;
        playerY.current = PLAYER_BOTTOM_POS;
        playerVel.current = 0;
        
        // 清除舊的障礙物
        obstacles.current.forEach(ob => ob.element.remove());
        obstacles.current = [];
        
        obstacleTimerRef.current = OBSTACLE_INTERVAL_MIN; // 讓第一個障礙物快點出現
        
        setIsRunning(true);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    // --- 設定事件監聽 ---
    useEffect(() => {
        const onJump = (e) => {
            e.preventDefault();
            if (isRunning) {
                handleJump();
            } else {
                // 如果遊戲沒在跑 (結束或未開始)，任何點擊都等於開始遊戲
                startGame();
            }
        };
        
        const onKeyDown = (e) => {
            if (e.code === 'Space') {
                onJump(e);
            }
        };

        const gameAreaNode = gameAreaRef.current;
        if (gameAreaNode) {
            // 'mousedown' 用於電腦點擊
            gameAreaNode.addEventListener('mousedown', onJump);
            // 'touchstart' 用於手機觸控
            gameAreaNode.addEventListener('touchstart', onJump);
            document.addEventListener('keydown', onKeyDown);
        }

        // 清理函數
        return () => {
            if (gameAreaNode) {
                gameAreaNode.removeEventListener('mousedown', onJump);
                gameAreaNode.removeEventListener('touchstart', onJump);
            }
            document.removeEventListener('keydown', onKeyDown);
            // 當組件卸載時，停止 game loop
            cancelAnimationFrame(gameLoopRef.current);
        };
    }, [isRunning, handleJump, startGame]);

    // --- 內聯樣式 ---
    const gameAreaStyle = {
        position: 'relative',
        width: '100%',
        height: '200px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none', // 防止選取
        WebkitUserSelect: 'none',
        touchAction: 'manipulation' // 避免觸控延遲
    };

    const playerStyle = {
        position: 'absolute',
        bottom: `${PLAYER_BOTTOM_POS}px`, // 讓玩家在地上
        left: '20px',
        width: '40px',
        height: '40px',
        fontSize: '32px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
    };

    const groundStyle = {
        position: 'absolute',
        bottom: `${PLAYER_BOTTOM_POS - 2}px`, // 地板線
        left: '0px',
        width: '100%',
        height: '2px',
        backgroundColor: '#333',
    };
    
    const scoreStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#555',
    };

    const gameOverStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'red',
        fontSize: '24px',
        fontFamily: 'monospace',
        textAlign: 'center',
    };

    const instructionsStyle = {
        ...gameOverStyle,
        color: '#777',
        fontSize: '16px',
    };

    // --- 渲染 (Render) ---
    return (
        <div style={{ padding: '10px', width: '100%' }}>
            <div ref={gameAreaRef} style={gameAreaStyle} tabIndex={0}>
                <div style={groundStyle} />
                <div ref={playerRef} style={playerStyle}>🦖</div>
                <div style={scoreStyle}>HI: {highScore} | {score}</div>
                
                {!isRunning && !isGameOver && (
                    <div style={instructionsStyle}>
                        點擊或按空白鍵開始
                    </div>
                )}

                {isGameOver && (
                    <div style={gameOverStyle}>
                        GAME OVER
                        <br />
                        <span style={{fontSize: '14px'}}>(點擊重玩)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DinoGame;