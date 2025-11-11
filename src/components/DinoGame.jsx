import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- 遊戲常數 ---
const GAME_SPEED = 5;         // 遊戲移動速度
const JUMP_FORCE = 12;        // 跳躍力道
const GRAVITY = 0.8;          // 重力
const OBSTACLE_INTERVAL_MIN = 800;  // 障礙物出現最小間隔 (毫秒)
const OBSTACLE_INTERVAL_MAX = 2000; // 障礙物出現最大間隔 (毫秒)
const PLAYER_BOTTOM_POS = 10; // 玩家距離地上的高度

// --- 圖片和尺寸常數 ---
const DINO_IMG_SRC = '/images/side_windup.png';      
const CACTUS_IMG_SRC = '/images/gray_dog.png';  

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const OBSTACLE_WIDTH = 20; 
const OBSTACLE_HEIGHT = 40;

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
        
        const obstacleEl = document.createElement('img');
        obstacleEl.src = CACTUS_IMG_SRC;
        obstacleEl.alt = 'Obstacle';
        
        obstacleEl.className = `absolute select-none`;
        obstacleEl.style.bottom = `${PLAYER_BOTTOM_POS}px`;
        obstacleEl.style.width = `${OBSTACLE_WIDTH}px`;
        obstacleEl.style.height = `${OBSTACLE_HEIGHT}px`;

        const gameAreaWidth = gameAreaRef.current.clientWidth;
        const x = gameAreaWidth; // 從最右邊開始
        obstacleEl.style.transform = `translateX(${x}px)`;

        gameAreaRef.current.appendChild(obstacleEl);
        obstacles.current.push({ element: obstacleEl, x: x, scored: false });
    };

    // 遊戲主循環 (Game Loop)
    const gameLoop = useCallback(() => {
        // --- DEBUG ---
        console.log('Game Loop Running');
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
                // --- DEBUG ---
                console.log('Collision Detected!');

                // --- 遊戲結束 ---
                setIsGameOver(true);
                setIsRunning(false);

                setHighScore(prevHighScore => Math.max(prevHighScore, scoreRef.current));
                
                cancelAnimationFrame(gameLoopRef.current);
                return;
            }

            // 檢查障礙物的右邊界是否已經超過玩家的左邊界
            if (!ob.scored && obRect.right < playerRect.left) {
                // --- DEBUG ---
                console.log('Score!');
                ob.scored = true;
                scoreRef.current += 10;
                setScore(scoreRef.current);
            }

            // 移除螢幕外的障礙物 (使用 -50 確保完全移出)
            if (ob.x < -50) {
                ob.element.remove();
                obstacles.current.splice(i, 1);
            }
        }

        // 3. 產生新的障礙物
        obstacleTimerRef.current -= 16; // 假設 60fps
        if (obstacleTimerRef.current <= 0) {
            createObstacle();
            obstacleTimerRef.current = Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN;
        }

        // 4. 請求下一幀
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        
    }, []); // 保持 empty dependency array

    // 處理跳躍
    const handleJump = useCallback(() => {
        // --- DEBUG ---
        console.log('Jump!');
        if (playerY.current === PLAYER_BOTTOM_POS) { // 只能在地上時跳躍
            playerVel.current = JUMP_FORCE;
        }
    }, []);

    // 開始/重新開始遊戲
    const startGame = useCallback(() => {
        console.log('Game Start! Setting state.');

        setIsGameOver(false);
        setScore(0);
        scoreRef.current = 0;
        playerY.current = PLAYER_BOTTOM_POS;
        playerVel.current = 0;
        
        obstacles.current.forEach(ob => ob.element.remove());
        obstacles.current = [];
        
        obstacleTimerRef.current = OBSTACLE_INTERVAL_MIN;
        setIsRunning(true);
        
    }, []);

    // --- 設定事件監聽 ---
    useEffect(() => {
        if (isRunning) {
            // --- DEBUG ---
            console.log('useEffect[isRunning]: isRunning is true, starting loop.');
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            // --- DEBUG ---
            console.log('useEffect[isRunning]: Cleanup! Canceling frame.');
            cancelAnimationFrame(gameLoopRef.current);
        };
    }, [isRunning, gameLoop]); 


    useEffect(() => {
        const onJump = (e) => {
            e.preventDefault();
            if (isRunning) {
                handleJump();
            } else {
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
            gameAreaNode.addEventListener('mousedown', onJump);
            gameAreaNode.addEventListener('touchstart', onJump);
            document.addEventListener('keydown', onKeyDown);
        }

        return () => {
            if (gameAreaNode) {
                gameAreaNode.removeEventListener('mousedown', onJump);
                gameAreaNode.removeEventListener('touchstart', onJump);
            }
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isRunning, handleJump, startGame]);

    return (
        <div className="p-2.5 w-full">
            {/* 遊戲區域 */}
            <div 
                ref={gameAreaRef} 
                className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer select-none touch-manipulation bg-gray-100 focus:outline-none"
                tabIndex={0} // 讓 div 可以被 focus 以接收鍵盤事件
            >
                {/* 地板線 */}
                <div 
                    className="absolute left-0 w-full h-[2px] bg-gray-800"
                    style={{ bottom: `${PLAYER_BOTTOM_POS - 2}px` }} // 位置依賴常數
                />
                
                {/* 玩家 */}
                <img
                    ref={playerRef}
                    src={DINO_IMG_SRC}
                    alt="Dino"
                    className="absolute left-[20px] select-none object-contain"
                    style={{
                        bottom: `${PLAYER_BOTTOM_POS}px`,
                        width: `${PLAYER_WIDTH}px`,
                        height: `${PLAYER_HEIGHT}px`,
                    }}
                />

                {/* 分數 */}
                <div className="absolute top-2.5 right-2.5 text-xl font-mono text-gray-600">
                    HI: {highScore} | {score}
                </div>
                
                {/* 遊戲開始提示 */}
                {!isRunning && !isGameOver && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-gray-500 text-center">
                        點擊或按空白鍵開始
                    </div>
                )}

                {/* 遊戲結束提示 */}
                {isGameOver && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-mono text-red-500 text-center font-bold">
                        GAME OVER
                        <br />
                        <span className="text-sm font-normal">(點擊重玩)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DinoGame;