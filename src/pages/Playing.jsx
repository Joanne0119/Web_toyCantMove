import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import TapController from '@/components/controllers/TapController';


const Playing = () => {
    const navigate = useNavigate();

    const { localPlayer, webRTC, connectionStatus, gyroscope, gyroscopeStatus, screenWakeLock, unityPeerId, level, gameScene, spyData } = useGame();
    const inputType = level?.inputType || 'gyro';

    // 判斷是否為 Toybox 關卡
    const isToybox = level?.sceneName?.includes('Toybox') || level?.sceneName?.includes('toybox');
    const { lastMessage, sendData: sendWebRTCData, dataChannelConnections } = webRTC;
    const { isCalibrated, coordinates, isInitialized } = gyroscopeStatus;
    const { calibrate: calibrateGyroscope } = gyroscope;

    // 抓壞人專用的防呆狀態
    const [hasSubmittedNumber, setHasSubmittedNumber] = useState(false);
    const [hasSubmittedVote, setHasSubmittedVote] = useState(false);

    const [hasSelectedOne, setHasSelectedOne] = useState(false);
    const [hasSelectedFive, setHasSelectedFive] = useState(false);

    // 當回合或階段改變時，重置按鈕狀態
    useEffect(() => {
        if (spyData?.phase === 'selecting') setHasSubmittedNumber(false);
        if (spyData?.phase === 'voting') setHasSubmittedVote(false);
    }, [spyData?.roundIndex, spyData?.phase]);

    // 發送數字的函式
    const handleSubmitNumber = useCallback((num) => {
        if (hasSubmittedNumber || !connectionStatus) return;
        setHasSubmittedNumber(true);
        if (spyData?.role === 'BadGuy') {
            if (num === 1) setHasSelectedOne(true);
            if (num === 5) setHasSelectedFive(true);
        }

        const msg = JSON.stringify({ type: "submit_number", number: num });
        sendWebRTCData(msg, unityPeerId || null);
    }, [hasSubmittedNumber, connectionStatus, sendWebRTCData, unityPeerId]);

    const isButtonDisabledBySpyRule = (num) => {
        if (spyData?.role !== 'BadGuy') return false;

        // 0 到 4 分別代表第 1 到 5 輪
        const currentRound = spyData?.roundIndex || 0;
        // 包含本輪還剩幾次機會選擇
        const roundsLeft = 5 - currentRound;

        let missingTargets = [];
        if (!hasSelectedOne) missingTargets.push(1);
        if (!hasSelectedFive) missingTargets.push(5);

        // 如果剩餘的輪數「剛好等於」還沒選的任務目標數量，且此按鈕不在未完成名單中，就必須禁用它
        if (roundsLeft === missingTargets.length && !missingTargets.includes(num)) {
            return true;
        }
        return false;
    };

    // 發送投票的函式
    const handleSubmitVote = useCallback((pid) => {
        if (hasSubmittedVote || !connectionStatus) return;
        setHasSubmittedVote(true);
        const msg = JSON.stringify({ type: "submit_vote", votedTargetId: pid });
        sendWebRTCData(msg, unityPeerId || null);
    }, [hasSubmittedVote, connectionStatus, sendWebRTCData, unityPeerId]);

    // --- Game State ---
    const GAME_SPEED = 4;

    const springConfig = { stiffness: 300, damping: 30 };
    const smoothX = useSpring(50, springConfig);
    const smoothY = useSpring(50, springConfig);

    const transformedX = useTransform(smoothX, (v) => `calc(${v}% - 16px)`);
    const transformedY = useTransform(smoothY, (v) => `calc(${v}% - 16px)`);

    const rotation = useSpring(0, { stiffness: 300, damping: 30 });

    // Manual Controller Handlers
    const joystickBaseRef = useRef(null);
    const knobX = useMotionValue(0);
    const knobY = useMotionValue(0);
    const isDraggingRef = useRef(false);
    const sendIntervalRef = useRef(null);
    const currentVectorRef = useRef({ x: 0, y: 0 });

    // 按壓按鈕狀態（用於繪圖）
    const [isPressing, setIsPressing] = useState(false);
    const isPressingRef = useRef(false);  // 用於 interval 內讀取最新狀態

    // screen wake lock
    useEffect(() => {
        if (screenWakeLock) {
            screenWakeLock.request();
        }
    }, [screenWakeLock]);

    useEffect(() => {
        if (gameScene === 'ReturnToLobby') {
            navigate('/waiting-room');
        }
    }, [gameScene, navigate]);

    useEffect(() => {
        const updateRotation = () => {
            const vx = smoothX.getVelocity();
            const vy = smoothY.getVelocity();

            if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
                const newAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
                rotation.set(newAngle);
            }
        };

        const unsubscribeX = smoothX.onChange(updateRotation);
        const unsubscribeY = smoothY.onChange(updateRotation);

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [smoothX, smoothY, rotation]);


    // Effect to handle incoming WebRTC messages for game control
    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage.message);
                if ((data.type === "move" || data.type === "manualMove") && data.vector) {
                    const newX = smoothX.get() + (data.vector.x * GAME_SPEED);
                    const newY = smoothY.get() - (data.vector.y * GAME_SPEED);

                    smoothX.set(Math.max(0, Math.min(100, newX)));
                    smoothY.set(Math.max(0, Math.min(100, newY)));
                }
                if (data.type === 'terminate') {
                    navigate('/award');
                }
            } catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        }
    }, [lastMessage, GAME_SPEED, smoothX, smoothY]);

    // 上次發送時間
    const lastSentTimeRef = useRef(0);
    // 上次方向
    const lastVectorRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // 只有在 1. 陀螺儀可用 且 2. 手指 "沒有" 放在搖桿上時 才運作
        console.log(`Gyro Effect: isInitialized=${isInitialized}, isDragging=${isDraggingRef.current}`);
        if (isInitialized && !isDraggingRef.current) {

            console.log(`Gyro Effect: Running. Coords: { x: ${coordinates.x}, y: ${coordinates.y} }`);
            const vector = { x: coordinates.x, y: -coordinates.y };
            const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

            let finalVector = vector;
            if (magnitude < 0.08) {
                finalVector = { x: 0, y: 0 };
            }

            if (joystickBaseRef.current) {
                const baseRect = joystickBaseRef.current.getBoundingClientRect();
                const baseRadius = baseRect.width / 2;

                const knobRadius = baseRect.width / 3 / 2;
                const maxDistance = baseRadius - knobRadius;

                const visualKnobX = finalVector.x * maxDistance;
                const visualKnobY = -finalVector.y * maxDistance;

                console.log(`Gyro Effect: Setting Knobs -> { x: ${visualKnobX}, y: ${visualKnobY} }`);

                knobX.set(visualKnobX);
                knobY.set(visualKnobY);
            }

            if (magnitude < 0.08) return;

            if (!connectionStatus || !isCalibrated) return;

            const now = Date.now();
            if (now - lastSentTimeRef.current < 50) {
                console.log("Gyro Effect: Throttled (too fast).");
                return;
            }
            lastSentTimeRef.current = now;

            console.log(`%Gyro Effect: SENDING SIGNAL { x: ${vector.x}, y: ${vector.y}, is_press: ${isPressingRef.current} }`, "color: blue; font-weight: bold;");

            const newX = smoothX.get() + (vector.x * GAME_SPEED);
            const newY = smoothY.get() - (vector.y * GAME_SPEED);
            smoothX.set(Math.max(0, Math.min(100, newX)));
            smoothY.set(Math.max(0, Math.min(100, newY)));

            const msg = JSON.stringify({ type: 'move', vector, is_press: isPressingRef.current });
            sendWebRTCData(msg, unityPeerId || null);
        }
    }, [
        coordinates,
        connectionStatus,
        isCalibrated,
        isInitialized,
        sendWebRTCData,
        GAME_SPEED,
        smoothX,
        smoothY,
        knobX,
        knobY,
        unityPeerId
    ]);

    const sendManualMove = useCallback((vector) => {
        if (connectionStatus && dataChannelConnections.length > 0) {
            const msg = JSON.stringify({ type: "move", vector, is_press: isPressingRef.current });
            sendWebRTCData(msg, unityPeerId || null);
        }
    }, [connectionStatus, dataChannelConnections, sendWebRTCData, unityPeerId]);

    const startSendingLoop = useCallback(() => {
        if (sendIntervalRef.current) return;

        sendIntervalRef.current = setInterval(() => {
            const vector = currentVectorRef.current;
            sendManualMove(vector);
            const newX = smoothX.get() + (vector.x * GAME_SPEED);
            const newY = smoothY.get() - (vector.y * GAME_SPEED);
            smoothX.set(Math.max(0, Math.min(100, newX)));
            smoothY.set(Math.max(0, Math.min(100, newY)));

        }, 100);
    }, [sendManualMove, smoothX, smoothY, GAME_SPEED]);

    const stopSendingLoop = useCallback(() => {
        if (sendIntervalRef.current) {
            clearInterval(sendIntervalRef.current);
            sendIntervalRef.current = null;
        }
        sendManualMove({ x: 0, y: 0 });
        currentVectorRef.current = { x: 0, y: 0 };
    }, [sendManualMove]);

    const updateJoystick = useCallback((clientX, clientY) => {
        if (!joystickBaseRef.current) return;

        const baseRect = joystickBaseRef.current.getBoundingClientRect();
        const baseRadius = baseRect.width / 2;
        const knobRadius = baseRect.width / 3 / 2;

        // 滾球中心點能移動的最大距離
        const maxDistance = baseRadius - knobRadius;

        const centerX = baseRect.left + baseRadius;
        const centerY = baseRect.top + baseRadius;

        // 計算點擊位置相對於中心的 delta
        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        let clampedX = dx;
        let clampedY = dy;

        // 如果拖曳距離超過最大範圍，就限制它
        if (distance > maxDistance) {
            clampedX = Math.cos(angle) * maxDistance;
            clampedY = Math.sin(angle) * maxDistance;
        }

        // 更新 UI
        knobX.set(clampedX);
        knobY.set(clampedY);

        // 計算並儲存標準化 (normalized) 向量 (-1 到 +1)
        // 上為正
        currentVectorRef.current = {
            x: clampedX / maxDistance,
            y: -(clampedY / maxDistance)
        };

    }, [knobX, knobY]);

    // 處理 Pointer 事件
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        updateJoystick(e.clientX, e.clientY);
        startSendingLoop();
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    }, [updateJoystick, startSendingLoop]);

    const handlePointerMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        updateJoystick(e.clientX, e.clientY);
    }, [updateJoystick]);

    const handlePointerUp = useCallback((e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        isDraggingRef.current = false;

        // 滾球歸位
        knobX.set(0);
        knobY.set(0);

        stopSendingLoop();

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
    }, [knobX, knobY, stopSendingLoop]);

    // 按壓按鈕事件處理（ColorPaper 按住繪圖）
    const handlePressStart = useCallback((e) => {
        e.preventDefault();
        setIsPressing(true);
        isPressingRef.current = true;
    }, []);

    const handlePressEnd = useCallback((e) => {
        e.preventDefault();
        setIsPressing(false);
        isPressingRef.current = false;
    }, []);

    // 點擊技能按鈕（Toybox 點一下觸發）
    const skillCooldownRef = useRef(false);
    const handleSkillTap = useCallback((e) => {
        e.preventDefault();
        if (skillCooldownRef.current) return;
        skillCooldownRef.current = true;
        setIsPressing(true);
        isPressingRef.current = true;

        // 立刻送一個帶 is_press: true 的 move 訊息
        if (connectionStatus) {
            const vector = { x: 0, y: 0 };
            const msg = JSON.stringify({ type: 'move', vector, is_press: true });
            sendWebRTCData(msg, unityPeerId || null);
        }

        // 短暫觸發後自動恢復
        setTimeout(() => {
            setIsPressing(false);
            isPressingRef.current = false;
            skillCooldownRef.current = false;
            // 送 is_press: false
            if (connectionStatus) {
                const vector = { x: 0, y: 0 };
                const msg = JSON.stringify({ type: 'move', vector, is_press: false });
                sendWebRTCData(msg, unityPeerId || null);
            }
        }, 300);
    }, [connectionStatus, sendWebRTCData, unityPeerId]);

    // 非陀螺儀關卡渲染對應控制器
    if (inputType === 'tap') {
        return <TapController />;
    }

    if (inputType === 'spy') {
        const isBadGuy = spyData?.role === 'BadGuy';

        return (
            <div className="relative w-screen min-h-screen flex flex-col safe-area-bottom select-none overflow-hidden" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
                <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(3px) saturate(80%)' }}></div> {/* */}

                <div className="flex-1 flex flex-col items-center justify-center px-4 z-10">
                    <motion.div className="card bg-base-100 shadow-xl w-full max-w-sm" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="card-body items-center text-center p-6"> {/* */}

                            {/* 身分顯示區 */}
                            <div className="mb-4">
                                <h2 className="text-sm text-base-content/60 font-bold mb-1">你的身分</h2> {/* */}
                                {spyData.role ? (
                                    <h1 className={`text-3xl font-extrabold ${isBadGuy ? 'text-error' : 'text-info'}`}>
                                        {isBadGuy ? '【我是壞人】' : '我是好人'}
                                    </h1>
                                ) : (
                                    <h1 className="text-xl font-bold text-base-content/50">分配中...</h1>
                                )}
                            </div>

                            {/* 🌟 4. 壞人秘密任務專屬提示訊息 UI */}
                            {isBadGuy && (
                                <div className="w-full bg-error/10 border border-error/20 rounded-xl p-3 mb-2 text-left text-xs space-y-1">
                                    <p className="font-extrabold text-error flex items-center gap-1">壞人限制：</p>
                                    <p className="text-base-content/80 font-medium">在 5 輪遊戲結束前，必須選擇過數字 <span className="font-bold text-error">1</span> 與 <span className="font-bold text-error">5</span> 各至少一次！</p>
                                    <div className="flex gap-4 pt-1 font-bold">
                                        <span className={hasSelectedOne ? "text-success" : "text-base-content/40"}>
                                            {hasSelectedOne ? "✅ 數字 1 (已達成)" : "❌ 數字 1 (未達成)"}
                                        </span>
                                        <span className={hasSelectedFive ? "text-success" : "text-base-content/40"}>
                                            {hasSelectedFive ? "✅ 數字 5 (已達成)" : "❌ 數字 5 (未達成)"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="divider my-0"></div> {/* */}

                            {/* 狀態提示文字 */}
                            <p className="text-lg font-bold my-4"> {/* */}
                                {hasSubmittedNumber && spyData.phase === 'selecting'
                                    ? '已選擇，等待其他人...'
                                    : hasSubmittedVote && spyData.phase === 'voting'
                                        ? '已投票，可查看遊戲螢幕開票結果'
                                        : spyData.statusText} {/* */}
                            </p>

                            {/* 階段 1：選數字 (5顆按鈕) */}
                            {spyData.phase === 'selecting' && !hasSubmittedNumber && (
                                <div className="w-full">
                                    <p className="text-sm mb-3">目標區間: {spyData.minTarget} ~ {spyData.maxTarget}</p> {/* */}
                                    <div className="grid grid-cols-3 gap-3"> {/* */}
                                        {[1, 2, 3, 4, 5].map(num => {
                                            // 🌟 5. 計算此按鈕是否該被規則強制鎖定
                                            const isForcedDisabled = isButtonDisabledBySpyRule(num);
                                            return (
                                                <motion.button
                                                    key={`num-${num}`}
                                                    whileTap={!isForcedDisabled ? { scale: 0.9 } : {}}
                                                    onClick={() => handleSubmitNumber(num)}
                                                    className={`btn btn-lg ${isBadGuy ? 'btn-error' : 'btn-info'}`}
                                                    disabled={isForcedDisabled}
                                                >
                                                    <span className="text-2xl">{num}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 階段 2：最後投票 (4顆按鈕) */}
                            {spyData?.phase === 'voting' && !hasSubmittedVote && (
                                <div className="w-full grid grid-cols-2 gap-3">
                                    {[0, 1, 2, 3].map(pid => (
                                        <motion.button
                                            key={`vote-${pid}`}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleSubmitVote(pid)}
                                            className="btn btn-outline border-2 h-auto py-3"
                                        // disabled={pid === spyData?.myPlayerId} // 不讓玩家投給自己
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm">投給</span>

                                                {/*  利用陣列索引 pid 去撈取對應的暱稱 */}
                                                <span className="text-xl font-bold">
                                                    {spyData?.playerNames?.[pid] || `Player ${pid}`}
                                                </span>

                                                {pid === spyData.myPlayerId && <span className="text-xs mt-1 text-base-content/40">(你)</span>}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // 陀螺儀關卡（原有邏輯）
    return (
        <div className="relative w-screen min-h-screen flex flex-col safe-area-bottom" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
            <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>

            {/* 上方區域：搖桿 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 z-10">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        duration: 0.8
                    }}
                    className={`btn btn-sm btn-primary text-base mb-4 ${isInitialized ? 'visible' : 'invisible'}`}
                    onClick={calibrateGyroscope}
                    disabled={!isInitialized}
                >
                    重新校正
                </motion.button>

                <motion.div
                    className="card bg-base-100 shadow-xl px-6 py-2"
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        duration: 0.8,
                        delay: 0.3
                    }}
                >
                    <div className="card-body items-center text-center py-4">
                        <h2 className="card-title">控制器</h2>

                        <div className="flex flex-col justify-center items-center w-full select-none mt-4">
                            {/* 搖桿 */}
                            <div
                                ref={joystickBaseRef}
                                className="relative w-52 h-52 bg-primary/20 rounded-full flex items-center justify-center text-primary-content/40"
                                style={{ touchAction: 'none' }}
                                onPointerDown={handlePointerDown}
                            >
                                <svg className="w-6 h-6 absolute top-5 left-1/2 -translate-x-1/2" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                                <svg className="w-6 h-6 absolute right-5 top-1/2 -translate-y-1/2 rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                                <svg className="w-6 h-6 absolute bottom-5 left-1/2 -translate-x-1/2 rotate-180" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                                <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 -rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>

                                <motion.div
                                    className="w-20 h-20 cursor-grab"
                                    style={{
                                        x: knobX,
                                        y: knobY,
                                        backgroundImage: `url(${localPlayer.color
                                            ? `/images/${localPlayer.color}_${localPlayer.avatar || 'wind-up'}Pin.png`
                                            : `/images/gray_${localPlayer.avatar || 'wind-up'}Pin.png`
                                            })`,
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                    whileTap={{ cursor: 'grabbing' }}
                                    rotate={rotation}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 下方獨立區塊：技能/繪圖按鈕 */}
            <motion.div
                className="w-full px-4 z-20 flex items-center justify-center transition-all duration-150"
                style={{
                    touchAction: 'none',
                    backdropFilter: 'blur(10px)',
                    borderTopLeftRadius: '1.5rem',
                    borderTopRightRadius: '1.5rem',
                    minHeight: '30vh',
                    paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                    paddingTop: '1.5rem',
                    backgroundColor: isPressing
                        ? ({ red: 'rgba(239,68,68,0.8)', blue: 'rgba(59,130,246,0.8)', green: 'rgba(34,197,94,0.8)', yellow: 'rgba(234,179,8,0.8)' }[localPlayer.color] || 'rgba(0,0,0,0.6)')
                        : 'rgba(0,0,0,0.4)',
                }}
                {...(isToybox
                    ? { onClick: handleSkillTap }
                    : {
                        onPointerDown: handlePressStart,
                        onPointerUp: handlePressEnd,
                        onPointerLeave: handlePressEnd,
                        onPointerCancel: handlePressEnd,
                    }
                )}
            >
                <div className="flex items-center gap-3 text-white">
                    {isToybox ? (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 10h7l-9 13v-9H4l9-13v9z" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1 11 20.173l7.071-7.071L11 6.029z" />
                        </svg>
                    )}
                    <span className="text-lg font-bold">
                        {isToybox
                            ? (isPressing ? '使用中...' : '點擊使用技能')
                            : (isPressing ? '繪圖中...' : '按住繪圖')
                        }
                    </span>
                </div>
            </motion.div>
        </div>
    )
}

export default Playing;
